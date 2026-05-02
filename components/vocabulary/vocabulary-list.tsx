'use client';

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Search, Plus, ChevronDown } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface Word {
  id: string;
  word: string;
  phonetic: string | null;
  definition_native: string | null;
  definition_target: string | null;
  proficiency_level: number;
  language: string;
  created_at: string;
  review_count?: number;
  error_count?: number;
  tags?: string[];
}

interface VocabularyListProps {
  initialWords: Word[];
}

export function VocabularyList({ initialWords }: VocabularyListProps) {
  const t = useTranslations('vocabulary');
  const locale = useLocale();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // 获取所有唯一的标签
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    initialWords.forEach(word => {
      word.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [initialWords]);

  // 熟练度计算
  const getProficiencyStatus = (word: Word) => {
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

  // 过滤单词
  const filteredWords = useMemo(() => {
    return initialWords.filter((word) => {
      // 语言过滤
      if (selectedLanguage !== 'all' && word.language !== selectedLanguage) {
        return false;
      }

      // 标签过滤
      if (selectedTag !== 'all') {
        if (!word.tags || !word.tags.includes(selectedTag)) {
          return false;
        }
      }

      // 搜索过滤
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          word.word.toLowerCase().includes(query) ||
          word.definition_native?.toLowerCase().includes(query) ||
          word.definition_target?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [initialWords, selectedLanguage, selectedTag, searchQuery]);

  const languages = [
    { key: 'all', label: t('all') },
    { key: 'en', label: t('english') },
    { key: 'ja', label: t('japanese') },
    { key: 'zh', label: t('chinese') },
  ];

  return (
    <div className="space-y-6">
      {/* 工具栏 */}
      <div className="space-y-4">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <Input
            type="text"
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-10"
          />
        </div>

        {/* 过滤器 */}
        <div className="flex gap-3">
          {/* 语言下拉列表 */}
          <div className="relative flex-1">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="h-10 w-full appearance-none rounded-md border border-border bg-background px-3 pr-8 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {languages.map((lang) => (
                <option key={lang.key} value={lang.key}>
                  {lang.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          </div>

          {/* 标签下拉列表 */}
          <div className="relative flex-1">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="h-10 w-full appearance-none rounded-md border border-border bg-background px-3 pr-8 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">{t('allTags')}</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* 单词列表 */}
      {filteredWords.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-4 py-16">
          <p className="text-sm text-muted-foreground">{t('noWords')}</p>
          <Link
            href="/learn"
            className="flex h-10 items-center justify-center gap-2 rounded-md bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-80"
          >
            <Plus strokeWidth={1.5} className="h-4 w-4" />
            {t('addFirstWord')}
          </Link>
        </div>
      ) : (
        <div className="space-y-0 border border-border">
          {/* 表头 - 仅在桌面端显示 */}
          <div className="hidden border-b border-border bg-muted px-4 py-3 sm:grid sm:grid-cols-12 sm:gap-4">
            <div className="col-span-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('word')}
            </div>
            <div className="col-span-5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('definition')}
            </div>
            <div className="col-span-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('proficiency')}
            </div>
            <div className="col-span-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('createdAt')}
            </div>
          </div>

          {/* 单词行 */}
          {filteredWords.map((word) => {
            const proficiency = getProficiencyStatus(word);
            return (
              <Link
                key={word.id}
                href={`/vocabulary/${word.id}`}
                className="block border-b border-border px-4 py-4 transition-colors last:border-b-0 hover:bg-muted sm:grid sm:grid-cols-12 sm:gap-4 sm:items-center"
              >
                {/* 单词和音标 */}
                <div className="col-span-3 space-y-1">
                  <div className="font-medium text-foreground">{word.word}</div>
                  {word.phonetic && (
                    <div className="text-xs text-muted-foreground">{word.phonetic}</div>
                  )}
                  {/* 标签 */}
                  {word.tags && word.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {word.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 释义 */}
                <div className="col-span-5 mt-2 sm:mt-0">
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {word.definition_native || word.definition_target || '—'}
                  </p>
                </div>

                {/* 熟练度 */}
                <div className="col-span-2 mt-2 flex items-center gap-2 sm:mt-0">
                  <div className={`h-2 w-2 rounded-full ${proficiency.color}`} />
                  <span className="text-xs text-muted-foreground">{proficiency.label}</span>
                </div>

                {/* 创建日期 - 仅桌面端显示 */}
                <div className="col-span-2 hidden text-xs text-muted-foreground sm:block">
                  {new Date(word.created_at).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
