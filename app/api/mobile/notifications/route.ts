import { NextRequest } from "next/server";
import { connectToDB } from "@/utilis/connectToDb";
import Notification from "@/utilis/models/Notification";
import { getMobileUser, jsonResponse } from "@/utilis/mobileAuth";

export async function GET(req: NextRequest) {
  try {
    const user = await getMobileUser(req);
    if (!user) {
      return jsonResponse(false, "Unauthorized. Please sign in again.", null, 401);
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(30, Math.max(1, Number(searchParams.get("limit")) || 15));
    const skip = (page - 1) * limit;

    await connectToDB();

    // Failed sends never reached anyone, so leave them out
    const filter = { status: { $ne: "failed" } };

    const [items, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .select("title message type data createdAt")
        .lean(),
      Notification.countDocuments(filter),
    ]);

    const notifications = items.map((n: any) => ({
      _id: n._id.toString(),
      title: n.title,
      message: n.message,
      type: n.type,
      data: n.data ?? {},
      createdAt: n.createdAt,
    }));

    return jsonResponse(true, "Notifications fetched successfully.", {
      notifications,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + notifications.length < total,
      },
    });
  } catch (error) {
    console.error("Mobile notifications error:", error);
    return jsonResponse(false, "Something went wrong. Please try again.", null, 500);
  }
}