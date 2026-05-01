'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Input } from '@/components/ui/input';
import { BookOpen } from 'lucide-react';
import { ChatInterface } from './chat-interface';
import { CardEditor } from './card-editor';
import { createClient } from '@/lib/supabase/client';
import type { DictionaryCard, ChatMessage } from '@/lib/llm/baseProvider';

interface LearnInterfaceProps {
  initialWord?: string;
  wordId?: string;
}

type Stage = 'input' | 'chat' | 'edit';
type LearningMode = 'deep' | 'efficient';

export function LearnInterface({ initialWord, wordId }: LearnInterfaceProps) {
  const t = useTranslations('learn');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  // 从localStorage读取上次的模式选择，默认为'deep'
  const [mode, setMode] = useState<LearningMode>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('learningMode');
      return (savedMode === 'efficient' || savedMode === 'deep') ? savedMode : 'deep';
    }
    return 'deep';
  });
  
  const [stage, setStage] = useState<Stage>('input');
  const [word, setWord] = useState(initialWord || '');
  const [generatedCard, setGeneratedCard] = useState<DictionaryCard | null>(null);
  const [existingCard, setExistingCard] = useState<DictionaryCard | null>(null);
  const [savedMessages, setSavedMessages] = useState<ChatMessage[]>([]); // 保存的对话历史
  const [savedProgress, setSavedProgress] = useState<number>(0); // 保存的进度
  const [loading, setLoading] = useState(false); // 效率模式加载状态
  const [loadingProgress, setLoadingProgress] = useState(0); // 加载进度百分比
  const abortControllerRef = useRef<AbortController | null>(null); // 用于取消请求

  // 当模式改变时，保存到localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('learningMode', mode);
    }
  }, [mode]);

  // 如果有 wordId，加载已有卡片
  useEffect(() => {
    if (!wordId) return;
    
    const loadCard = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('dictionaries')
          .select('*')
          .eq('id', wordId)
          .single();

        if (error) throw error;

        // 转换数据库类型到DictionaryCard类型
        const card: DictionaryCard = {
          word: data.word,
          phonetic: data.phonetic || '',
          definition_native: data.definition_native || '',
          definition_target: data.definition_target || '',
          learning_notes: data.learning_notes || '',
          mnemonics: data.mnemonics || '',
          examples: Array.isArray(data.examples) 
            ? (data.examples as Array<{ sentence: string; translation: string }>)
            : [],
        };

        setExistingCard(card);
        setWord(data.word);
        setStage('chat'); // 直接进入对话模式
      } catch (error) {
        console.error('Failed to load card:', error);
      }
    };
    
    loadCard();
  }, [wordId]);

  const handleStartLearning = async () => {
    if (!word.trim()) return;

    if (mode === 'deep') {
      // 钻研模式：进入AI对话
      setStage('chat');
    } else {
      // 效率模式：直接生成卡片
      setLoading(true);
      setLoadingProgress(0);
      
      // 创建 AbortController
      abortControllerRef.current = new AbortController();
      
      // 模拟进度增长
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 300);

      try {
        const languageMap: Record<string, string> = {
          'zh': '中文',
          'en': 'English',
          'ja': '日本語',
        };

        // 简化的单步生成请求
        const systemMessage = {
          role: 'system' as const,
          content: 'You are a language learning assistant. Generate vocabulary cards efficiently.',
        };

        const userMessage = {
          role: 'user' as const,
          content: `为单词"${word}"生成一张学习卡片。

请以 JSON 格式输出：
{
  "word": "${word}",
  "phonetic": "IPA音标",
  "definition_native": "${languageMap[locale]}释义（简洁，50字以内）",
  "definition_target": "English释义（简洁，50字以内）",
  "learning_notes": "关键学习点（50-80字）",
  "mnemonics": "助记法（30字以内）",
  "examples": [
    {"sentence": "例句1", "translation": "${languageMap[locale]}翻译"},
    {"sentence": "例句2", "translation": "${languageMap[locale]}翻译"}
  ]
}

只输出JSON，不要其他文字。`,
        };

        const response = await fetch('/api/chat/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [systemMessage, userMessage],
            word,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || '生成卡片失败');
        }

        const data = await response.json();
        
        if (!data.card || !data.card.word) {
          throw new Error('生成的卡片数据不完整');
        }

        setLoadingProgress(100);
        clearInterval(progressInterval);
        
        // 短暂延迟以显示100%
        await new Promise(resolve => setTimeout(resolve, 300));

        setGeneratedCard(data.card);
        setStage('edit');
      } catch (error: unknown) {
        clearInterval(progressInterval);
        
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Card generation was cancelled');
        } else {
          console.error('Failed to generate card:', error);
          const errorMessage = error instanceof Error ? error.message : '生成卡片失败，请重试';
          alert(errorMessage);
        }
      } finally {
        setLoading(false);
        setLoadingProgress(0);
        abortControllerRef.current = null;
      }
    }
  };

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      setLoadingProgress(0);
    }
  };

  const handleGenerateCard = (card: DictionaryCard) => {
    setGeneratedCard(card);
    setStage('edit');
  };

  const handleMessagesChange = (messages: ChatMessage[], progress: number) => {
    setSavedMessages(messages);
    setSavedProgress(progress);
  };

  const handleSaveCard = async (card: DictionaryCard) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      const cardData = {
        user_id: user.id,
        word: card.word,
        language: locale,
        phonetic: card.phonetic,
        definition_native: card.definition_native,
        definition_target: card.definition_target,
        learning_notes: card.learning_notes,
        mnemonics: card.mnemonics,
        examples: card.examples,
        definition_json: {}, // 保持兼容性
        proficiency_level: 0,
      };

      if (wordId) {
        // 更新已有卡片
        const { error } = await supabase
          .from('dictionaries')
          .update(cardData)
          .eq('id', wordId);

        if (error) throw error;
      } else {
        // 创建新卡片
        const { error } = await supabase
          .from('dictionaries')
          .insert(cardData);

        if (error) throw error;
      }

      // 保存成功，返回词汇页面
      window.location.href = `/${locale}/vocabulary`;
    } catch (error) {
      console.error('Failed to save card:', error);
      throw error;
    }
  };

  const handleBackToInput = () => {
    setStage('input');
    setWord('');
    setGeneratedCard(null);
    setSavedMessages([]); // 清空保存的对话
    setSavedProgress(0);
    // 不重置mode，保持用户的选择
  };

  const handleBackFromEdit = () => {
    if (mode === 'efficient') {
      // 效率模式：返回首页
      handleBackToInput();
    } else {
      // 钻研模式：如果有对话历史，返回对话；否则返回首页
      if (savedMessages.length > 0) {
        setStage('chat');
      } else {
        handleBackToInput();
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* 页头 */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t('title')}
        </h1>
        {stage === 'input' && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t('inputWord')}
          </p>
        )}
      </div>

      {/* Stage 1: 单词输入 */}
      {stage === 'input' && (
        <div className="space-y-5">
          {/* 模式切换 */}
          <div className="space-y-3">
            <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('inputWord')}
            </label>
            <div className="flex gap-2 rounded-md border border-border p-1">
              <button
                onClick={() => setMode('deep')}
                className={`flex-1 rounded px-4 py-2 text-sm font-medium transition-colors ${
                  mode === 'deep'
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="space-y-0.5">
                  <div>{t('modeDeep')}</div>
                  <div className="text-xs font-normal opacity-70">{t('modeDeepDesc')}</div>
                </div>
              </button>
              <button
                onClick={() => setMode('efficient')}
                className={`flex-1 rounded px-4 py-2 text-sm font-medium transition-colors ${
                  mode === 'efficient'
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="space-y-0.5">
                  <div>{t('modeEfficient')}</div>
                  <div className="text-xs font-normal opacity-70">{t('modeEfficientDesc')}</div>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="word-input" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('word')}
            </label>
            <Input
              id="word-input"
              type="text"
              placeholder={t('wordPlaceholder')}
              value={word}
              onChange={(e) => setWord(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleStartLearning();
                }
              }}
              className="h-12 rounded-md border-border bg-transparent text-base focus-visible:ring-1 focus-visible:ring-ring"
              autoFocus
            />
          </div>

          <button
            onClick={handleStartLearning}
            disabled={!word.trim() || loading}
            className="flex h-10 items-center justify-center gap-2 rounded-md bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            <BookOpen strokeWidth={1.5} className="h-4 w-4" />
            {loading ? tCommon('loading') : t('startLearning')}
          </button>
        </div>
      )}

      {/* Stage 2: 对话界面 */}
      {stage === 'chat' && (
        <ChatInterface
          word={word}
          existingCard={existingCard}
          onGenerateCard={handleGenerateCard}
          onBack={handleBackToInput}
          savedMessages={savedMessages}
          savedProgress={savedProgress}
          onMessagesChange={handleMessagesChange}
        />
      )}

      {/* Stage 3: 卡片编辑 */}
      {stage === 'edit' && generatedCard && (
        <CardEditor
          card={generatedCard}
          onSave={handleSaveCard}
          onBack={handleBackFromEdit}
          mode={mode}
        />
      )}

      {/* 效率模式加载进度 */}
      {loading && mode === 'efficient' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="space-y-6 rounded-lg border border-border bg-background p-8 shadow-lg">
            <div className="space-y-4 text-center">
              {/* 进度圆环 */}
              <div className="relative mx-auto h-24 w-24">
                {/* 背景圆环 */}
                <svg className="h-24 w-24 -rotate-90 transform">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-muted"
                  />
                  {/* 进度圆环 */}
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - loadingProgress / 100)}`}
                    className="text-foreground transition-all duration-300"
                    strokeLinecap="round"
                  />
                </svg>
                {/* 百分比文字 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-semibold text-foreground">
                    {Math.round(loadingProgress)}%
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{t('generating')}</p>
                <p className="text-xs text-muted-foreground">正在为&quot;{word}&quot;生成学习卡片...</p>
              </div>
            </div>

            {/* 取消按钮 */}
            <button
              onClick={handleCancelGeneration}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-border text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {tCommon('cancel') || '取消'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
