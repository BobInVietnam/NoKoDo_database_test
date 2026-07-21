"use server";

import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { verifyAuth } from '@/lib/auth';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function getClassesData(firebaseUid?: string) {
  try {
    const decoded = await verifyAuth();
    if (!decoded) return null;
    const teacherUid = decoded.uid;

    const classes = await prisma.class.findMany({
      where: {
        teacherid: teacherUid,
      },
      include: {
        _count: {
          select: { students: true },
        },
      },
      orderBy: {
        className: 'asc',
      },
    });

    return classes.map((cls) => ({
      id: cls.id.toString(),
      classname: cls.className,
      studentCount: cls._count.students,
    }));
  } catch (error) {
    console.error("Get classes data error:", error);
    return null;
  }
}

export async function deleteClass(classId: string, firebaseUid?: string) {
  try {
    const decoded = await verifyAuth();
    if (!decoded) return { success: false, error: "Chưa đăng nhập" };
    const teacherUid = decoded.uid;
    const classIdNum = parseInt(classId, 10);

    const targetClass = await prisma.class.findUnique({
      where: { id: classIdNum },
    });
    if (!targetClass) {
      return { success: false, error: "Không tìm thấy lớp học" };
    }

    if (targetClass.className === "Học sinh tự do") {
      return {
        success: false,
        error: "Cảnh báo: Đây là danh sách mặc định, không thể xoá!",
      };
    }

    let freeClass = await prisma.class.findFirst({
      where: {
        teacherid: teacherUid,
        className: 'Học sinh tự do',
      },
    });

    if (!freeClass) {
      freeClass = await prisma.class.create({
        data: {
          className: 'Học sinh tự do',
          teacherid: teacherUid,
        },
      });
    }

    const freeClassId = freeClass.id;

    await prisma.student.updateMany({
      where: { classid: classIdNum },
      data: { classid: freeClassId },
    });

    await prisma.class.delete({
      where: { id: classIdNum },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete class error:", error);
    return { success: false, error: "Không thể xoá lớp học này" };
  }
}

export async function addClass(classname: string, firebaseUid?: string) {
  try {
    const decoded = await verifyAuth();
    if (!decoded) return { success: false, error: "Chưa đăng nhập" };
    const teacherUid = decoded.uid;

    if (classname.trim() === "Học sinh tự do") {
      return { success: false, error: "Tên lớp này đã được hệ thống sử dụng!" };
    }

    await prisma.class.create({
      data: {
        className: classname,
        teacherid: teacherUid,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Add class error:", error);
    return { success: false, error: "Không thể thêm lớp học" };
  }
}
