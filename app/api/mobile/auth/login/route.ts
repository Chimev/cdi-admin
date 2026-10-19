import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDB } from "@/utilis/connectToDb";
import User from "@/utilis/models/User";
import {
  formatUser,
  jsonResponse,
  signMobileToken,
} from "@/utilis/mobileAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return jsonResponse(false, "Email and password are required.", null, 400);
    }

    await connectToDB();

    const user = await User.findOne({ email });
    if (!user) {
      return jsonResponse(false, "Invalid email or password.", null, 401);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return jsonResponse(false, "Invalid email or password.", null, 401);
    }

    const token = await signMobileToken(user._id.toString(), user.role);

    return jsonResponse(
      true, 
      "Login successful.", {
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Mobile login error:", error);
    return jsonResponse(false, "Something went wrong. Please try again.", null, 500);
  }
}