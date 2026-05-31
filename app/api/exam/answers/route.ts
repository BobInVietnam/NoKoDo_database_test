import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/**
 * {
  "studentId": "student_mock_01",
  "testId": 789,
  "startTime": 1716942000,
  "answers": [
    { "questionId": 7898, "answer": "đáp án đúng" },
    { "questionId": 7899, "answer": "A" },
    { "questionId": 7900, "answer": "C" }
  ]
}
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, testId, startTime, answers } = body;

    // 1. Base Parameter Parsing and Validation
    const parsedTestId = parseInt(testId, 10);
    const parsedStarttime = parseInt(startTime, 10);

    if (!studentId || isNaN(parsedTestId) || isNaN(parsedStarttime) || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Missing or invalid parameters. Ensure studentId, testId, startTime, and an array of answers are provided.' },
        { status: 400 }
      );
    }

    // 2. Map the array into the exact shape your StudentAnswer table expects
    const answersData = answers.map((item: any) => {
      const parsedQuestionId = parseInt(item.questionId, 10);
    
      if (isNaN(parsedQuestionId)) {
        throw new Error(`Invalid answer block found for questionId: ${item.questionId}`);
      }
      return {
        studentid: studentId,
        testid: parsedTestId,
        dateCreated: parsedStarttime,
        questionid: parsedQuestionId,
        answer: item.answer,
      };
    });

    // 4. Batch insert all answers in one single query
    const result = await prisma.studentAnswer.createMany({
      data: answersData,
      skipDuplicates: true,
    });

    return NextResponse.json(
      { 
        message: `${result.count} student answers recorded successfully.`, 
        insertedCount: result.count 
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('❌ POST Batch StudentAnswers Error:', error);
    return NextResponse.json(
      { error: 'Database batch placement failed', details: error.message },
      { status: 500 }
    );
  }
}