import { setRequestLocale } from 'next-intl/server';
import { LearnInterface } from '@/components/learn/learn-interface';

export default async function LearnPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ word?: string; id?: string }>;
}) {
  const { locale } = await params;
  const { word, id } = await searchParams;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-4xl px-8 py-12">
      <LearnInterface initialWord={word} wordId={id} />
    </div>
  );
}
