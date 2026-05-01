import { NextRequest, NextResponse } from 'next/server';
import { getGeminiProvider } from '@/lib/llm/geminiProvider';
import type { ChatMessage } from '@/lib/llm/baseProvider';

export async function POST(request: NextRequest) {
  try {
    const { messages, currentProgress } = await request.json() as { 
      messages: ChatMessage[];
      currentProgress?: number;
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    const provider = getGeminiProvider();
    const response = await provider.generateChatResponse(messages);

    // 解析进度标记 [PROGRESS:XX]
    const progressMatch = response.match(/\[PROGRESS:(\d+)\]/);
    let progress = null;
    let cleanResponse = response;

    if (progressMatch) {
      progress = parseInt(progressMatch[1], 10);
      // 移除进度标记，只返回干净的回复内容
      cleanResponse = response.replace(/\[PROGRESS:\d+\]\s*$/, '').trim();
      
      // 服务器端验证：确保进度只增不减
      if (currentProgress !== undefined && currentProgress !== null) {
        progress = Math.max(currentProgress, progress);
      }
      
      // 限制进度范围在0-100之间
      progress = Math.max(0, Math.min(100, progress));
    }

    return NextResponse.json({ 
      response: cleanResponse,
      progress: progress 
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
