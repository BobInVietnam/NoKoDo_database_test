import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_API_URL = 'http://127.0.0.1:11434/api/generate';
const MODEL_NAME = 'gemma4:31b-cloud';

/**
 * POST /api/simplify
 * Receives JSON payload: { "text": "Vietnamese sentence/paragraph to simplify" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = body.text;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return NextResponse.json({ error: 'Missing or invalid parameter: "text" is required.' }, { status: 400 });
    }

    // A prompt tailored for text simplification suitable for readers with dyslexia
    const prompt = `Bạn là một trợ lý hỗ trợ người mắc hội chứng khó đọc (dyslexia). 
Hãy đơn giản hóa đoạn văn bản tiếng Việt sau đây để giúp họ dễ đọc và dễ hiểu hơn.

Yêu cầu thực hiện:
1. Chia các câu dài, phức tạp thành các câu ngắn, đơn giản và rõ nghĩa.
2. Thay thế các từ ngữ Hán Việt phức tạp, từ cổ hoặc từ khó hiểu bằng các từ thuần Việt thông dụng hơn.
3. Sử dụng thể chủ động thay vì thể bị động.
4. Trình bày nội dung một cách trực tiếp, mạch lạc và giữ nguyên ý nghĩa gốc của đoạn văn.

Lưu ý: Chỉ trả về đoạn văn bản đã được đơn giản hóa. Không thêm bất kỳ lời dẫn, giải thích hay ký tự đặc biệt nào khác.

Văn bản cần đơn giản hóa:
"${text}"`;

    console.log(`🤖 Sending simplification request to Ollama using model "${MODEL_NAME}"...`);
    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
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

    return NextResponse.json({
      success: true,
      originalText: text,
      simplifiedText: data.response.trim(),
    });
  } catch (error: any) {
    console.error('❌ API route error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
