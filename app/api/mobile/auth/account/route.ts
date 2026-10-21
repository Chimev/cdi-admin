import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDB } from "@/utilis/connectToDb";
import User from "@/utilis/models/User";
import { getMobileUser, jsonResponse } from "@/utilis/mobileAuth";

export async function DELETE(req: NextRequest) {
  try {
    const user = await getMobileUser(req);
    if (!user) {
      return jsonResponse(false, "Unauthorized. Please sign in again.", null, 401);
    }

    if (user.role === "admin") {
      return jsonResponse(
        false,
        "Admin accounts can't be deleted from the app.",
        null,
        403
      );
    }

    const body = await req.json();
    const password = String(body.password ?? "");

    if (!password) {
      return jsonResponse(false, "Please enter your password.", null, 400);
    }

    await connectToDB();

    const dbUser = await User.findById(user._id);
    if (!dbUser) {
      return jsonResponse(false, "Account not found.", null, 404);
    }

    const isValid = await bcrypt.compare(password, dbUser.password);
    if (!isValid) {
      return jsonResponse(false, "Incorrect password.", null, 400);
    }

    await User.findByIdAndDelete(user._id);

    return jsonResponse(true, "Your account has been deleted.");
  } catch (error) {
    console.error("Mobile delete account error:", error);
    return jsonResponse(false, "Something went wrong. Please try again.", null, 500);
  }
}