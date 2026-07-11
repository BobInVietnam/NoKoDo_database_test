import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

interface RouteContext {
  params: Promise<{
    uid: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const uid = params.uid;

    // 1. Fetch student profile to get classid
    const student = await prisma.student.findUnique({
      where: { uid },
      select: { classid: true, totalTime: true }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    const classid = student.classid;

    // 2. Fetch class test count
    const testNumber = await prisma.classTest.count({
      where: { classid }
    });

    // 3. Fetch finished test count (unique tests completed)
    const finishedTests = await prisma.studentTestStatus.groupBy({
      by: ['testid'],
      where: { studentid: uid }
    });
    const testFinishedNumber = finishedTests.length;

    // 4. Fetch average test score
    const avgScoreResult = await prisma.studentTestStatus.aggregate({
      where: { studentid: uid },
      _avg: {
        result: true
      }
    });
    const averageTestScore = Math.round(avgScoreResult._avg.result ?? 0);

    // 5. Fetch class lesson count
    const lessonNumber = await prisma.classLesson.count({
      where: { classid }
    });

    // 6. Fetch finished lesson count
    const lessonFinishedNumber = await prisma.studentLesson.count({
      where: { studentid: uid }
    });

    // 7. Calculate activity counts (last 7 days test sessions)
    const sevenDaysAgo = BigInt(Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000));
    const recentAttempts = await prisma.studentTestStatus.findMany({
      where: {
        studentid: uid,
        dateCreated: {
          gte: sevenDaysAgo
        }
      },
      select: {
        dateCreated: true
      }
    });

    const activityCounts = new Array(7).fill(0);
    const nowSec = Math.floor(Date.now() / 1000);
    for (const attempt of recentAttempts) {
      const attemptTime = Number(attempt.dateCreated);
      const diffDays = Math.floor((nowSec - attemptTime) / (24 * 60 * 60));
      if (diffDays >= 0 && diffDays < 7) {
        activityCounts[6 - diffDays]++; // index 0 is 7 days ago, index 6 is today
      }
    }

    // 8. Fetch total duration usage in seconds
    const totalUsageTime = student.totalTime;

    return NextResponse.json({
      uid,
      classid,
      testNumber,
      testFinishedNumber,
      averageTestScore,
      lessonNumber,
      lessonFinishedNumber,
      activityCounts,
      totalUsageTime
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ GET Statistics API Error:', error);
    return NextResponse.json(
      { error: 'Database statistics query failed', details: error.message },
      { status: 500 }
    );
  }
}
