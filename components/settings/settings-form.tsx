'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUserStore } from '@/lib/store/userStore';
import { createClient } from '@/lib/supabase/client';
import { User, Lock, Check, AlertCircle, LogOut } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';

export function SettingsForm() {
  const t = useTranslations('settings');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { profile, fetchProfile, updateNickname } = useUserStore();

  const [nickname, setNickname] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [nicknameLoading, setNicknameLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const [nicknameMessage, setNicknameMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 加载用户资料
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // 同步昵称到本地状态
  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname || '');
    }
  }, [profile]);

  const handleUpdateNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    setNicknameLoading(true);
    setNicknameMessage(null);

    try {
      await updateNickname(nickname);
      setNicknameMessage({ type: 'success', text: t('nicknameUpdated') });
    } catch (error) {
      setNicknameMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : t('updateFailed') 
      });
    } finally {
      setNicknameLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage(null);

    // 验证密码
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: t('passwordTooShort') });
      setPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: t('passwordMismatch') });
      setPasswordLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      
      // Supabase 的 updateUser 会自动验证当前密码（如果启用了）
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setPasswordMessage({ type: 'success', text: t('passwordUpdated') });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : t('updateFailed') 
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">{tCommon('loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* 页头 */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t('title')}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {/* 昵称设置 */}
      <div className="space-y-6 border-l-2 border-border pl-6">
        <div className="space-y-1">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            {t('profileSection')}
          </h2>
        </div>

        <form onSubmit={handleUpdateNickname} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('email')}
            </Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="h-10 rounded-md border-border bg-muted text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nickname" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('nickname')}
            </Label>
            <Input
              id="nickname"
              type="text"
              placeholder={t('nicknamePlaceholder')}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={nicknameLoading}
              className="h-10 rounded-md border-border bg-transparent text-sm focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={nicknameLoading || nickname === (profile.nickname || '')}
            className="flex h-10 items-center justify-center gap-2 rounded-md bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            <User strokeWidth={1.5} className="h-4 w-4" />
            {nicknameLoading ? tCommon('loading') : t('updateNickname')}
          </button>

          {nicknameMessage && (
            <div className="flex items-start gap-2">
              {nicknameMessage.type === 'success' ? (
                <Check strokeWidth={1.5} className="h-4 w-4 text-foreground mt-0.5" />
              ) : (
                <AlertCircle strokeWidth={1.5} className="h-4 w-4 text-destructive mt-0.5" />
              )}
              <p className={`text-sm ${nicknameMessage.type === 'success' ? 'text-foreground' : 'text-destructive'}`}>
                {nicknameMessage.text}
              </p>
            </div>
          )}
        </form>
      </div>

      {/* 密码设置 */}
      <div className="space-y-6 border-l-2 border-border pl-6">
        <div className="space-y-1">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            {t('securitySection')}
          </h2>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="new-password" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('newPassword')}
            </Label>
            <Input
              id="new-password"
              type="password"
              placeholder={t('newPasswordPlaceholder')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={passwordLoading}
              minLength={6}
              className="h-10 rounded-md border-border bg-transparent text-sm focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-password" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('confirmPassword')}
            </Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder={t('confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={passwordLoading}
              minLength={6}
              className="h-10 rounded-md border-border bg-transparent text-sm focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={passwordLoading || !newPassword || !confirmPassword}
            className="flex h-10 items-center justify-center gap-2 rounded-md bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            <Lock strokeWidth={1.5} className="h-4 w-4" />
            {passwordLoading ? tCommon('loading') : t('updatePassword')}
          </button>

          {passwordMessage && (
            <div className="flex items-start gap-2">
              {passwordMessage.type === 'success' ? (
                <Check strokeWidth={1.5} className="h-4 w-4 text-foreground mt-0.5" />
              ) : (
                <AlertCircle strokeWidth={1.5} className="h-4 w-4 text-destructive mt-0.5" />
              )}
              <p className={`text-sm ${passwordMessage.type === 'success' ? 'text-foreground' : 'text-destructive'}`}>
                {passwordMessage.text}
              </p>
            </div>
          )}
        </form>
      </div>

      {/* 偏好设置 */}
      <div className="space-y-6 border-l-2 border-border pl-6">
        <div className="space-y-1">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            {t('preferencesSection')}
          </h2>
        </div>

        <div className="space-y-5">
          {/* 语言切换 */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('language')}
            </Label>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
            </div>
          </div>

          {/* 主题切换 */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('theme')}
            </Label>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* 账户管理 */}
      <div className="space-y-6 border-l-2 border-border pl-6">
        <div className="space-y-1">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            {t('accountSection')}
          </h2>
        </div>

        <button
          onClick={handleLogout}
          className="flex h-10 items-center justify-center gap-2 rounded-md border border-destructive px-6 text-sm font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut strokeWidth={1.5} className="h-4 w-4" />
          {tAuth('logout')}
        </button>
      </div>
    </div>
  );
}
