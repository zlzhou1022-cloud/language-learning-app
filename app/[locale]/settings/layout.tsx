import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { AuthenticatedLayout } from '@/components/layouts/authenticated-layout';

export default async function SettingsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
