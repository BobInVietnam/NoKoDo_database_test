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
        const studetnuid = param.uid

        const studentInfo = await prisma.student.findFirst({
            where: {
                uid: studetnuid
            }
        })
        return NextResponse.json( studentInfo,
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