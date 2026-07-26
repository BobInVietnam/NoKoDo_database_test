import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { verifyAuth } from "@/lib/auth";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function GET(request: NextRequest) {
  try {
    const decoded = await verifyAuth(request);
    if (!decoded) {
      return NextResponse.json({ error: "Không được phép truy cập" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { uid: decoded.uid },
    });

    if (!student) {
      return NextResponse.json({ error: "Học sinh không tồn tại" }, { status: 404 });
    }

    const safeStudent = {
      ...student,
      dateOfBirth: student.dateOfBirth ? Number(student.dateOfBirth) : null,
      passwordHash: undefined,
    };

    return NextResponse.json({ student: safeStudent }, { status: 200 });
  } catch (error: any) {
    console.error("Student Session Verification Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
