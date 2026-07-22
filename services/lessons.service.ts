"use server";

import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { verifyAuth } from '@/lib/auth';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function getManageData(classId: string, type: "lesson" | "test") {
  try {
    const decoded = await verifyAuth();
    if (!decoded) return null;

    const classIdNum = parseInt(classId, 10);
    const cls = await prisma.class.findUnique({
      where: { id: classIdNum },
    });

    if (!cls) return null;

    if (type === "lesson") {
      const assignedRelations = await prisma.classLesson.findMany({
        where: { classid: classIdNum },
        include: { lesson: true },
      });

      const assigned = assignedRelations.map((r) => r.lesson);

      const all = await prisma.lesson.findMany({
        orderBy: { name: 'asc' },
      });

      return {
        className: cls.className,
        assigned: assigned.map((l) => ({
          id: l.id,
          name: l.name,
          description: l.description,
          typeLabel: l.type === 0 ? "Tập đọc" : "Tìm chữ",
          dateAdded: new Date(Number(l.dateCreated) * 1000).toLocaleDateString("vi-VN"),
        })),
        all: all.map((l) => ({
          id: l.id,
          name: l.name,
          description: l.description,
          typeLabel: l.type === 0 ? "Tập đọc" : "Tìm chữ",
          dateAdded: new Date(Number(l.dateCreated) * 1000).toLocaleDateString("vi-VN"),
        })),
      };
    } else {
      const assignedRelations = await prisma.classTest.findMany({
        where: { classid: classIdNum },
        include: { test: true },
      });

      const assigned = assignedRelations.map((r) => r.test);

      const all = await prisma.test.findMany({
        orderBy: { name: 'asc' },
      });

      return {
        className: cls.className,
        assigned: assigned.map((t) => ({
          id: t.id,
          name: t.name,
          description: `Giới hạn: ${t.timeLimit} giây, tối đa ${t.allowedAttempts} lượt`,
          typeLabel: `Độ khó: ${t.difficulty}`,
          dateAdded: new Date(Number(t.dateCreated) * 1000).toLocaleDateString("vi-VN"),
        })),
        all: all.map((t) => ({
          id: t.id,
          name: t.name,
          description: `Giới hạn: ${t.timeLimit} giây, tối đa ${t.allowedAttempts} lượt`,
          typeLabel: `Độ khó: ${t.difficulty}`,
          dateAdded: new Date(Number(t.dateCreated) * 1000).toLocaleDateString("vi-VN"),
        })),
      };
    }
  } catch (error) {
    console.error("Error in getManageData service:", error);
    return null;
  }
}

