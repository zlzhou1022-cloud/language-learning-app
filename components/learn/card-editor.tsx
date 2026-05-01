'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';
import type { DictionaryCard } from '@/lib/llm/baseProvider';

interface CardEditorProps {
  card: DictionaryCard;
  onSave: (card: DictionaryCard) => Promise<void>;
  onBack: () => void;
  mode?: 'deep' | 'efficient'; // 学习模式
}

export function CardEditor({ card: initialCard, onSave, onBack, mode = 'deep' }: CardEditorProps) {
  const t = useTranslations('learn');
  const tCommon = useTranslations('common');

  const [card, setCard] = useState<DictionaryCard>(initialCard);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      await onSave(card);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddExample = () => {
    setCard({
      ...card,
      examples: [
        ...card.examples,
        { sentence: '', translation: '' },
      ],
    });
  };

  const handleRemoveExample = (index: number) => {
    setCard({
      ...card,
      examples: card.examples.filter((_, i) => i !== index),
    });
  };

  const handleUpdateExample = (index: number, field: 'sentence' | 'translation', value: string) => {
    const newExamples = [...card.examples];
    newExamples[index] = {
      ...newExamples[index],
      [field]: value,
    };
    setCard({ ...card, examples: newExamples });
  };

  return (
    <div className="space-y-8">
      {/* 返回按钮 */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft strokeWidth={1.5} className="h-4 w-4" />
        {tCommon('back')}
      </button>

      {/* 卡片编辑表单 - 档案纸样式 */}
      <div className="space-y-8 border border-border bg-background p-8">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {t('editCard')}
          </h2>
          <p className="text-sm text-muted-foreground">
            Review and edit the generated card before saving
          </p>
        </div>

        <div className="space-y-6">
          {/* 单词 */}
          <div className="space-y-1.5">
            <Label htmlFor="word" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('word')}
            </Label>
            <Input
              id="word"
              type="text"
              value={card.word}
              onChange={(e) => setCard({ ...card, word: e.target.value })}
              className="h-10 rounded-md border-border bg-transparent text-sm focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* 音标 */}
          <div className="space-y-1.5">
            <Label htmlFor="phonetic" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('phonetic')}
            </Label>
            <Input
              id="phonetic"
              type="text"
              value={card.phonetic}
              onChange={(e) => setCard({ ...card, phonetic: e.target.value })}
              className="h-10 rounded-md border-border bg-transparent text-sm focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* 母语释义 */}
          <div className="space-y-1.5">
            <Label htmlFor="definition-native" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('definitionNative')}
            </Label>
            <textarea
              id="definition-native"
              value={card.definition_native}
              onChange={(e) => setCard({ ...card, definition_native: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* 目标语释义 */}
          <div className="space-y-1.5">
            <Label htmlFor="definition-target" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('definitionTarget')}
            </Label>
            <textarea
              id="definition-target"
              value={card.definition_target}
              onChange={(e) => setCard({ ...card, definition_target: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* 学习要点 */}
          <div className="space-y-1.5">
            <Label htmlFor="learning-notes" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('learningNotes')}
            </Label>
            <textarea
              id="learning-notes"
              value={card.learning_notes}
              onChange={(e) => setCard({ ...card, learning_notes: e.target.value })}
              rows={3}
              placeholder={t('learningNotesPlaceholder')}
              className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              {mode === 'efficient' ? t('learningNotesHintEfficient') : t('learningNotesHint')}
            </p>
          </div>

          {/* 助记法 */}
          <div className="space-y-1.5">
            <Label htmlFor="mnemonics" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('mnemonics')}
            </Label>
            <textarea
              id="mnemonics"
              value={card.mnemonics}
              onChange={(e) => setCard({ ...card, mnemonics: e.target.value })}
              rows={2}
              className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* 例句 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {t('examples')}
              </Label>
              <button
                onClick={handleAddExample}
                className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Plus strokeWidth={1.5} className="h-3 w-3" />
                {t('addExample')}
              </button>
            </div>

            <div className="space-y-4">
              {card.examples.map((example, index) => (
                <div key={index} className="space-y-2 border-l-2 border-border pl-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs text-muted-foreground">#{index + 1}</span>
                    <button
                      onClick={() => handleRemoveExample(index)}
                      className="text-xs text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <X strokeWidth={1.5} className="h-3 w-3" />
                    </button>
                  </div>
                  <Input
                    type="text"
                    placeholder={t('exampleSentence')}
                    value={example.sentence}
                    onChange={(e) => handleUpdateExample(index, 'sentence', e.target.value)}
                    className="h-9 rounded-md border-border bg-transparent text-sm"
                  />
                  <Input
                    type="text"
                    placeholder={t('exampleTranslation')}
                    value={example.translation}
                    onChange={(e) => handleUpdateExample(index, 'translation', e.target.value)}
                    className="h-9 rounded-md border-border bg-transparent text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="border-l-2 border-destructive pl-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* 保存按钮 */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-foreground text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          <Save strokeWidth={1.5} className="h-4 w-4" />
          {saving ? tCommon('loading') : t('saveCard')}
        </button>
      </div>
    </div>
  );
}
