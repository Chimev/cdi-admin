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
      return jsonResponse(false, "Edition not found.", null, 404);
    }

    await connectToDB();

    const edition: any = await SfdEdition.findOne({ _id: id, isPublished: true })
      .select("title theme startMonth endMonth year coverImage.url price")
      .lean();

    if (!edition) {
      return jsonResponse(false, "Edition not found.", null, 404);
    }

    const [isUnlocked, days] = await Promise.all([
      hasEditionAccess(user, edition._id),
      SfdContent.find({ editionId: edition._id })
        .sort({ date: 1 })
        .select("date topic")
        .lean(),
    ]);

    return jsonResponse(true, "Edition fetched successfully.", {
      edition: {
        _id: edition._id.toString(),
        title: edition.title,
        theme: edition.theme,
        startMonth: edition.startMonth,
        endMonth: edition.endMonth,
        year: edition.year,
        coverImage: edition.coverImage?.url,
        price: edition.price,
      },
      isUnlocked,
      days: days.map((d: any) => ({
        _id: d._id.toString(),
        date: d.date,
        topic: d.topic,
      })),
    });
  } catch (error) {
    console.error("Mobile SFD edition error:", error);
    return jsonResponse(false, "Something went wrong. Please try again.", null, 500);
  }
}