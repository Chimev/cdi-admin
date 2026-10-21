import { NextRequest } from "next/server";
import { connectToDB } from "@/utilis/connectToDb";
import SfdEdition from "@/utilis/models/SfdEdition";
import { getMobileUser, jsonResponse } from "@/utilis/mobileAuth";
import { getDateString, getUnlockedEditionIds } from "@/utilis/sfdAccess";

export async function GET(req: NextRequest) {
  try {
    const user = await getMobileUser(req);
    if (!user) {
      return jsonResponse(false, "Unauthorized. Please sign in again.", null, 401);
    }

    await connectToDB();

    const filter: any = { isPublished: true };

    // Admins can read everything; members only see what they unlocked
    if (user.role !== "admin") {
      const ids = await getUnlockedEditionIds(user);
      filter._id = { $in: ids };
    }

    const editions = await SfdEdition.find(filter)
      .sort({ year: -1, startMonth: -1 })
      .select("title startMonth endMonth year coverImage.url")
      .lean();

    const today = getDateString(null);
    const currentYear = Number(today.slice(0, 4));
    const currentMonth = Number(today.slice(5, 7));

    const items = editions.map((e: any) => ({
      _id: e._id.toString(),
      title: e.title,
      startMonth: e.startMonth,
      endMonth: e.endMonth,
      year: e.year,
      coverImage: e.coverImage?.url,
      isCurrent:
        e.year === currentYear &&
        currentMonth >= e.startMonth &&
        currentMonth <= e.endMonth,
    }));

    return jsonResponse(true, "Your editions fetched successfully.", items);
  } catch (error) {
    console.error("Mobile my-editions error:", error);
    return jsonResponse(false, "Something went wrong. Please try again.", null, 500);
  }
}