'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Toast } from '@/components/ui/toast';
import { ConversationQualityIndicator } from './conversation-quality-indicator';
import { Send, ArrowLeft } from 'lucide-react';
import type { ChatMessage, DictionaryCard } from '@/lib/llm/baseProvider';
import { SYSTEM_ROLE, INITIAL_WORD_PROMPT, SUMMARIZE_CARD_PROMPT, CONTINUE_CONVERSATION_PROMPT } from '@/lib/llm/prompts';

interface ChatInterfaceProps {
  word: string;
  existingCard?: DictionaryCard | null;
  onGenerateCard: (card: DictionaryCard) => void;
  onBack: () => void;
}

export function ChatInterface({ word, existingCard, onGenerateCard, onBack }: ChatInterfaceProps) {
  const t = useTranslations('learn');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);
  const [aiProgress, setAiProgress] = useState<number>(0); // AI评估的进度
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化对话
  const initializeChat = async () => {
    setLoading(true);

    try {
      const systemMessage: ChatMessage = {
        role: 'system',
        content: SYSTEM_ROLE,
      };

      let userMessage: ChatMessage;
      
      if (existingCard) {
        // 继续已有卡片的对话
        userMessage = {
          role: 'user',
          content: CONTINUE_CONVERSATION_PROMPT(existingCard),
        };
      } else {
        // 新单词的初始对话
        const languageMap: Record<string, string> = {
          'zh': '中文',
          'en': 'English',
          'ja': '日本語',
        };
        
        userMessage = {
          role: 'user',
          content: INITIAL_WORD_PROMPT(
            word,
            languageMap[locale] || 'English',
            'English'
          ),
        };
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [systemMessage, userMessage],
          currentProgress: aiProgress, // 发送当前进度
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      // 更新AI评估的进度
      if (data.progress !== null && data.progress !== undefined) {
        setAiProgress(data.progress);
      }

      // 只保存 AI 的回复，不显示初始的用户提示词
      setMessages([
        {
          role: 'assistant',
          content: data.response,
        },
      ]);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setMessages([
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 组件挂载时初始化聊天 - 这是有意为之的
    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const systemMessage: ChatMessage = {
        role: 'system',
        content: SYSTEM_ROLE,
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [systemMessage, ...messages, userMessage],
          currentProgress: aiProgress, // 发送当前进度
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      // 更新AI评估的进度（只增不减）
      if (data.progress !== null && data.progress !== undefined) {
        setAiProgress((prev) => Math.max(prev, data.progress));
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.response,
        },
      ]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCard = async () => {
    setGenerating(true);

    try {
      const systemMessage: ChatMessage = {
        role: 'system',
        content: SYSTEM_ROLE,
      };

      const conversationHistory = messages
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n\n');

      const summarizeMessage: ChatMessage = {
        role: 'user',
        content: SUMMARIZE_CARD_PROMPT(word, conversationHistory),
      };

      const response = await fetch('/api/chat/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [systemMessage, summarizeMessage],
          word,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '生成卡片失败');
      }

      const data = await response.json();
      
      // 验证返回的卡片数据
      if (!data.card || !data.card.word) {
        throw new Error('生成的卡片数据不完整，请提供更多信息后重试');
      }

      onGenerateCard(data.card);
    } catch (error) {
      console.error('Failed to generate card:', error);
      const errorMessage = error instanceof Error ? error.message : '生成卡片失败，请重试';
      setToast({
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast 通知 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* 固定的对话质量指示器 */}
      <ConversationQualityIndicator
        messages={messages}
        word={word}
        onGenerateCard={handleGenerateCard}
        generating={generating}
        aiProgress={aiProgress}
      />

      {/* 返回按钮 */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft strokeWidth={1.5} className="h-4 w-4" />
        {tCommon('back')}
      </button>

      {/* 对话区域 - 简约块状布局 */}
      <div className="space-y-6 border-l-2 border-border pl-6">
        {loading && messages.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">{tCommon('loading')}</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`space-y-2 ${
                message.role === 'user' ? 'opacity-60' : ''
              }`}
            >
              <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {message.role === 'user' ? 'You' : 'AI Tutor'}
              </div>
              <div className="prose prose-sm max-w-none text-foreground">
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))
        )}

        {loading && messages.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              AI Tutor
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 animate-pulse rounded-full bg-foreground" />
              <div className="h-1 w-1 animate-pulse rounded-full bg-foreground delay-75" />
              <div className="h-1 w-1 animate-pulse rounded-full bg-foreground delay-150" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 - 固定在底部 */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder={t('typeMessage')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={loading || generating}
            className="h-10 flex-1 rounded-md border-border bg-transparent text-sm focus-visible:ring-1 focus-visible:ring-ring"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || loading || generating}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted disabled:opacity-40"
          >
            <Send strokeWidth={1.5} className="h-4 w-4" />
          </button>
        </div>

        {/* 生成卡片按钮 */}
        <button
          onClick={handleGenerateCard}
          disabled={loading || generating || messages.length < 2}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-foreground text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
          {generating ? t('generating') : t('generateCard')}
        </button>
      </div>
    </div>
  );
}
