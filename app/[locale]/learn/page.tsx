import { setRequestLocale } from 'next-intl/server';
import { LearnInterface } from '@/components/learn/learn-interface';

export default async function LearnPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ word?: string; wordId?: string; mode?: 'continue' | 'edit' }>;
}) {
  const { locale } = await params;
  const { word, wordId, mode } = await searchParams;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-4xl px-8 py-12">
      <LearnInterface initialWord={word} wordId={wordId} editMode={mode} />
    </div>
  );
}
