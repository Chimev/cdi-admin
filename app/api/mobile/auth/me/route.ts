import { NextRequest } from "next/server";
import { formatUser, getMobileUser, jsonResponse } from "@/utilis/mobileAuth";

export async function GET(req: NextRequest) {
  try {
    const user = await getMobileUser(req);

    if (!user) {
      return jsonResponse(false, "Unauthorized. Please sign in again.", null, 401);
    }

    return jsonResponse(true, "User fetched successfully.", formatUser(user));
  } catch (error) {
    console.error("Mobile me error:", error);
    return jsonResponse(false, "Something went wrong. Please try again.", null, 500);
  }
}