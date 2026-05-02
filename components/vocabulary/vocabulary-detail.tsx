'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { ArrowLeft, MessageSquare, Edit, Trash2, Tag, X, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';

interface Word {
  id: string;
  word: string;
  phonetic: string | null;
  definition_native: string | null;
  definition_target: string | null;
  learning_notes: string | null;
  mnemonics: string | null;
  examples: Array<{ sentence: string; translation: string }> | null;
  proficiency_level: number;
  review_count?: number;
  error_count?: number;
  created_at: string;
  last_reviewed_at?: string | null;
  tags?: string[];
}

interface VocabularyDetailProps {
  word: Word;
}

export function VocabularyDetail({ word: initialWord }: VocabularyDetailProps) {
  const t = useTranslations('vocabulary');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  
  const [word, setWord] = useState(initialWord);
  const [deleting, setDeleting] = useState(false);
  const [managingTags, setManagingTags] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [savingTags, setSavingTags] = useState(false);

  const handleDelete = async () => {
    if (!confirm(t('deleteConfirm'))) return;

    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('dictionaries')
        .delete()
        .eq('id', word.id);

      if (error) throw error;

      router.push('/vocabulary');
    } catch (error) {
      console.error('Failed to delete word:', error);
      alert('删除失败，请重试');
    } finally {
      setDeleting(false);
    }
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    const currentTags = word.tags || [];
    if (currentTags.includes(newTag.trim())) {
      alert('标签已存在');
      return;
    }

    setWord({
      ...word,
      tags: [...currentTags, newTag.trim()],
    });
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setWord({
      ...word,
      tags: (word.tags || []).filter(tag => tag !== tagToRemove),
    });
  };

  const handleSaveTags = async () => {
    setSavingTags(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('dictionaries')
        .update({ tags: word.tags || [] })
        .eq('id', word.id);

      if (error) throw error;

      setManagingTags(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to save tags:', error);
      alert('保存标签失败，请重试');
    } finally {
      setSavingTags(false);
    }
  };

  // 熟练度状态
  const getProficiencyStatus = () => {
    const errorCount = word.error_count || 0;
    const reviewCount = word.review_count || 0;

    if (errorCount > 3) {
      return { color: 'bg-red-500', label: t('proficiencyNew') };
    } else if (errorCount >= 1 && errorCount <= 3) {
      return { color: 'bg-yellow-500', label: t('proficiencyLearning') };
    } else if (reviewCount > 0) {
      return { color: 'bg-green-500', label: t('proficiencyMastered') };
    }
    return { color: 'bg-gray-400', label: t('proficiencyNew') };
  };

  const proficiency = getProficiencyStatus();

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-8 py-12">
      {/* 返回按钮 */}
      <Link
        href="/vocabulary"
        className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft strokeWidth={1.5} className="h-4 w-4" />
        {t('backToList')}
      </Link>

      {/* 单词头部 */}
      <div className="space-y-4 border-b border-border pb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <h1 className="text-5xl font-bold tracking-tight text-foreground">
              {word.word}
            </h1>
            {word.phonetic && (
              <p className="text-xl text-muted-foreground">{word.phonetic}</p>
            )}
            
            {/* 标签显示 */}
            <div className="flex flex-wrap items-center gap-2">
              {word.tags && word.tags.length > 0 && (
                <>
                  {word.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-3 py-1 text-sm text-foreground"
                    >
                      <Tag className="h-3 w-3" strokeWidth={1.5} />
                      {tag}
                    </span>
                  ))}
                </>
              )}
              <button
                onClick={() => setManagingTags(true)}
                className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Tag className="h-3 w-3" strokeWidth={1.5} />
                {t('manageTags')}
              </button>
            </div>
          </div>
          
          {/* 熟练度指示器 */}
          <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
            <div className={`h-3 w-3 rounded-full ${proficiency.color}`} />
            <span className="text-sm text-muted-foreground">{proficiency.label}</span>
          </div>
        </div>
      </div>

      {/* 标签管理对话框 */}
      {managingTags && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-lg border border-border bg-background p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">{t('manageTags')}</h2>
              <button
                onClick={() => {
                  setManagingTags(false);
                  setWord(initialWord); // 取消时恢复原始标签
                }}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* 当前标签 */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t('tags')}</p>
              <div className="flex flex-wrap gap-2">
                {word.tags && word.tags.length > 0 ? (
                  word.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-3 py-1 text-sm text-foreground"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <X className="h-3 w-3" strokeWidth={1.5} />
                      </button>
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">暂无标签</p>
                )}
              </div>
            </div>

            {/* 添加新标签 */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t('addNewTag')}</p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder={t('tagName')}
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="h-9"
                />
                <button
                  onClick={handleAddTag}
                  className="flex h-9 items-center justify-center gap-1 rounded-md border border-border px-3 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <Plus className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setManagingTags(false);
                  setWord(initialWord);
                }}
                className="flex h-9 flex-1 items-center justify-center rounded-md border border-border text-sm text-foreground transition-colors hover:bg-muted"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSaveTags}
                disabled={savingTags}
                className="flex h-9 flex-1 items-center justify-center rounded-md bg-foreground text-sm text-background transition-opacity hover:opacity-80 disabled:opacity-40"
              >
                {savingTags ? tCommon('loading') : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 内容区域 - 保持原有内容 */}
      <div className="space-y-6">
        {/* 母语释义 */}
        {word.definition_native && (
          <div className="space-y-2 border-b border-border pb-6">
            <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('nativeDefinition')}
            </h2>
            <p className="text-base leading-relaxed text-foreground">
              {word.definition_native}
            </p>
          </div>
        )}

        {/* 目标语释义 */}
        {word.definition_target && (
          <div className="space-y-2 border-b border-border pb-6">
            <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('targetDefinition')}
            </h2>
            <p className="text-base leading-relaxed text-foreground">
              {word.definition_target}
            </p>
          </div>
        )}

        {/* 学习要点 */}
        {word.learning_notes && (
          <div className="space-y-2 border-b border-border pb-6">
            <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('learningNotes')}
            </h2>
            <p className="text-base leading-relaxed text-foreground">
              {word.learning_notes}
            </p>
          </div>
        )}

        {/* 助记方法 */}
        {word.mnemonics && (
          <div className="space-y-2 border-b border-border pb-6">
            <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('mnemonics')}
            </h2>
            <p className="text-base leading-relaxed text-foreground">
              {word.mnemonics}
            </p>
          </div>
        )}

        {/* 例句 */}
        {word.examples && word.examples.length > 0 && (
          <div className="space-y-4 border-b border-border pb-6">
            <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('examples')}
            </h2>
            <div className="space-y-4">
              {word.examples.map((example, index) => (
                <div key={index} className="space-y-1 border-l-2 border-border pl-4">
                  <p className="text-base text-foreground">{example.sentence}</p>
                  <p className="text-sm text-muted-foreground">{example.translation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 学习统计 */}
        <div className="space-y-4 rounded-md border border-border bg-muted/30 p-6">
          <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {t('reviewStats')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t('addedDate')}</p>
              <p className="text-sm font-medium text-foreground">
                {new Date(word.created_at).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t('reviewCount')}</p>
              <p className="text-sm font-medium text-foreground">{word.review_count || 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t('errorCount')}</p>
              <p className="text-sm font-medium text-foreground">{word.error_count || 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t('lastReview')}</p>
              <p className="text-sm font-medium text-foreground">
                {word.last_reviewed_at
                  ? new Date(word.last_reviewed_at).toLocaleDateString(locale, {
                      month: 'short',
                      day: 'numeric',
                    })
                  : t('never')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-col gap-3 border-t border-border pt-8 sm:flex-row">
        <Link
          href={`/learn?wordId=${word.id}&mode=continue`}
          className="flex h-12 items-center justify-center gap-2 rounded-md bg-foreground text-sm font-medium text-background transition-opacity hover:opacity-80 sm:flex-1"
        >
          <MessageSquare strokeWidth={1.5} className="h-4 w-4" />
          {t('continueLearn')}
        </Link>
        
        <Link
          href={`/learn?wordId=${word.id}&mode=edit`}
          className="flex h-12 items-center justify-center gap-2 rounded-md border border-border text-sm font-medium text-foreground transition-colors hover:bg-muted sm:flex-1"
        >
          <Edit strokeWidth={1.5} className="h-4 w-4" />
          {t('edit')}
        </Link>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex h-12 items-center justify-center gap-2 rounded-md border border-destructive text-sm font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-40 sm:flex-none sm:px-6"
        >
          <Trash2 strokeWidth={1.5} className="h-4 w-4" />
          {t('delete')}
        </button>
      </div>
    </div>
  );
}
