import { NextRequest } from "next/server";
import { connectToDB } from "@/utilis/connectToDb";
import User from "@/utilis/models/User";
import { formatUser, getMobileUser, jsonResponse } from "@/utilis/mobileAuth";

export async function PATCH(req: NextRequest) {
  try {
    const user = await getMobileUser(req);
    if (!user) {
      return jsonResponse(false, "Unauthorized. Please sign in again.", null, 401);
    }

    const body = await req.json();
    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();

    if (!firstName || !lastName) {
      return jsonResponse(false, "First and last name are required.", null, 400);
    }

    if (firstName.length > 50 || lastName.length > 50) {
      return jsonResponse(false, "Names must be 50 characters or less.", null, 400);
    }

    await connectToDB();

    const updated = await User.findByIdAndUpdate(
      user._id,
      { firstName, lastName },
      { new: true }
    );

    return jsonResponse(true, "Profile updated successfully.", formatUser(updated));
  } catch (error) {
    console.error("Mobile profile update error:", error);
    return jsonResponse(false, "Something went wrong. Please try again.", null, 500);
  }
}