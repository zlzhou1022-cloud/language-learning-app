/**
 * Google Gemini Provider Implementation
 * 使用 Gemini 1.5 Flash 实现 LLM 接口
 */

import {
  type LLMProvider,
  type ChatMessage,
  type DictionaryCard,
  limitConversationHistory,
} from './baseProvider';

export class GeminiProvider implements LLMProvider {
  private apiKey: string;
  private model: string;
  private apiEndpoint: string;

  constructor(apiKey?: string, model: string = 'gemini-2.5-flash') {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    this.model = model;
    this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models';
    
    // 调试日志
    if (process.env.NODE_ENV === 'development') {
      console.log('[GeminiProvider] Initializing...');
      console.log('[GeminiProvider] API Key exists:', !!this.apiKey);
      console.log('[GeminiProvider] API Key length:', this.apiKey?.length || 0);
      console.log('[GeminiProvider] API Key prefix:', this.apiKey?.substring(0, 10) || 'none');
    }
    
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
  }

  /**
   * 转换消息格式为 Gemini API 格式
   */
  private convertMessages(messages: ChatMessage[]) {
    // Gemini API 格式
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    return {
      systemInstruction: systemMessage ? {
        parts: [{ text: systemMessage.content }]
      } : undefined,
      contents: conversationMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))
    };
  }

  async generateChatResponse(messages: ChatMessage[]): Promise<string> {
    // 限制对话历史，只保留最近 5 轮
    const limitedMessages = limitConversationHistory(messages, 5);
    const { systemInstruction, contents } = this.convertMessages(limitedMessages);

    const url = `${this.apiEndpoint}/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction,
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topP: 0.95, // 添加topP以提高生成质量
          topK: 40, // 添加topK以加快生成速度
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  }

  async summarizeDictionaryCard(
    _word: string,
    conversationHistory: ChatMessage[]
  ): Promise<DictionaryCard> {
    const response = await this.generateChatResponse(conversationHistory);

    // 尝试从响应中提取 JSON
    let jsonText = response.trim();
    
    // 移除可能的 markdown 代码块标记
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // 调试日志
    if (process.env.NODE_ENV === 'development') {
      console.log('[GeminiProvider] Raw response:', response);
      console.log('[GeminiProvider] Cleaned JSON:', jsonText);
    }
    
    try {
      const rawCard = JSON.parse(jsonText) as Record<string, unknown>;
      
      // 处理 definition_native 和 definition_target 可能是对象的情况
      const normalizeDefinition = (def: unknown): string => {
        if (typeof def === 'string') return def;
        if (typeof def === 'object' && def !== null) {
          // 如果是对象，将所有值合并成字符串
          return Object.entries(def as Record<string, unknown>)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
        }
        return '';
      };
      
      const card: DictionaryCard = {
        word: (rawCard.word as string) || '',
        phonetic: (rawCard.phonetic as string) || '',
        definition_native: normalizeDefinition(rawCard.definition_native),
        definition_target: normalizeDefinition(rawCard.definition_target),
        learning_notes: (rawCard.learning_notes as string) || '通过对话学习了这个单词的用法和含义',
        mnemonics: (rawCard.mnemonics as string) || '',
        examples: Array.isArray(rawCard.examples) ? rawCard.examples : [],
      };
      
      // 验证必需字段
      if (!card.word || !card.phonetic || !card.definition_native) {
        console.error('[GeminiProvider] Missing required fields:', {
          word: !!card.word,
          phonetic: !!card.phonetic,
          definition_native: !!card.definition_native,
          learning_notes: !!card.learning_notes,
        });
        throw new Error('Missing required fields in generated card');
      }
      
      return card;
    } catch (error) {
      console.error('[GeminiProvider] Failed to parse LLM response as JSON:', response);
      console.error('[GeminiProvider] Parse error:', error);
      throw new Error('Failed to generate structured card data. Please try again.');
    }
  }

  async generateChatResponseStream(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const limitedMessages = limitConversationHistory(messages, 5);
    const { systemInstruction, contents } = this.convertMessages(limitedMessages);

    const url = `${this.apiEndpoint}/${this.model}:streamGenerateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction,
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') continue;
        
        try {
          const data = JSON.parse(line);
          if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            onChunk(data.candidates[0].content.parts[0].text);
          }
        } catch {
          // 忽略解析错误
        }
      }
    }
  }
}

// 导出单例实例
let geminiInstance: GeminiProvider | null = null;

export function getGeminiProvider(): GeminiProvider {
  // 每次都重新创建实例，确保环境变量正确加载
  // 在开发环境中，环境变量可能会在服务器重启后更新
  if (process.env.NODE_ENV === 'development') {
    return new GeminiProvider();
  }
  
  // 生产环境使用单例
  if (!geminiInstance) {
    geminiInstance = new GeminiProvider();
  }
  return geminiInstance;
}
