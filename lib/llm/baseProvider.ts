/**
 * LLM Provider Base Interface
 * 定义所有 LLM 提供商必须实现的接口
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface DictionaryCard {
  word: string;
  phonetic: string;
  definition_native: string;
  definition_target: string;
  learning_notes: string;
  mnemonics: string;
  examples: Array<{
    sentence: string;
    translation: string;
  }>;
  language: string; // 单词本身的语言 (en/ja/zh)
}

export interface LLMProvider {
  /**
   * 生成对话响应
   * @param messages 对话历史（最近5轮）
   * @returns LLM 的响应文本
   */
  generateChatResponse(messages: ChatMessage[]): Promise<string>;

  /**
   * 总结对话并生成结构化的生词卡片
   * @param word 单词
   * @param conversationHistory 完整对话历史
   * @returns 结构化的生词卡片数据
   */
  summarizeDictionaryCard(
    word: string,
    conversationHistory: ChatMessage[]
  ): Promise<DictionaryCard>;

  /**
   * 流式生成对话响应（可选，用于打字机效果）
   * @param messages 对话历史
   * @param onChunk 每次接收到新内容时的回调
   */
  generateChatResponseStream?(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void
  ): Promise<void>;
}

/**
 * 工具函数：限制对话历史长度，只保留最近 N 轮
 */
export function limitConversationHistory(
  messages: ChatMessage[],
  maxRounds: number = 5
): ChatMessage[] {
  // 保留 system 消息
  const systemMessages = messages.filter(m => m.role === 'system');
  const conversationMessages = messages.filter(m => m.role !== 'system');
  
  // 每轮对话包含 user + assistant，所以是 maxRounds * 2
  const maxMessages = maxRounds * 2;
  const recentMessages = conversationMessages.slice(-maxMessages);
  
  return [...systemMessages, ...recentMessages];
}
