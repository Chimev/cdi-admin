import { SignJWT, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/utilis/connectToDb";
import User from "@/utilis/models/User";

const secret = new TextEncoder().encode(process.env.MOBILE_JWT_SECRET);

// create the jwt
  export async function signMobileToken(userId: string, role: string) {
  return new SignJWT({ role })          // payload: put the role inside
    .setProtectedHeader({ alg: "HS256" }) // header: signing method
    .setSubject(userId)                 // "sub" = who this token belongs to
    .setIssuedAt()                      // when it was created
    .setExpirationTime("30d")           // stops working after 30 days
    .sign(secret);                      // stamp it with your secret
}

// Returns the logged-in user (without password) or null
export async function getMobileUser(req: NextRequest) {
    // This checks the wristband. It reads the Authorization header from the request. If there isn’t one, or it doesn’t start with "Bearer ", it returns null, meaning not logged in.
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

//   .slice(7) cuts off the first 7 characters ("Bearer ") to leave just the token. jwtVerify checks the signature and expiry. If either is wrong, it throws an error, which is why this sits inside try/catch. The catch returns null, so a fake or expired token just counts as not logged in.
  try {
    const { payload } = await jwtVerify(authHeader.slice(7), secret);
    if (!payload.sub) return null;

    await connectToDB();
    return await User.findById(payload.sub).select("-password");
  } catch {
    return null;
  }
}

export function formatUser(user: any) {
  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    prayerSlotId: user.prayerSlotId ?? null,
    createdAt: user.createdAt,
  };
}

export function jsonResponse(
  success: boolean,
  message: string,
  data: any = null,
  status = 200
) {
  return NextResponse.json({ success, message, data }, { status });
}