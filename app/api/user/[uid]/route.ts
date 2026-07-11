import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

interface RouteContext {
  params: Promise<{
    uid: string; // This matches the [uid] folder name exactly
  }>;
}

export async function GET (
    response: NextRequest,
    context: RouteContext
) {
    try {
        const param = await context.params
        const studentuid = param.uid
        console.log(studentuid)
        const studentInfo = await prisma.student.findUnique({
            where: {
                uid: studentuid
            }
        })
        console.log(studentInfo)
        return NextResponse.json( 
            studentInfo,
            {status: 200}
        )
    } catch (error: any) {
        console.error('❌ GET Student API Error:', error);
        return NextResponse.json(
            { error: 'Database operation failed', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST (
    request: NextRequest,
    context: RouteContext
) {
    try {
        const param = await context.params;
        const studentuid = param.uid;
        
        const body = await request.json();
        const { totalTime } = body;

        const updatedStudent = await prisma.student.update({
            where: {
                uid: studentuid
            },
            data: {
                totalTime
            }
        });

        console.log('✅ Student updated:', updatedStudent);
        return NextResponse.json(
            updatedStudent,
            { status: 201 }
        );
    } catch (error: any) {
        console.error('❌ POST Student API Error:', error);
        return NextResponse.json(
            { error: 'Database update failed', details: error.message },
            { status: 500 }
        );
    }
}

