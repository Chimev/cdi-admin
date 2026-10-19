import { NextRequest } from "next/server";
import { connectToDB } from "@/utilis/connectToDb";
import Testimony from "@/utilis/models/Testimony";
import { getMobileUser, jsonResponse } from "@/utilis/mobileAuth";

const PREVIEW_LENGTH = 150;

export async function GET(req: NextRequest) {
  try {
    const user = await getMobileUser(req);
    if (!user) {
      return jsonResponse(false, "Unauthorized. Please sign in again.", null, 401);
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(20, Math.max(1, Number(searchParams.get("limit")) || 10));
    const skip = (page - 1) * limit;

    await connectToDB();

    const [testimonies, total] = await Promise.all([
      Testimony.find()
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .select("title author body createdAt")
        .lean(),
      Testimony.countDocuments(),
    ]);

    const items = testimonies.map((t: any) => ({
      _id: t._id.toString(),
      title: t.title,
      author: t.author,
      preview:
        t.body.length > PREVIEW_LENGTH
          ? t.body.slice(0, PREVIEW_LENGTH).trim() + "..."
          : t.body,
      createdAt: t.createdAt,
    }));

    return jsonResponse(true, "Testimonies fetched successfully.", {
      testimonies: items,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + items.length < total,
      },
    });
  } catch (error) {
    console.error("Mobile testimonies error:", error);
    return jsonResponse(false, "Something went wrong. Please try again.", null, 500);
  }
}