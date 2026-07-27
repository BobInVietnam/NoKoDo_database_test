import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { verifyAuth } from '@/lib/auth';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function POST(request: NextRequest) {
  try {
    const decoded = await verifyAuth(request);
    if (!decoded) {
      return NextResponse.json({ error: "Không được phép truy cập" }, { status: 401 });
    }

    const formData = await request.formData();
    const entriesStr = formData.get('entries') as string;
    if (!entriesStr) {
      return NextResponse.json({ error: 'Missing entries parameter' }, { status: 400 });
    }

    const clientEntries = JSON.parse(entriesStr) as Array<{
      id?: string;
      word: string;
      description: string;
      imageName: string;
      tempId?: string;
    }>;

    // Get current entries from database to know what to delete
    const currentEntries = await prisma.dictionaryEntry.findMany();
    const clientIds = new Set(clientEntries.map(e => e.id).filter(Boolean));

    // Delete missing entries
    for (const entry of currentEntries) {
      if (!clientIds.has(entry.id)) {
        await prisma.dictionaryEntry.delete({ where: { id: entry.id } });
        if (entry.imageName) {
          try {
            const filePath = path.join(process.cwd(), 'public', 'uploads', entry.imageName);
            await unlink(filePath);
          } catch (e) {
            console.warn(`Could not delete file ${entry.imageName}:`, e);
          }
        }
      }
    }

    // Save/Update entries
    for (const entry of clientEntries) {
      let finalImageName = entry.imageName;

      // Check if there is an uploaded file for this entry
      const fileKey = entry.id ? `file_${entry.id}` : `file_${entry.tempId}`;
      const file = formData.get(fileKey) as File | null;

      if (file) {
        // Save file
        const cleanFileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const destinationPath = path.join(process.cwd(), 'public', 'uploads', cleanFileName);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(destinationPath, buffer);
        finalImageName = cleanFileName;

        // Optionally delete old file if updating
        if (entry.id) {
          const oldEntry = currentEntries.find(e => e.id === entry.id);
          if (oldEntry && oldEntry.imageName && oldEntry.imageName !== finalImageName) {
            try {
              const oldFilePath = path.join(process.cwd(), 'public', 'uploads', oldEntry.imageName);
              await unlink(oldFilePath);
            } catch (e) {
              console.warn(`Could not delete old file ${oldEntry.imageName}:`, e);
            }
          }
        }
      }

      if (entry.id) {
        // Update
        await prisma.dictionaryEntry.update({
          where: { id: entry.id },
          data: {
            word: entry.word,
            description: entry.description,
            imageName: finalImageName
          }
        });
      } else {
        // Create
        await prisma.dictionaryEntry.create({
          data: {
            word: entry.word,
            description: entry.description,
            imageName: finalImageName
          }
        });
      }
    }

    // Increment version
    let newVersion = 'v1';
    const versionConfig = await prisma.systemConfig.findUnique({ where: { key: 'dictVersion' } });
    if (versionConfig) {
      const match = versionConfig.value.match(/v(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        newVersion = `v${num + 1}`;
      } else {
        newVersion = versionConfig.value + '_new';
      }
    }
    await prisma.systemConfig.upsert({
      where: { key: 'dictVersion' },
      update: { value: newVersion },
      create: { key: 'dictVersion', value: newVersion }
    });

    // Update last edit date
    const today = new Date();
    const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    await prisma.systemConfig.upsert({
      where: { key: 'dictDateEdited' },
      update: { value: formattedDate },
      create: { key: 'dictDateEdited', value: formattedDate }
    });

    return NextResponse.json({ success: true, version: newVersion, dateEdited: formattedDate }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to save bulk dictionary:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
