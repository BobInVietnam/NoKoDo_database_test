import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import path from 'path';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/**
 * GET /api/lesson
 * Returns all lessons assigned to a specific class.
 * Example usage: /api/lesson?classid=1
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