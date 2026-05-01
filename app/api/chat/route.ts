import { NextRequest } from 'next/server';
import { getGeminiProvider } from '@/lib/llm/geminiProvider';
import type { ChatMessage } from '@/lib/llm/baseProvider';

export async function POST(request: NextRequest) {
  try {
    const { messages, currentProgress } = await request.json() as { 
      messages: ChatMessage[];
      currentProgress?: number;
    };

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
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

    // 创建流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // 逐字发送响应
        const words = cleanResponse.split('');
        
        for (let i = 0; i < words.length; i++) {
          const chunk = {
            content: words[i],
            progress: i === words.length - 1 ? progress : null, // 只在最后发送进度
            done: i === words.length - 1
          };
          
          controller.enqueue(encoder.encode(JSON.stringify(chunk) + '\n'));
          
          // 添加小延迟以实现打字效果
          await new Promise(resolve => setTimeout(resolve, 20));
        }
        
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
