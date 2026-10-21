import { NextRequest } from "next/server";
import { connectToDB } from "@/utilis/connectToDb";
import PrayerSlot from "@/utilis/models/PrayerSlot";
import { getMobileUser, jsonResponse } from "@/utilis/mobileAuth";

// "6-30" -> 390 minutes after midnight, for sorting
const toMinutes = (slotId: string) => {
  const [h, m] = slotId.split("-").map(Number);
  return h * 60 + m;
};

export async function GET(req: NextRequest) {
  try {
    const user = await getMobileUser(req);
    if (!user) {
      return jsonResponse(false, "Unauthorized. Please sign in again.", null, 401);
    }

    await connectToDB();

    // Empty links don't show in the app
    const slots = await PrayerSlot.find({ link: { $ne: "" } })
      .select("slotId label link")
      .lean();

    const sorted = slots
      .map((s: any) => ({ slotId: s.slotId, label: s.label, link: s.link }))
      .sort((a, b) => toMinutes(a.slotId) - toMinutes(b.slotId));

    // If the admin removed the link for the member's watch, treat it as unset
    const myWatch = sorted.some((s) => s.slotId === user.prayerSlotId)
      ? user.prayerSlotId
      : null;

    return jsonResponse(true, "Prayer watches fetched successfully.", {
      slots: sorted,
      myWatch,
    });
  } catch (error) {
    console.error("Mobile prayer error:", error);
    return jsonResponse(false, "Something went wrong. Please try again.", null, 500);
  }
}