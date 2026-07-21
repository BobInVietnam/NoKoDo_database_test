import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "nokodo-default-secret-key-98765";

export interface DecodedUser {
  uid: string;
}

export async function verifyAuth(req?: NextRequest): Promise<DecodedUser | null> {
  try {
    let token: string | undefined;

    const authHeader = req?.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split("Bearer ")[1];
    }

    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get("session")?.value;
    }

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as DecodedUser;
    return decoded;
  } catch (err) {
    console.error("Verify Auth Error:", err);
    return null;
  }
}
