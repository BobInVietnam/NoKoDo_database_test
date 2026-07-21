"use server";

import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { verifyAuth } from '@/lib/auth';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function getStudentData(classId: string, uid?: string) {
  try {
    const decoded = await verifyAuth();
    if (!decoded) return null;

    const classIdNum = parseInt(classId, 10);

    const cls = await prisma.class.findUnique({
      where: { id: classIdNum },
      include: {
        students: {
          orderBy: [
            { lastname: 'asc' },
            { firstname: 'asc' },
          ],
        },
      },
    });

    if (!cls) {
      return { className: "Chi tiết lớp học", students: [] };
    }

    const students = cls.students.map((student) => {
      let formattedBirthday = "N/A";
      if (student.dateOfBirth) {
        try {
          const date = new Date(Number(student.dateOfBirth));
          formattedBirthday = date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        } catch (e) {
          console.error("Error formatting birthday BigInt:", e);
        }
      }

      return {
        studentId: student.uid,
        studentName: `${student.lastname || ''} ${student.firstname}`.trim(),
        birthday: formattedBirthday,
        gender: student.gender || "N/A",
      };
    });

    return { className: cls.className, students };
  } catch (error) {
    console.error("Fetch student data error:", error);
    return null;
  }
}

export async function addStudent(studentData: {
  firstName: string;
  lastName: string;
  birthday?: string;
  gender?: string;
  classId: string;
}) {
  try {
    const decoded = await verifyAuth();
    if (!decoded) return null;

    const { firstName, lastName, birthday, gender, classId } = studentData;
    const classIdNum = parseInt(classId, 10);
    const studentUid = `std_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    let dobBigInt: bigint | null = null;
    if (birthday) {
      try {
        dobBigInt = BigInt(new Date(birthday).getTime());
      } catch (e) {
        console.error("Error parsing date to BigInt:", e);
      }
    }

    const student = await prisma.student.create({
      data: {
        uid: studentUid,
        firstname: firstName,
        lastname: lastName,
        classid: classIdNum,
        gender: gender || null,
        dateOfBirth: dobBigInt,
      },
    });

    return {
      id: student.uid,
      first_name: student.firstname,
      last_name: student.lastname,
    };
  } catch (error) {
    console.error("Add student error:", error);
    return null;
  }
}

export async function deleteStudent(studentId: string) {
  try {
    const decoded = await verifyAuth();
    if (!decoded) return { success: false };

    await prisma.student.delete({
      where: { uid: studentId },
    });
    return { success: true };
  } catch (error) {
    console.error("Delete student error:", error);
    return { success: false };
  }
}
