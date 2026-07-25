import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const JWT_SECRET = process.env.JWT_SECRET || "nokodo-default-secret-key-98765";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp email và mật khẩu" },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { email },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không chính xác" },
        { status: 401 }
      );
    }

    const isPasswordValid = await argon2.verify(student.passwordHash, password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không chính xác" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign({ uid: student.uid, role: "student" }, JWT_SECRET, {
      expiresIn: "30d",
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    // Convert dateOfBirth BigInt to Number for json serialization compatibility
    const safeStudent = {
      ...student,
      dateOfBirth: student.dateOfBirth ? Number(student.dateOfBirth) : null,
      passwordHash: undefined, // Hide password hash
    };

    return NextResponse.json(
      { message: "Đăng nhập thành công", student: safeStudent },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Student Login API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
