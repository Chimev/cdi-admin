import { NextRequest } from "next/server";
import { connectToDB } from "@/utilis/connectToDb";
import PrayerSlot from "@/utilis/models/PrayerSlot";
import User from "@/utilis/models/User";
import { getMobileUser, jsonResponse } from "@/utilis/mobileAuth";

export async function PATCH(req: NextRequest) {
  try {
    const user = await getMobileUser(req);
    if (!user) {
      return jsonResponse(false, "Unauthorized. Please sign in again.", null, 401);
    }

    const body = await req.json();

    // null removes the watch; otherwise it must be a slot ID like "6-30"
    const slotId = body.slotId === null ? null : String(body.slotId ?? "").trim();

    if (slotId === "") {
      return jsonResponse(false, "Please choose a prayer watch.", null, 400);
    }

    await connectToDB();

    if (slotId) {
      const slot: any = await PrayerSlot.findOne({ slotId }).lean();
      if (!slot || !slot.link) {
        return jsonResponse(false, "This prayer watch is not available.", null, 400);
      }
    }

    await User.findByIdAndUpdate(user._id, { prayerSlotId: slotId });

    return jsonResponse(
      true,
      slotId ? "Prayer watch saved." : "Prayer watch removed.",
      { prayerSlotId: slotId }
    );
  } catch (error) {
    console.error("Mobile my-watch error:", error);
    return jsonResponse(false, "Something went wrong. Please try again.", null, 500);
  }
}