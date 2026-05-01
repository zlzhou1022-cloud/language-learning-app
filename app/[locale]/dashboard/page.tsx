import { createClient } from '@/lib/supabase/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BookOpen, Plus } from 'lucide-react';
import { Link } from '@/i18n/routing';

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

  // 获取用户 profile（包含昵称）
  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, email')
    .eq('id', user!.id)
    .single();

  const { count } = await supabase
    .from('dictionaries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id);

  // 获取最近的单词（最多5个）
  const { data: recentWords } = await supabase
    .from('dictionaries')
    .select('id, word, created_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // 获取今日新学习的单词数量
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: todayLearnedCount } = await supabase
    .from('dictionaries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)
    .gte('created_at', today.toISOString());

  // 今日待复习数量（暂时为0，等待后续实现）
  const todayReviewCount = 0;

  // 优先显示昵称，否则显示邮箱用户名
  const displayName = profile?.nickname || profile?.email?.split('@')[0] || '';

  return (
    <div className="mx-auto max-w-4xl space-y-12 px-8 py-12">

      {/* 页头 */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t('welcome')}, {displayName}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t('title')}
        </p>
      </div>

      {/* 快速操作 */}
      <div className="flex gap-3">
        <Link
          href="/learn"
          className="flex h-10 items-center justify-center gap-2 rounded-md bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-80"
        >
          <Plus strokeWidth={1.5} className="h-4 w-4" />
          {t('addWord')}
        </Link>
      </div>

      {/* 统计卡片区 — 档案卡风格 */}
      <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {/* 词汇总数卡片 - 右下角箭头跳转 */}
        <div className="relative flex flex-col gap-4 bg-background p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('totalWords')}
            </span>
            <BookOpen strokeWidth={1.5} className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-end justify-between">
            <div className="text-4xl font-semibold tracking-tight text-foreground">
              {count ?? 0}
            </div>
            {/* 右下角箭头链接 */}
            <Link
              href="/vocabulary"
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title={t('totalWords')}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* 今日待复习卡片 */}
        <div className="flex flex-col gap-4 bg-background p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('todayReviewed')}
            </span>
          </div>
          <div className="text-4xl font-semibold tracking-tight text-foreground">
            {todayReviewCount}
          </div>
        </div>

        {/* 今日已学习卡片 */}
        <div className="flex flex-col gap-4 bg-background p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('todayLearned')}
            </span>
          </div>
          <div className="text-4xl font-semibold tracking-tight text-foreground">
            {todayLearnedCount ?? 0}
          </div>
        </div>
      </div>

      {/* 最近的单词列表 */}
      {recentWords && recentWords.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            {t('recentWords')}
          </h2>
          <div className="space-y-2">
            {recentWords.map((word) => (
              <Link
                key={word.id}
                href={`/learn?wordId=${word.id}`}
                className="flex items-center justify-between border-l-2 border-border py-2 pl-4 pr-2 transition-colors hover:border-foreground hover:bg-muted"
              >
                <span className="text-sm font-medium text-foreground">{word.word}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(word.created_at).toLocaleDateString(locale, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

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