export async function assignToClass(classId: string, itemId: number, type: "lesson" | "test") {
  try {
    const decoded = await verifyAuth();
    if (!decoded) return { success: false, error: "Chưa đăng nhập" };

    const classIdNum = parseInt(classId, 10);

    if (type === "lesson") {
      const exists = await prisma.classLesson.findUnique({
        where: {
          classid_lessonid: { classid: classIdNum, lessonid: itemId },
        },
      });

      if (exists) return { success: true };

      await prisma.classLesson.create({
        data: { classid: classIdNum, lessonid: itemId },
      });
    } else {
      const exists = await prisma.classTest.findUnique({
        where: {
          testid_classid: { classid: classIdNum, testid: itemId },
        },
      });

      if (exists) return { success: true };

      await prisma.classTest.create({
        data: { classid: classIdNum, testid: itemId },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error in assignToClass service:", error);
    return { success: false, error: "Lỗi kết nối cơ sở dữ liệu" };
  }
}

export async function removeFromClass(classId: string, itemId: number, type: "lesson" | "test") {
  try {
    const decoded = await verifyAuth();
    if (!decoded) return { success: false, error: "Chưa đăng nhập" };

    const classIdNum = parseInt(classId, 10);

    if (type === "lesson") {
      await prisma.classLesson.delete({
        where: {
          classid_lessonid: { classid: classIdNum, lessonid: itemId },
        },
      });
    } else {
      await prisma.classTest.delete({
        where: {
          testid_classid: { classid: classIdNum, testid: itemId },
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error in removeFromClass service:", error);
    return { success: false, error: "Lỗi kết nối cơ sở dữ liệu" };
  }
}

export async function deleteItem(itemId: number, type: "lesson" | "test") {
  try {
    const decoded = await verifyAuth();
    if (!decoded) return { success: false, error: "Chưa đăng nhập" };

    if (type === "lesson") {
      await prisma.classLesson.deleteMany({ where: { lessonid: itemId } });
      await prisma.studentLesson.deleteMany({ where: { lessonid: itemId } });
      await prisma.lesson.delete({ where: { id: itemId } });
    } else {
      await prisma.classTest.deleteMany({ where: { testid: itemId } });
      await prisma.studentTestStatus.deleteMany({ where: { testid: itemId } });
      await prisma.studentAnswer.deleteMany({ where: { testid: itemId } });
      await prisma.question.deleteMany({ where: { testid: itemId } });
      await prisma.test.delete({ where: { id: itemId } });
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteItem service:", error);
    return { success: false, error: "Lỗi kết nối cơ sở dữ liệu" };
  }
}

export async function getTestForEdit(testId: string) {
  try {
    const decoded = await verifyAuth();
    if (!decoded) return null;

    if (testId === "new") {
      return {
        id: null,
        name: "Bài kiểm tra mới",
        allowedAttempts: 3,
        timeLimit: 180,
        difficulty: 1,
        dateCreated: Math.floor(Date.now() / 1000),
        questions: [],
      };
    }

    const testIdNum = parseInt(testId, 10);
    const test = await prisma.test.findUnique({
      where: { id: testIdNum },
      include: { questions: { orderBy: { id: 'asc' } } },
    });

    if (!test) return null;

    return {
      id: test.id,
      name: test.name,
      allowedAttempts: test.allowedAttempts,
      timeLimit: test.timeLimit,
      difficulty: test.difficulty,
      dateCreated: Number(test.dateCreated),
      questions: test.questions.map((q) => {
        let choicesArr = [];
        if (typeof q.choices === 'string') {
          try { choicesArr = JSON.parse(q.choices); } catch(e){}
        } else if (Array.isArray(q.choices)) {
          choicesArr = q.choices;
        }
        return {
          id: q.id,
          question: q.question,
          answer: q.answer,
          isMultipleChoice: q.isMultipleChoice,
          choices: choicesArr,
        };
      }),
    };
  } catch (error) {
    console.error("Error in getTestForEdit:", error);
    return null;
  }
}

export async function saveTest(testData: {
  id?: number | null;
  name: string;
  allowedAttempts: number;
  timeLimit: number;
  difficulty: number;
  questions: Array<{
    id?: number;
    question: string;
    answer: string;
    isMultipleChoice: number;
    choices: string[];
  }>;
}) {
  try {
    const decoded = await verifyAuth();
    if (!decoded) return { success: false, error: "Chưa đăng nhập" };

    const { id, name, allowedAttempts, timeLimit, difficulty, questions } = testData;

    let targetTestId: number;

    if (id) {
      targetTestId = id;
      await prisma.test.update({
        where: { id: targetTestId },
        data: {
          name,
          allowedAttempts,
          timeLimit,
          difficulty,
        },
      });

      await prisma.question.deleteMany({
        where: { testid: targetTestId },
      });
    } else {
      const createdTest = await prisma.test.create({
        data: {
          name,
          allowedAttempts,
          timeLimit,
          difficulty,
          dateCreated: BigInt(Math.floor(Date.now() / 1000)),
        },
      });
      targetTestId = createdTest.id;
    }

    for (const q of questions) {
      await prisma.question.create({
        data: {
          question: q.question,
          answer: q.answer,
          isMultipleChoice: q.isMultipleChoice,
          choices: q.choices,
          testid: targetTestId,
        },
      });
    }

    return { success: true, testId: targetTestId };
  } catch (error) {
    console.error("Error in saveTest:", error);
    return { success: false, error: "Không thể lưu bài kiểm tra" };
  }
}

export async function getLessonForEdit(lessonId: string, initialType?: number) {
  try {
    const decoded = await verifyAuth();
    if (!decoded) return null;

    if (lessonId === "new") {
      const type = initialType ?? 0;
      return {
        id: null,
        name: type === 0 ? "Bài tập đọc mới" : "Bài luyện tìm chữ mới",
        type: type,
        description: "",
        dateCreated: Math.floor(Date.now() / 1000),
        content: type === 0 ? { text: "" } : { cases: [] },
      };
    }

    const lessonIdNum = parseInt(lessonId, 10);
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonIdNum },
    });

    if (!lesson) return null;

    return {
      id: lesson.id,
      name: lesson.name,
      type: lesson.type,
      description: lesson.description,
      dateCreated: Number(lesson.dateCreated),
      content: lesson.content,
    };
  } catch (error) {
    console.error("Error in getLessonForEdit:", error);
    return null;
  }
}

export async function saveLesson(lessonData: {
  id?: number | null;
  name: string;
  type: number;
  description: string;
  content: any;
}) {
  try {
    const decoded = await verifyAuth();
    if (!decoded) return { success: false, error: "Chưa đăng nhập" };

    const { id, name, type, description, content } = lessonData;

    if (id) {
      await prisma.lesson.update({
        where: { id },
        data: {
          name,
          type,
          description,
          content,
        },
      });
      return { success: true, lessonId: id };
    } else {
      const created = await prisma.lesson.create({
        data: {
          name,
          type,
          difficulty: 1,
          description,
          content,
          dateCreated: Math.floor(Date.now() / 1000),
        },
      });
      return { success: true, lessonId: created.id };
    }
  } catch (error) {
    console.error("Error in saveLesson:", error);
    return { success: false, error: "Không thể lưu bài tập" };
  }
}
