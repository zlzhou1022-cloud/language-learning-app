import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('settings');

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-8 py-12">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t('title')}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">Coming soon.</p>
      </div>
    </div>
  );
}
