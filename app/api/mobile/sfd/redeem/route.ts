import { NextRequest } from "next/server";
import { connectToDB } from "@/utilis/connectToDb";
import AccessCode from "@/utilis/models/AccessCode";
import SfdEdition from "@/utilis/models/SfdEdition";
import { getMobileUser, jsonResponse } from "@/utilis/mobileAuth";
import { hasEditionAccess } from "@/utilis/sfdAccess";

export async function POST(req: NextRequest) {
  try {
    const user = await getMobileUser(req);
    if (!user) {
      return jsonResponse(false, "Unauthorized. Please sign in again.", null, 401);
    }

    const body = await req.json();
    const code = String(body.code ?? "").trim().toUpperCase();

    if (!code) {
      return jsonResponse(false, "Please enter an access code.", null, 400);
    }

    await connectToDB();

    const accessCode = await AccessCode.findOne({ code });

    if (!accessCode) {
      return jsonResponse(false, "Invalid access code. Please check and try again.", null, 404);
    }

    if (accessCode.status === "revoked") {
      return jsonResponse(false, "This access code is no longer valid.", null, 400);
    }

    if (accessCode.status === "used") {
      const message =
        accessCode.usedBy?.toString() === user._id.toString()
          ? "You have already redeemed this code."
          : "This access code has already been used.";
      return jsonResponse(false, message, null, 409);
    }

    if (accessCode.expiredAt < new Date()) {
      return jsonResponse(false, "This access code has expired.", null, 400);
    }

    const edition: any = await SfdEdition.findOne({
      _id: accessCode.editionId,
      isPublished: true,
    })
      .select("title")
      .lean();

    if (!edition) {
      return jsonResponse(false, "This edition is not available yet.", null, 400);
    }

    const alreadyUnlocked = await hasEditionAccess(user, accessCode.editionId);
    if (alreadyUnlocked) {
      return jsonResponse(
        false,
        "You already have access to this edition. Keep this code for someone else.",
        null,
        409
      );
    }

    // Only succeeds if the code is still active, so two people can't use it at once
    const updated = await AccessCode.findOneAndUpdate(
      { _id: accessCode._id, status: "active" },
      { status: "used", usedBy: user._id },
      { new: true }
    );

    if (!updated) {
      return jsonResponse(false, "This access code has already been used.", null, 409);
    }

    return jsonResponse(true, `${edition.title} unlocked!`, {
      editionId: edition._id.toString(),
      editionTitle: edition.title,
    });
  } catch (error) {
    console.error("Mobile SFD redeem error:", error);
    return jsonResponse(false, "Something went wrong. Please try again.", null, 500);
  }
}