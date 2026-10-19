import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectToDB } from "@/utilis/connectToDb";
import Testimony from "@/utilis/models/Testimony";
import { getMobileUser, jsonResponse } from "@/utilis/mobileAuth";

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
      return jsonResponse(false, "Testimony not found.", null, 404);
    }

    await connectToDB();

    const testimony = await Testimony.findById(id)
      .select("title author body createdAt")
      .lean();

    if (!testimony) {
      return jsonResponse(false, "Testimony not found.", null, 404);
    }

    return jsonResponse(true, "Testimony fetched successfully.", testimony);
  } catch (error) {
    console.error("Mobile testimony detail error:", error);
    return jsonResponse(false, "Something went wrong. Please try again.", null, 500);
  }
}