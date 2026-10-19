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

    const today = getDateString(null);
    const currentYear = Number(today.slice(0, 4));
    const currentMonth = Number(today.slice(5, 7));

    const { searchParams } = new URL(req.url);
    const year = Number(searchParams.get("year")) || currentYear;

    await connectToDB();

    const years: number[] = (
      await SfdEdition.distinct("year", { isPublished: true })
    ).sort((a: number, b: number) => b - a);

    const editions = await SfdEdition.find({ isPublished: true, year })
      .sort({ startMonth: -1 })
      .select("title theme startMonth endMonth year coverImage.url price")
      .lean();

    const unlockedIds =
      user.role === "admin" ? null : await getUnlockedEditionIds(user);

    const items = editions.map((e: any) => ({
      _id: e._id.toString(),
      title: e.title,
      theme: e.theme,
      startMonth: e.startMonth,
      endMonth: e.endMonth,
      year: e.year,
      coverImage: e.coverImage?.url,
      price: e.price,
      isUnlocked: unlockedIds === null || unlockedIds.includes(e._id.toString()),
      isCurrent:
        e.year === currentYear &&
        currentMonth >= e.startMonth &&
        currentMonth <= e.endMonth,
    }));

    return jsonResponse(true, "Editions fetched successfully.", {
      year,
      years,
      editions: items,
    });
  } catch (error) {
    console.error("Mobile SFD editions error:", error);
    return jsonResponse(false, "Something went wrong. Please try again.", null, 500);
  }
}