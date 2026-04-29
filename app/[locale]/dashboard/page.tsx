import { createClient } from '@/lib/supabase/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BookOpen } from 'lucide-react';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const t = await getTranslations('dashboard');
  const { data: { user } } = await supabase.auth.getUser();

  const { count } = await supabase
    .from('dictionaries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id);

  const username = user?.email?.split('@')[0] ?? '';

  return (
    <div className="mx-auto max-w-4xl space-y-12 px-8 py-12">

      {/* 页头 */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t('welcome')}, {username}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t('title')}
        </p>
      </div>

      {/* 统计卡片区 — 档案卡风格 */}
      <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {/* 词汇总数卡片 */}
        <div className="flex flex-col gap-4 bg-background p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('totalWords')}
            </span>
            <BookOpen strokeWidth={1.5} className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-4xl font-semibold tracking-tight text-foreground">
            {count ?? 0}
          </div>
        </div>

        {/* 占位卡片 */}
        <div className="flex flex-col gap-4 bg-background p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('recentWords')}
            </span>
          </div>
          <div className="text-4xl font-semibold tracking-tight text-foreground">—</div>
        </div>
      </div>

      {/* 空状态提示 */}
      {(count === 0 || count === null) && (
        <div className="border-l-2 border-border pl-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t('noWords')}
          </p>
        </div>
      )}
    </div>
  );
}
