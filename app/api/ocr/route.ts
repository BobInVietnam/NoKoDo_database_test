import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_API_URL = 'http://127.0.0.1:11434/api/generate';
const MODEL_NAME = 'gemma4:31b-cloud';

/**
 * POST /api/ocr
 * Receives either:
 * 1. JSON payload: { "image": "base64_data", "prompt": "optional custom prompt" }
 * 2. Multipart form data: containing an 'image' file and an optional 'prompt' string
 */
export async function POST(request: NextRequest) {
  try {
    let base64Image = '';
    let prompt = 'Please extract all the text from this image. Transcribe it as accurately as possible. Output only the transcribed text, nothing else. If no text was detected, return an empty string.';

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      if (!body.image) {
        return NextResponse.json({ error: 'Missing parameter: "image" is required in JSON body.' }, { status: 400 });
      }
      base64Image = body.image;
      if (body.prompt) {
        prompt = body.prompt;
      }
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('image') as File | null;
      const customPrompt = formData.get('prompt') as string | null;

      if (!file) {
        return NextResponse.json({ error: 'Missing parameter: "image" file is required in Form Data.' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      base64Image = buffer.toString('base64');

      if (customPrompt) {
        prompt = customPrompt;
      }
    } else {
      return NextResponse.json({ error: 'Unsupported Content-Type. Use application/json or multipart/form-data.' }, { status: 400 });
    }

    // Clean up base64 prefix if present (e.g. "data:image/png;base64,")
    const cleanedBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

    // Send request to local Ollama service
    console.log(`🤖 Sending OCR request to Ollama using model "${MODEL_NAME}"...`);
    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
        images: [cleanedBase64],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ollama API error response:', errorText);
      return NextResponse.json({ error: 'Ollama service returned an error.', details: errorText }, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ Ollama responded successfully.');
    console.log(data)

    return NextResponse.json({
      success: true,
      text: data.response,
      raw: data,
    });
  } catch (error: any) {
    console.error('❌ API route error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
