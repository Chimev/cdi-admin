import { NextRequest } from "next/server";
import { Expo } from "expo-server-sdk";
import { connectToDB } from "@/utilis/connectToDb";
import User from "@/utilis/models/User";
import { getMobileUser, jsonResponse } from "@/utilis/mobileAuth";

export async function POST(req: NextRequest) {
  try {
    const user = await getMobileUser(req);
    if (!user) {
      return jsonResponse(false, "Unauthorized. Please sign in again.", null, 401);
    }

    const body = await req.json();
    const token = String(body.token ?? "");

    if (!Expo.isExpoPushToken(token)) {
      return jsonResponse(false, "Invalid push token.", null, 400);
    }

    await connectToDB();

    // If this phone was used by another account before, detach it from them
    await User.updateMany(
      { pushTokens: token, _id: { $ne: user._id } },
      { $pull: { pushTokens: token } }
    );

    await User.findByIdAndUpdate(user._id, { $addToSet: { pushTokens: token } });

    return jsonResponse(true, "Push token saved.");
  } catch (error) {
    console.error("Save push token error:", error);
    return jsonResponse(false, "Something went wrong. Please try again.", null, 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getMobileUser(req);
    if (!user) {
      return jsonResponse(false, "Unauthorized. Please sign in again.", null, 401);
    }

    const body = await req.json();
    const token = String(body.token ?? "");

    await connectToDB();
    await User.findByIdAndUpdate(user._id, { $pull: { pushTokens: token } });

    return jsonResponse(true, "Push token removed.");
  } catch (error) {
    console.error("Remove push token error:", error);
    return jsonResponse(false, "Something went wrong. Please try again.", null, 500);
  }
}