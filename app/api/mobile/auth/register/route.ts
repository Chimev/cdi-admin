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

    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!firstName || !lastName || !email || !password) {
      return jsonResponse(false, "All fields are required.", null, 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse(false, "Please enter a valid email address.", null, 400);
    }

    if (password.length < 6) {
      return jsonResponse(false, "Password must be at least 6 characters.", null, 400);
    }

    await connectToDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return jsonResponse(false, "An account with this email already exists.", null, 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "user",
    });

    const token = await signMobileToken(user._id.toString(), user.role);

    return jsonResponse(
      true,
      "Account created successfully.",
      { token, user: formatUser(user) },
      201
    );
  } catch (error) {
    console.error("Mobile register error:", error);
    return jsonResponse(false, "Something went wrong. Please try again.", null, 500);
  }
}