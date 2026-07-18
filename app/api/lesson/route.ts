import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/**
 * GET /api/lesson
 * Returns all lessons assigned to a specific class.
 * Example usage: /api/lesson?classid=1&studentid=abc
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Extract the parameters from the request URL
    const { searchParams } = new URL(request.url);
    const classIdParam = searchParams.get('classid');
    const studentId = searchParams.get('studentid');

    if (!classIdParam) {
      return NextResponse.json(
        { error: 'Missing required query parameter: classid' },
        { status: 400 }
      );
    }

    if (!studentId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: studentid' },
        { status: 400 }
      );
    }

    const classId = parseInt(classIdParam, 10);
    if (isNaN(classId)) {
      return NextResponse.json(
        { error: 'Invalid classid format. It must be an integer.' },
        { status: 400 }
      );
    }

    // 2. Query the ClassLesson table, filtering by classid, and include the Lesson data
    const classLessons = await prisma.classLesson.findMany({
      where: {
        classid: classId,
      },
      include: {
        lesson: true, // Pulls the full matching Lesson object fields
      },
    });

    // 3. Fetch completed lessons for this student
    const studentCompletedLessons = await prisma.studentLesson.findMany({
      where: {
        studentid: studentId,
      },
      select: {
        lessonid: true,
      },
    });

    const completedLessonIds = new Set(studentCompletedLessons.map((sl) => sl.lessonid));

    // 4. Map the results so it returns a clean array of Lesson objects directly with completion status
    const lessons = classLessons.map((cl) => ({
      ...cl.lesson,
      dateCreated: Number(cl.lesson.dateCreated),
      isDone: completedLessonIds.has(cl.lesson.id),
    }));

    console.log(lessons);
    return NextResponse.json(
      { 
        classid: classId,
        studentid: studentId,
        count: lessons.length, 
        lessons 
      }, 
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ GET Lessons Error:', error);
    return NextResponse.json(
      { error: 'Database query failed', details: error.message }, 
      { status: 500 }
    );
  }
}

/**
 * POST /api/lesson
 * Saves or updates a student's lesson completion result.
 *
 * Request body:
 * {
 *   "studentid": "uid-string",
 *   "lessonid": 1,
 *   "results": { ...any JSON payload, e.g. rounds, times, attempts }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentid, lessonid, results } = body;

    // 1. Validate required fields
    if (!studentid || typeof studentid !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid field: studentid (string)' },
        { status: 400 }
      );
    }

    if (lessonid === undefined || lessonid === null || typeof lessonid !== 'number') {
      return NextResponse.json(
        { error: 'Missing or invalid field: lessonid (number)' },
        { status: 400 }
      );
    }

    if (results === undefined || results === null) {
      return NextResponse.json(
        { error: 'Missing field: results (any JSON value)' },
        { status: 400 }
      );
    }

    // 2. Verify the student exists
    const student = await prisma.student.findUnique({
      where: { uid: studentid },
    });
    if (!student) {
      return NextResponse.json(
        { error: `Student with uid '${studentid}' not found` },
        { status: 404 }
      );
    }

    // 3. Verify the lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonid },
    });
    if (!lesson) {
      return NextResponse.json(
        { error: `Lesson with id '${lessonid}' not found` },
        { status: 404 }
      );
    }

    // 4. Upsert the StudentLesson record.
    //    On first completion this creates the row; on replay it overwrites the results.
    const record = await prisma.studentLesson.upsert({
      where: {
        studentid_lessonid: {
          studentid,
          lessonid,
        },
      },
      create: {
        studentid,
        lessonid,
        results,
      },
      update: {
        results,
      },
    });

    return NextResponse.json(
      { message: 'Lesson result saved successfully.', record },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ POST Lesson Error:', error);
    return NextResponse.json(
      { error: 'Database write failed', details: error.message },
      { status: 500 }
    );
  }
}
