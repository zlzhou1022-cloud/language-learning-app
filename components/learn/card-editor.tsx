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
  originalCard?: DictionaryCard; // 原始卡片（用于高亮新增内容）
}

export function CardEditor({ card: initialCard, onSave, onBack, mode = 'deep', originalCard }: CardEditorProps) {
  const t = useTranslations('learn');
  const tCommon = useTranslations('common');

  const [card, setCard] = useState<DictionaryCard>(initialCard);
  const [saving, setSaving] = useState(false);

  // 在初始加载时计算哪些字段有变化和新增内容（避免输入时重新计算）
  const [changedFields] = useState(() => {
    if (!originalCard) {
      console.log('[CardEditor] No originalCard, skipping highlight');
      return {};
    }
    
    console.log('[CardEditor] Calculating changed fields');
    console.log('[CardEditor] originalCard:', originalCard);
    console.log('[CardEditor] initialCard:', initialCard);
    
    const changes: Record<string, { hasChanged: boolean; newContent: string; originalContent: string }> = {};
    
    // 检查所有文本字段
    const textFields: Array<keyof DictionaryCard> = [
      'phonetic',
      'definition_native', 
      'definition_target',
      'learning_notes',
      'mnemonics'
    ];
    
    textFields.forEach(field => {
      const original = String(originalCard[field] || '');
      const current = String(initialCard[field] || '');
      
      console.log(`[CardEditor] Field ${field}:`, {
        original: original.substring(0, 50),
        current: current.substring(0, 50),
        different: current !== original,
        includes: current.includes(original),
        longer: current.length > original.length
      });
      
      if (current !== original && current.includes(original) && current.length > original.length) {
        // 尝试提取新增内容
        let newContent = '';
        
        if (current.startsWith(original)) {
          // 新内容在后面
          newContent = current.substring(original.length).trim();
        } else if (current.endsWith(original)) {
          // 新内容在前面
          newContent = current.substring(0, current.length - original.length).trim();
        } else {
          // 新内容在中间，尝试找到分隔符
          const parts = current.split(original);
          if (parts.length === 2) {
            newContent = (parts[0] + parts[1]).trim();
          }
        }
        
        if (newContent) {
          console.log(`[CardEditor] Field ${field} has changes:`, {
            originalLength: original.length,
            currentLength: current.length,
            newContentLength: newContent.length,
            newContent: newContent.substring(0, 50)
          });
          
          changes[field] = {
            hasChanged: true,
            newContent,
            originalContent: original
          };
        }
      }
    });
    
    console.log('[CardEditor] Final changes:', Object.keys(changes));
    return changes;
  });

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

  // 渲染带高亮的输入框
  const renderHighlightedInput = (
    field: keyof DictionaryCard,
    value: string,
    onChange: (value: string) => void,
    isTextarea: boolean = false,
    rows: number = 3,
    placeholder?: string
  ) => {
    const change = changedFields[field];
    
    if (!change?.hasChanged) {
      // 没有变化，正常显示
      if (isTextarea) {
        return (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            placeholder={placeholder}
            className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        );
      }
      return (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-10"
        />
      );
    }

    // 有变化，显示高亮
    return (
      <div className="space-y-2">
        {/* 原始内容 */}
        {change.originalContent && (
          <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            {change.originalContent}
          </div>
        )}
        
        {/* 新增内容 - 高亮显示 */}
        {change.newContent && (
          <div className="rounded-md border-2 border-green-500/50 bg-green-500/10 px-3 py-2 text-sm">
            <div className="mb-1 text-xs font-medium text-green-600 dark:text-green-400">
              ✨ 新增内容
            </div>
            {change.newContent}
          </div>
        )}
        
        {/* 可编辑的完整内容 */}
        {isTextarea ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            placeholder={placeholder}
            className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        ) : (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-10"
          />
        )}
      </div>
    );
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
            {renderHighlightedInput(
              'phonetic',
              card.phonetic,
              (value) => setCard({ ...card, phonetic: value }),
              false
            )}
          </div>

          {/* 母语释义 */}
          <div className="space-y-1.5">
            <Label htmlFor="definition-native" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('definitionNative')}
            </Label>
            {renderHighlightedInput(
              'definition_native',
              card.definition_native,
              (value) => setCard({ ...card, definition_native: value }),
              true,
              3
            )}
          </div>

          {/* 目标语释义 */}
          <div className="space-y-1.5">
            <Label htmlFor="definition-target" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('definitionTarget')}
            </Label>
            {renderHighlightedInput(
              'definition_target',
              card.definition_target,
              (value) => setCard({ ...card, definition_target: value }),
              true,
              3
            )}
          </div>

          {/* 学习要点 */}
          <div className="space-y-1.5">
            <Label htmlFor="learning-notes" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('learningNotes')}
            </Label>
            {renderHighlightedInput(
              'learning_notes',
              card.learning_notes,
              (value) => setCard({ ...card, learning_notes: value }),
              true,
              3,
              t('learningNotesPlaceholder')
            )}
            <p className="text-xs text-muted-foreground">
              {mode === 'efficient' ? t('learningNotesHintEfficient') : t('learningNotesHint')}
            </p>
          </div>

          {/* 助记法 */}
          <div className="space-y-1.5">
            <Label htmlFor="mnemonics" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('mnemonics')}
            </Label>
            {renderHighlightedInput(
              'mnemonics',
              card.mnemonics,
              (value) => setCard({ ...card, mnemonics: value }),
              true,
              2
            )}
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
