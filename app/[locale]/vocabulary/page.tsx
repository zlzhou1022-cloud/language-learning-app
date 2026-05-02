import { createClient } from '@/lib/supabase/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { VocabularyList } from '@/components/vocabulary/vocabulary-list';

export default async function VocabularyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const t = await getTranslations('vocabulary');
  const { data: { user } } = await supabase.auth.getUser();

  // 获取用户所有单词
  const { data: wordsData, error } = await supabase
    .from('dictionaries')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch words:', error);
  }

  // 转换数据类型
  const words = (wordsData || []).map(word => ({
    ...word,
    proficiency_level: word.proficiency_level || 0,
    tags: word.tags || undefined,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-8 py-12">
      {/* 页头 */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t('title')}
        </h1>
      </div>

      {/* 词汇列表组件 */}
      <VocabularyList initialWords={words} />
    </div>
  );
}
