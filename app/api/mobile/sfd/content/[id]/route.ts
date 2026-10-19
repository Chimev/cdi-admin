import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectToDB } from "@/utilis/connectToDb";
import SfdContent from "@/utilis/models/SfdContent";
import SfdEdition from "@/utilis/models/SfdEdition";
import { getMobileUser, jsonResponse } from "@/utilis/mobileAuth";
import { hasEditionAccess } from "@/utilis/sfdAccess";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getMobileUser(req);
    if (!user) {
      return jsonResponse(false, "Unauthorized. Please sign in again.", null, 401);
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse(false, "Reading not found.", null, 404);
    }

    await connectToDB();

    const reading: any = await SfdContent.findById(id).lean();
    if (!reading) {
      return jsonResponse(false, "Reading not found.", null, 404);
    }

    const edition: any = await SfdEdition.findOne({
      _id: reading.editionId,
      isPublished: true,
    })
      .select("title")
      .lean();

    if (!edition) {
      return jsonResponse(false, "Reading not found.", null, 404);
    }

    const allowed = await hasEditionAccess(user, reading.editionId);
    if (!allowed) {
      return jsonResponse(
        false,
        "Unlock this edition to read this devotional.",
        { editionId: edition._id.toString() },
        403
      );
    }

    // Previous and next day in the same edition
    const [prev, next]: any[] = await Promise.all([
      SfdContent.findOne({ editionId: reading.editionId, date: { $lt: reading.date } })
        .sort({ date: -1 })
        .select("_id")
        .lean(),
      SfdContent.findOne({ editionId: reading.editionId, date: { $gt: reading.date } })
        .sort({ date: 1 })
        .select("_id")
        .lean(),
    ]);

    return jsonResponse(true, "Reading fetched successfully.", {
      _id: reading._id.toString(),
      date: reading.date,
      topic: reading.topic,
      subStatement: reading.subStatement,
      content: reading.content,
      prayer: reading.prayer,
      edition: { _id: edition._id.toString(), title: edition.title },
      prevId: prev ? prev._id.toString() : null,
      nextId: next ? next._id.toString() : null,
    });
  } catch (error) {
    console.error("Mobile SFD content error:", error);
    return jsonResponse(false, "Something went wrong. Please try again.", null, 500);
  }
}