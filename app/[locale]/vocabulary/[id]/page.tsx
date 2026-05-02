import { createClient } from '@/lib/supabase/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { VocabularyDetail } from '@/components/vocabulary/vocabulary-detail';

export default async function VocabularyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 获取单词详情
  const { data: wordData, error } = await supabase
    .from('dictionaries')
    .select('*')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single();

  if (error || !wordData) {
    notFound();
  }

  // 转换数据类型
  const word = {
    ...wordData,
    proficiency_level: wordData.proficiency_level || 0,
    examples: Array.isArray(wordData.examples)
      ? (wordData.examples as Array<{ sentence: string; translation: string }>)
      : null,
    tags: wordData.tags || undefined,
  };

  return <VocabularyDetail word={word} />;
}
