import { NextRequest } from "next/server";
import { connectToDB } from "@/utilis/connectToDb";
import Event from "@/utilis/models/Event";
import { getMobileUser, jsonResponse } from "@/utilis/mobileAuth";
import { getDateString, getDayRange } from "@/utilis/sfdAccess";

export async function GET(req: NextRequest) {
  try {
    const user = await getMobileUser(req);
    if (!user) {
      return jsonResponse(false, "Unauthorized. Please sign in again.", null, 401);
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") === "past" ? "past" : "upcoming";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(20, Math.max(1, Number(searchParams.get("limit")) || 10));
    const skip = (page - 1) * limit;

    // Start of today: upcoming = today onwards, past = before today
    const { start } = getDayRange(getDateString(searchParams.get("date")));

    const filter = {
      status: "published",
      date: type === "upcoming" ? { $gte: start } : { $lt: start },
    };

    const sort: Record<string, 1 | -1> =
      type === "upcoming"
        ? { date: 1, startTime: 1, _id: 1 }
        : { date: -1, startTime: -1, _id: -1 };

    await connectToDB();

    const [events, total] = await Promise.all([
      Event.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select("name date startTime endTime location image.url")
        .lean(),
      Event.countDocuments(filter),
    ]);

    const items = events.map((e: any) => ({
      _id: e._id.toString(),
      name: e.name,
      date: e.date,
      startTime: e.startTime,
      endTime: e.endTime,
      location: e.location,
      image: e.image?.url ?? null,
    }));

    return jsonResponse(true, "Events fetched successfully.", {
      events: items,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + items.length < total,
      },
    });
  } catch (error) {
    console.error("Mobile events error:", error);
    return jsonResponse(false, "Something went wrong. Please try again.", null, 500);
  }
}