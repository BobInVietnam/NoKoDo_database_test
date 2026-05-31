import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/**
 * POST /api/dictionary
 * Receives Multipart Form Data (word, description, image binary)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const word = formData.get('word') as string;
    const description = formData.get('description') as string;
    const file = formData.get('image') as File | null;

    if (!word || !description || !file) {
      return NextResponse.json({ error: 'Missing parameters: word, description, and image are required.' }, { status: 400 });
    }

    // 1. Create unique filename and save to your actual assets directory
    const cleanFileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const destinationPath = path.join(process.cwd(), 'public', 'uploads', cleanFileName);

    // 2. Stream byte data into local storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(destinationPath, buffer);

    // 3. Write row mapping inside Postgres
    const entry = await prisma.dictionaryEntry.create({
      data: {
        word,
        description,
        imageName: cleanFileName
      }
    });

    return NextResponse.json({ message: 'Entry added successfully', data: entry }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Error', details: error.message }, { status: 500 });
  }
}

/**
* GET /api/dictionary
* Returns all items out of the vocabulary table.
*/
export async function GET() {
    try {
        const entries = await prisma.dictionaryEntry.findMany({
        orderBy: { word: 'asc' }
        });
        const entriesWithImages = await Promise.all(
          entries.map(async (entry) => {
            let base64Image = null;

            if (entry.imageName) {
              try {
                const imagePath = path.join(process.cwd(), 'public', 'uploads', entry.imageName);
                const imageBuffer = await readFile(imagePath);
                // Convert binary buffer directly into a Base64 text string
                base64Image = imageBuffer.toString('base64');
              } catch (fileError) {
                console.warn(`⚠️ File missing on server disk: ${entry.imageName}`);
              }
            }

            // Return a new combined object containing database row fields + the text image data
            return {
              ...entry,
              imageData: base64Image // 👈 This string is passed directly to the mobile app
            };
          })
        );

        return NextResponse.json({ count: entriesWithImages.length, entries: entriesWithImages }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: 'Database query failed', details: error.message }, { status: 500 });
    }
}