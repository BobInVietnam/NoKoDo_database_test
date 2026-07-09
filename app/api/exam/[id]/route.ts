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
    console.log(testData)
    // 4. Return the combined metadata + questions payload
    return NextResponse.json({
      ...testData,
      dateCreated: Number(testData.dateCreated),
      studentStatuses: testData.studentStatuses.map((status) => ({
        ...status,
        dateCreated: Number(status.dateCreated),
        dateFinished: Number(status.dateFinished),
      })),
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ GET Exam API Error:', error);
    return NextResponse.json(
      { error: 'Database operation failed', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/exam/[id]
 * Accepts a Flutter TestSession JSON payload and writes/updates StudentTestStatus.
 * * Expected JSON Body from Flutter:
 * {
 * "testId": 789,
 * "studentId": "student_mock_01",
 * "startTime": 1716942000,
 * "endTime": 1716945600,
 * "score": 8.5
 * }
 */
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const pathTestId = parseInt(params.id, 10);

    if (isNaN(pathTestId)) {
      return NextResponse.json({ error: 'Invalid URL test ID segment.' }, { status: 400 });
    }

    // 1. Parse the incoming Flutter class payload matching your Dart properties
    const body = await request.json();
    const { testId, studentId, startTime, endTime, score } = body;

    // Validation guard checks
    if (!studentId || testId === undefined || startTime === undefined || endTime === undefined || score === undefined) {
      return NextResponse.json(
        { error: 'Missing parameters. Ensure testId, studentId, startTime, endTime, and score are supplied.' },
        { status: 400 }
      );
    }

    // Explicitly enforce that the payload target aligns with the dynamic API path segment
    if (parseInt(testId, 10) !== pathTestId) {
      return NextResponse.json(
        { error: 'Payload testId does not match the requested API URL endpoint path.' },
        { status: 400 }
      );
    }

    // 2. Perform property mapping transformations
    const dateCreated = parseInt(startTime, 10);
    const dateFinished = parseInt(endTime, 10);
    const calculatedDuration = dateFinished - dateCreated; // Duration in seconds
    const targetResult = parseFloat(score);

    // 3. Collision Resolution by Replacement using the Compound Primary Key
    // Prisma matches compound keys explicitly using an automatically grouped "fields_combination" lookup object
    const savedRecord = await prisma.studentTestStatus.upsert({
      where: {
        studentid_testid_dateCreated: {
          studentid: studentId,
          testid: pathTestId,
          dateCreated: dateCreated
        }
      },
      // If it exists, overwrite the status details
      update: {
        dateFinished: dateFinished,
        duration: calculatedDuration,
        result: targetResult
      },
      // If it's a new unique timestamp block, perform a clean create operation
      create: {
        studentid: studentId,
        testid: pathTestId,
        dateCreated: dateCreated,
        dateFinished: dateFinished,
        duration: calculatedDuration,
        result: targetResult
      }
    });

    return NextResponse.json(
      { 
        message: 'Test session recorded cleanly.', 
        data: {
          ...savedRecord,
          dateCreated: Number(savedRecord.dateCreated),
          dateFinished: Number(savedRecord.dateFinished),
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('❌ POST TestSession Error:', error);
    return NextResponse.json(
      { error: 'Database record processing failed', details: error.message },
      { status: 500 }
    );
  }
}
