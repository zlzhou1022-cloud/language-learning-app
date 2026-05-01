import { NextRequest, NextResponse } from 'next/server';
import { getGeminiProvider } from '@/lib/llm/geminiProvider';
import type { ChatMessage } from '@/lib/llm/baseProvider';

export async function POST(request: NextRequest) {
  try {
    const { messages, word } = await request.json() as { 
      messages: ChatMessage[];
      word: string;
    };

    if (!messages || !Array.isArray(messages) || !word) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    const provider = getGeminiProvider();
    const card = await provider.summarizeDictionaryCard(word, messages);

    return NextResponse.json({ card });
  } catch (error) {
    console.error('Summarize API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
