import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectToDB } from "@/utilis/connectToDb";
import Event from "@/utilis/models/Event";
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
      return jsonResponse(false, "Event not found.", null, 404);
    }

    await connectToDB();

    const event: any = await Event.findOne({ _id: id, status: "published" }).lean();

    if (!event) {
      return jsonResponse(false, "Event not found.", null, 404);
    }

    return jsonResponse(true, "Event fetched successfully.", {
      _id: event._id.toString(),
      name: event.name,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      description: event.description,
      image: event.image?.url ?? null,
      externalLink: event.externalLink,
    });
  } catch (error) {
    console.error("Mobile event detail error:", error);
    return jsonResponse(false, "Something went wrong. Please try again.", null, 500);
  }
}