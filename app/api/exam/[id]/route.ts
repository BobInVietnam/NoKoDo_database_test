import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

interface RouteContext {
  params: Promise<{
    id: string; // This matches the [id] folder name exactly
  }>;
}

/**
 * GET /api/exam/[id]?studentid=
 * Fetches a single test and the results of the students.
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // 1. Await the dynamic parameters block
    const { searchParams } = new URL(request.url);
    const studentIdParam = searchParams.get('studentid');
    const params = await context.params;
    const testId = parseInt(params.id, 10);

    if (!studentIdParam) {
        return NextResponse.json(
            {   error: 'Student ID must be non-empty for fetching test history'},
            {   status: 400 }
        )
    }
    if (isNaN(testId)) {
      return NextResponse.json(
        { error: 'Invalid test ID format. It must be an integer.' },
        { status: 400 }
      );
    }

    // 2. Fetch the test and automatically include its relation-mapped array of questions
    const testData = await prisma.test.findUnique({
      where: {
        id: testId,
      },
      include: {
        questions: true,
        studentStatuses: {
            where: {
                studentid: studentIdParam, // 👈 Filters the relation list directly
            },
        },
      }
    });
    // 3. Handle 404 if the test ID does not exist in your Postgres database
    if (!testData) {
      return NextResponse.json(
        { error: `Test with ID ${testId} not found.` },
        { status: 404 }
      );
    }

    // 4. Return the combined metadata + questions payload
    return NextResponse.json(testData, { status: 200 });

  } catch (error: any) {
    console.error('❌ GET Exam API Error:', error);
    return NextResponse.json(
      { error: 'Database operation failed', details: error.message },
      { status: 500 }
    );
  }
}

