import { NextRequest } from "next/server";
import { connectToDB } from "@/utilis/connectToDb";
import SfdContent from "@/utilis/models/SfdContent";
import SfdEdition from "@/utilis/models/SfdEdition";
import { getMobileUser, jsonResponse } from "@/utilis/mobileAuth";
import { getDateString, getDayRange, hasEditionAccess } from "@/utilis/sfdAccess";

export async function GET(req: NextRequest) {
  try {
    const user = await getMobileUser(req);
    if (!user) {
      return jsonResponse(false, "Unauthorized. Please sign in again.", null, 401);
    }

    const { searchParams } = new URL(req.url);
    const today = getDateString(searchParams.get("date"));
    const { start, end } = getDayRange(today);

    await connectToDB();

    const reading: any = await SfdContent.findOne({
      date: { $gte: start, $lt: end },
    })
      .select("editionId date topic subStatement")
      .lean();

    const empty = { today, reading: null, edition: null, isUnlocked: false };

    if (!reading) {
      return jsonResponse(true, "No reading for today.", empty);
    }

    const edition: any = await SfdEdition.findOne({
      _id: reading.editionId,
      isPublished: true,
    })
      .select("title theme coverImage.url price")
      .lean();

    if (!edition) {
      return jsonResponse(true, "No reading for today.", empty);
    }

    const isUnlocked = await hasEditionAccess(user, edition._id);

    return jsonResponse(true, "Today's reading fetched successfully.", {
      today,
      reading: {
        _id: reading._id.toString(),
        date: reading.date,
        topic: reading.topic,
        subStatement: reading.subStatement,
      },
      edition: {
        _id: edition._id.toString(),
        title: edition.title,
        theme: edition.theme,
        coverImage: edition.coverImage?.url,
        price: edition.price,
      },
      isUnlocked,
    });
  } catch (error) {
    console.error("Mobile SFD today error:", error);
    return jsonResponse(false, "Something went wrong. Please try again.", null, 500);
  }
}