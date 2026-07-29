"use server";

import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { verifyAuth } from '@/lib/auth';
import * as argon2 from "argon2";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function getStudentData(classId: string, uid?: string) {
  try {
    const decoded = await verifyAuth();
    if (!decoded) return null;

    const cls = await prisma.class.findUnique({
      where: { id: classId },
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
      return { className: "Chi tiết lớp học", students: [], exams: [] };
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

    const classTests = await prisma.classTest.findMany({
      where: { classid: classId },
      include: {
        test: {
          include: {
            studentStatuses: {
              where: {
                studentid: { in: cls.students.map(s => s.uid) }
              }
            }
          }
        }
      }
    });

    const totalStudentsCount = cls.students.length;

    const exams = classTests.map((ct) => {
      const test = ct.test;
      const statuses = test.studentStatuses;

      const highestScoresByStudent: { [studentId: string]: number } = {};
      for (const status of statuses) {
        const studentId = status.studentid;
        const score = status.result;
        if (highestScoresByStudent[studentId] === undefined || score > highestScoresByStudent[studentId]) {
          highestScoresByStudent[studentId] = score;
        }
      }

      const uniqueStudentScores = Object.values(highestScoresByStudent);
      let avgScore = 0;
      if (uniqueStudentScores.length > 0) {
        const sum = uniqueStudentScores.reduce((acc, curr) => acc + curr, 0);
        avgScore = Math.round((sum / uniqueStudentScores.length) * 10) / 10;
      }

      const uniqueFinished = uniqueStudentScores.length;

      return {
        id: test.id,
        name: test.name,
        averageScore: avgScore,
        finishedCount: uniqueFinished,
        totalCount: totalStudentsCount
      };
    });

    return { className: cls.className, students, exams };
  } catch (error) {
    console.error("Fetch student data error:", error);
    return null;
  }
}

export async function addStudent(studentData: {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  birthday?: string;
  gender?: string;
  classId: string;
}) {
  try {
    const decoded = await verifyAuth();
    if (!decoded) return null;

    const { firstName, lastName, email, password, birthday, gender, classId } = studentData;
    const studentUid = `std_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const rawPassword = password || "password123";
    const passwordHash = await argon2.hash(rawPassword, { type: argon2.argon2id });

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
        email: email.trim().toLowerCase(),
        passwordHash: passwordHash,
        classid: classId,
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

export async function getClassTestDetail(classId: string, testId: string) {
  try {
    const decoded = await verifyAuth();
    if (!decoded) return null;

    const cls = await prisma.class.findUnique({
      where: { id: classId },
      include: { students: true }
    });

    if (!cls) return null;

    const test = await prisma.test.findUnique({
      where: { id: testId }
    });
    if (!test) return null;

    const students = await Promise.all(
      cls.students.map(async (student) => {
        const statuses = await prisma.studentTestStatus.findMany({
          where: {
            studentid: student.uid,
            testid: testId
          },
          orderBy: { dateFinished: 'desc' }
        });

        let maxScore = "Chưa làm";
        let maxScoreValue = -1;
        let attemptsCount = 0;
        let latestDate = "N/A";
        let latestTimestamp = 0;

        if (statuses.length > 0) {
          const scores = statuses.map(s => s.result);
          maxScoreValue = Math.max(...scores);
          maxScore = `${maxScoreValue} điểm`;
          attemptsCount = statuses.length;
          
          const maxDateBigInt = statuses[0].dateFinished;
          latestTimestamp = Number(maxDateBigInt);
          const date = new Date(latestTimestamp);
          latestDate = date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
          });
        }

        return {
          studentName: `${student.lastname || ''} ${student.firstname}`.trim(),
          maxScore,
          maxScoreValue,
          attemptsCount,
          latestDate,
          latestTimestamp
        };
      })
    );

    return {
      testName: test.name,
      students
    };
  } catch (error) {
    console.error("getClassTestDetail error:", error);
    return null;
  }
}

export async function clearClassTestResults(classId: string, testId: string) {
  try {
    const decoded = await verifyAuth();
    if (!decoded) return { success: false, error: "Chưa đăng nhập" };

    const cls = await prisma.class.findUnique({
      where: { id: classId },
      include: { students: true }
    });
    if (!cls) return { success: false, error: "Không tìm thấy lớp học" };

    const studentIds = cls.students.map(s => s.uid);

    await prisma.studentAnswer.deleteMany({
      where: {
        testid: testId,
        studentid: { in: studentIds }
      }
    });

    await prisma.studentTestStatus.deleteMany({
      where: {
        testid: testId,
        studentid: { in: studentIds }
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("clearClassTestResults error:", error);
    return { success: false, error: error.message };
  }
}

export async function getStudentDetailData(uid: string) {
  try {
    const decoded = await verifyAuth();
    if (!decoded) return null;

    const student = await prisma.student.findUnique({
      where: { uid },
      include: {
        class: true,
        studentLessons: true,
        testStatuses: true
      }
    });
    if (!student) return null;

    let formattedBirthday = "N/A";
    if (student.dateOfBirth) {
      try {
        const date = new Date(Number(student.dateOfBirth));
        formattedBirthday = date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        });
      } catch (e) {
        console.error(e);
      }
    }

    const totalSeconds = student.totalTime || 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const usageTime = `${hours} giờ ${minutes} phút ${seconds} giây`;

    const totalLessons = await prisma.classLesson.count({
      where: { classid: student.classid }
    });
    const completedLessons = await prisma.studentLesson.count({
      where: { studentid: uid }
    });

    const totalTests = await prisma.classTest.count({
      where: { classid: student.classid }
    });
    
    const attemptedTestsCount = await prisma.studentTestStatus.groupBy({
      by: ['testid'],
      where: { studentid: uid }
    }).then(res => res.length);

    const highestScores = await prisma.studentTestStatus.groupBy({
      by: ['testid'],
      where: { studentid: uid },
      _max: { result: true }
    });

    let averageScore = 0;
    if (highestScores.length > 0) {
      const sum = highestScores.reduce((acc, curr) => acc + (curr._max.result ?? 0), 0);
      averageScore = Math.round((sum / highestScores.length) * 100) / 100;
    }

    const classTests = await prisma.classTest.findMany({
      where: { classid: student.classid },
      include: { test: true }
    });

    const examDetails = await Promise.all(
      classTests.map(async (ct) => {
        const test = ct.test;
        const attempts = await prisma.studentTestStatus.findMany({
          where: { studentid: uid, testid: test.id },
          orderBy: { dateFinished: 'desc' }
        });

        let maxScore = "--";
        let latestDate = "--";
        let attemptsCount = attempts.length;

        if (attempts.length > 0) {
          const scores = attempts.map(a => a.result);
          maxScore = `${Math.max(...scores)}`;
          
          const latestBigInt = attempts[0].dateFinished;
          const date = new Date(Number(latestBigInt));
          latestDate = date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
          });
        }

        return {
          id: test.id,
          name: test.name,
          attemptsCount,
          allowedAttempts: test.allowedAttempts,
          latestDate,
          maxScore
        };
      })
    );

    return {
      uid: student.uid,
      name: `${student.lastname || ''} ${student.firstname}`.trim(),
      email: student.email,
      gender: student.gender || "Nam",
      birthday: formattedBirthday,
      className: student.class?.className || "N/A",
      classId: student.classid,
      usageTime,
      lessonsRatio: `${completedLessons}/${totalLessons}`,
      examsRatio: `${attemptedTestsCount}/${totalTests}`,
      averageScore,
      exams: examDetails
    };
  } catch (error) {
    console.error("getStudentDetailData error:", error);
    return null;
  }
}

export async function clearStudentTestResults(studentId: string, testId: string) {
  try {
    const decoded = await verifyAuth();
    if (!decoded) return { success: false, error: "Chưa đăng nhập" };

    await prisma.studentAnswer.deleteMany({
      where: { testid: testId, studentid: studentId }
    });

    await prisma.studentTestStatus.deleteMany({
      where: { testid: testId, studentid: studentId }
    });

    return { success: true };
  } catch (error: any) {
    console.error("clearStudentTestResults error:", error);
    return { success: false, error: error.message };
  }
}
