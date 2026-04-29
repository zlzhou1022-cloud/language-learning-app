'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function AuthConfirmPage() {
  const router = useRouter();
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const [status, setStatus] = useState<'loading' | 'error'>('loading');

  useEffect(() => {
    const supabase = createClient();

    // onAuthStateChange 处理 implicit flow 的 fragment token
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          router.replace('/dashboard');
        }
      }
    );

    // 检查当前 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/dashboard');
      }
    });

    // 5 秒超时
    const timeout = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) setStatus('error');
      });
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm space-y-4">
          <div className="border-l-2 border-destructive pl-4">
            <p className="text-sm text-destructive">{t('linkExpired')}</p>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            {t('backToLogin')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <div className="h-4 w-4 animate-spin rounded-full border border-border border-t-foreground" />
        {tCommon('loading')}
      </div>
    </div>
  );
}
