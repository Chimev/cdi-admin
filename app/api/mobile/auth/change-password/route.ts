import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
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
    const currentPassword = String(body.currentPassword ?? "");
    const newPassword = String(body.newPassword ?? "");

    if (!currentPassword || !newPassword) {
      return jsonResponse(false, "Please fill in all fields.", null, 400);
    }

    if (newPassword.length < 6) {
      return jsonResponse(false, "New password must be at least 6 characters.", null, 400);
    }

    await connectToDB();

    // getMobileUser leaves out the password, so fetch it here
    const dbUser = await User.findById(user._id);
    if (!dbUser) {
      return jsonResponse(false, "Account not found.", null, 404);
    }

    const isValid = await bcrypt.compare(currentPassword, dbUser.password);
    if (!isValid) {
      return jsonResponse(false, "Your current password is incorrect.", null, 400);
    }

    const isSame = await bcrypt.compare(newPassword, dbUser.password);
    if (isSame) {
      return jsonResponse(false, "New password must be different from your current one.", null, 400);
    }

    dbUser.password = await bcrypt.hash(newPassword, 10);
    await dbUser.save();

    return jsonResponse(true, "Password changed successfully.");
  } catch (error) {
    console.error("Mobile change password error:", error);
    return jsonResponse(false, "Something went wrong. Please try again.", null, 500);
  }
}