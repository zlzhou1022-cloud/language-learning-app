import { setRequestLocale } from 'next-intl/server';
import { SettingsForm } from '@/components/settings/settings-form';

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-2xl space-y-12 px-8 py-12">
      <SettingsForm />
    </div>
  );
}
