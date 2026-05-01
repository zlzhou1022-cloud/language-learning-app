'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Input } from '@/components/ui/input';
import { BookOpen, MessageSquare, FileEdit, Save } from 'lucide-react';
import { ChatInterface } from './chat-interface';
import { CardEditor } from './card-editor';
import { createClient } from '@/lib/supabase/client';
import type { DictionaryCard } from '@/lib/llm/baseProvider';

interface LearnInterfaceProps {
  initialWord?: string;
  wordId?: string;
}

type Stage = 'input' | 'chat' | 'edit';

export function LearnInterface({ initialWord, wordId }: LearnInterfaceProps) {
  const t = useTranslations('learn');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const [stage, setStage] = useState<Stage>('input');
  const [word, setWord] = useState(initialWord || '');
  const [generatedCard, setGeneratedCard] = useState<DictionaryCard | null>(null);
  const [existingCard, setExistingCard] = useState<any>(null);

  // 如果有 wordId，加载已有卡片
  useEffect(() => {
    if (wordId) {
      loadExistingCard(wordId);
    }
  }, [wordId]);

  const loadExistingCard = async (id: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('dictionaries')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setExistingCard(data);
      setWord(data.word);
      setStage('chat'); // 直接进入对话模式
    } catch (error) {
      console.error('Failed to load card:', error);
    }
  };

  const handleStartLearning = () => {
    if (!word.trim()) return;
    setStage('chat');
  };

  const handleGenerateCard = (card: DictionaryCard) => {
    setGeneratedCard(card);
    setStage('edit');
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
            disabled={!word.trim()}
            className="flex h-10 items-center justify-center gap-2 rounded-md bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            <BookOpen strokeWidth={1.5} className="h-4 w-4" />
            {t('startLearning')}
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
        />
      )}

      {/* Stage 3: 卡片编辑 */}
      {stage === 'edit' && generatedCard && (
        <CardEditor
          card={generatedCard}
          onSave={handleSaveCard}
          onBack={() => setStage('chat')}
        />
      )}
    </div>
  );
}
