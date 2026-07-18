import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/**
 * GET /api/config
 * Returns all system config parameters as key-value pairs.
 */
export async function GET() {
  try {
    const configs = await prisma.systemConfig.findMany();
    const configMap = configs.reduce((acc, config) => {
      acc[config.key] = config.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(configMap, { status: 200 });
  } catch (error: any) {
    console.error('❌ GET SystemConfig API Error:', error);
    return NextResponse.json(
      { error: 'Database query failed', details: error.message },
      { status: 500 }
    );
  }
}
