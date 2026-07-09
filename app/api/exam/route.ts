import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/**
 * GET /api/exam?studentid=
 * Fetches all tests of the class.
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Extract the classid parameter from the request URL
    const { searchParams } = new URL(request.url);
    const studentIdParam = searchParams.get('studentid');

    if (!studentIdParam) {
      return NextResponse.json(
        { error: 'Missing required query parameter: studentid' },
        { status: 400 }
      );
    }

    // 2. Query the ClassLesson table, filtering by classid, and include the Lesson data
    const classId = await prisma.student.findFirst({
      select: {
        classid: true
      },
      where: {
        uid: studentIdParam,
      },
    });

    if (!classId) {
      return NextResponse.json(
        { error: 'No student with that uid exist!' },
        { status: 400 }
      );
    }

    const testList = await prisma.classTest.findMany({
      where: {
        classid: classId?.classid
      },
      include: {
        test: {
          include: {
            studentStatuses: {
              orderBy: {
                result: 'desc'
              }
            }
          }
        }
      }
    })

    const testInfo = testList.map((item) => {
      const currentTest = item.test;
      const statuses = currentTest.studentStatuses;

      // 1. Calculate the total count of submissions for this test
      const submissionCount = statuses.length;

      // 2. Extract the highest score (the first item because of our descending order)
      const highestScore = submissionCount > 0 ? statuses[0].result : null;

      return {
        id: currentTest.id,
        name: currentTest.name,
        difficulty: currentTest.difficulty,
        time_limit: currentTest.timeLimit,
        date_created: Number(currentTest.dateCreated),
        
        // Your calculated statistics fields:
        attempts: submissionCount,
        allowed_attempts: currentTest.allowedAttempts,
        result: highestScore,
      };
    });
    console.log(testInfo)
    return NextResponse.json(
      { 
        classid: classId,
        count: testList.length,
        testInfoList: testInfo
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

