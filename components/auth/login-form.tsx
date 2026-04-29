'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useRouter } from '@/i18n/routing';

type LoginMode = 'password' | 'magic-link';

// 清除 URL 中的错误参数
function clearUrlMessage() {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (url.searchParams.has('message')) {
    url.searchParams.delete('message');
    window.history.replaceState({}, '', url.toString());
  }
}

export function LoginForm({ initialMessage }: { initialMessage?: string }) {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();

  const [mode, setMode] = useState<LoginMode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // 用于控制 URL 错误信息的显示
  const [showUrlError, setShowUrlError] = useState(false);

  // 在组件挂载时检查是否有 URL 错误信息
  useEffect(() => {
    if (initialMessage === 'link_expired') {
      setShowUrlError(true);
    }
  }, [initialMessage]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setShowUrlError(false); // 隐藏 URL 错误信息
    clearUrlMessage(); // 清除 URL 参数
    
    try {
      // 调用自定义 API Route，发送对应语言的邮件
      const res = await fetch('/api/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          locale,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: json.error ?? tCommon('error') });
      } else {
        setMessage({ type: 'success', text: t('checkEmail') });
        setEmail('');
      }
    } catch {
      setMessage({ type: 'error', text: tCommon('error') });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setShowUrlError(false); // 隐藏 URL 错误信息
    clearUrlMessage(); // 清除 URL 中的错误信息
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        let msg = error.message;
        if (msg.includes('Invalid login credentials')) msg = t('invalidCredentials');
        else if (msg.includes('Email not confirmed')) msg = t('emailNotConfirmed');
        else if (msg.includes('rate limit')) msg = t('rateLimitExceeded');
        setMessage({ type: 'error', text: msg });
      } else if (data.user) {
        router.push('/dashboard');
      }
    } catch {
      setMessage({ type: 'error', text: tCommon('error') });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) return;
    setLoading(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        let msg = error.message;
        if (msg.includes('already registered')) msg = t('emailAlreadyRegistered');
        else if (msg.includes('password')) msg = t('passwordTooWeak');
        setMessage({ type: 'error', text: msg });
      } else if (data.user) {
        setMessage({
          type: 'success',
          text: data.user.confirmed_at ? t('signupSuccessCanLogin') : t('signupSuccess'),
        });
      }
    } catch {
      setMessage({ type: 'error', text: tCommon('error') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* URL 错误信息提示 */}
      {showUrlError && (
        <div className="border-l-2 border-destructive pl-4">
          <p className="text-sm text-destructive">{t('linkExpired')}</p>
        </div>
      )}

      {/* 标题区 */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {tCommon('appName')}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {mode === 'magic-link' ? t('loginDescription') : t('passwordLoginDescription')}
        </p>
      </div>

      {/* 模式切换 — 细线 tab */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => { 
            setMode('password'); 
            setMessage(null);
            setShowUrlError(false); // 隐藏 URL 错误信息
            clearUrlMessage();
          }}
          className={[
            'pb-2.5 pr-5 text-sm transition-colors',
            mode === 'password'
              ? 'border-b-2 border-foreground font-medium text-foreground -mb-px'
              : 'text-muted-foreground hover:text-foreground',
          ].join(' ')}
        >
          {t('passwordLogin')}
        </button>
        <button
          type="button"
          onClick={() => { 
            setMode('magic-link'); 
            setMessage(null);
            setShowUrlError(false); // 隐藏 URL 错误信息
            clearUrlMessage();
          }}
          className={[
            'pb-2.5 pl-5 text-sm transition-colors',
            mode === 'magic-link'
              ? 'border-b-2 border-foreground font-medium text-foreground -mb-px'
              : 'text-muted-foreground hover:text-foreground',
          ].join(' ')}
        >
          {t('magicLink')}
        </button>
      </div>

      {/* 表单区 */}
      {mode === 'magic-link' ? (
        <form onSubmit={handleMagicLink} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="ml-email" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('email')}
            </label>
            <Input
              id="ml-email"
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="h-10 rounded-md border-border bg-transparent text-sm focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-foreground text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            <Mail strokeWidth={1.5} className="h-4 w-4" />
            {loading ? tCommon('loading') : t('sendMagicLink')}
          </button>
        </form>
      ) : (
        <form onSubmit={handlePasswordLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="pw-email" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('email')}
            </label>
            <Input
              id="pw-email"
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="h-10 rounded-md border-border bg-transparent text-sm focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="pw-password" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('password')}
            </label>
            <Input
              id="pw-password"
              type="password"
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
              className="h-10 rounded-md border-border bg-transparent text-sm focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* 操作按钮行 */}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-foreground text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-40"
            >
              <Lock strokeWidth={1.5} className="h-4 w-4" />
              {loading ? tCommon('loading') : t('login')}
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-border text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
              {t('signup')}
            </button>
          </div>
        </form>
      )}

      {/* 消息提示 */}
      {message && (
        <p className={[
          'text-sm leading-relaxed',
          message.type === 'success' ? 'text-foreground' : 'text-destructive',
        ].join(' ')}>
          {message.text}
        </p>
      )}
    </div>
  );
}
