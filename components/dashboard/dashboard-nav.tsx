'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  Library,
  GraduationCap,
  Settings,
  LogOut,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { href: '/dashboard',  labelKey: 'dashboard',  icon: LayoutDashboard },
  { href: '/learn',      labelKey: 'learn',      icon: BookOpen },
  { href: '/vocabulary', labelKey: 'vocabulary',  icon: Library },
  { href: '/practice',   labelKey: 'practice',    icon: GraduationCap },
  { href: '/settings',   labelKey: 'settings',    icon: Settings },
] as const;

export function DashboardNav({ mobile = false }: { mobile?: boolean }) {
  const t = useTranslations('navigation');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  /* ── 移动端底部导航 ── */
  if (mobile) {
    return (
      <div className="flex h-14 items-center justify-around px-2">
        {navItems.map(({ href, labelKey, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 transition-colors',
                active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon strokeWidth={1.5} className="h-5 w-5" />
              {/* 极小字号，保持视觉清爽 */}
              <span className="text-[10px] leading-none">{t(labelKey)}</span>
            </Link>
          );
        })}
      </div>
    );
  }

  /* ── PC 侧边栏 ── */
  return (
    <div className="flex h-full flex-col">
      {/* Logo 区 */}
      <div className="flex h-14 items-center border-b border-border px-5">
        <span className="text-sm font-semibold tracking-tight text-foreground">
          {tCommon('appName')}
        </span>
      </div>

      {/* 导航项 */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {navItems.map(({ href, labelKey, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon strokeWidth={1.5} className="h-4 w-4 shrink-0" />
              {t(labelKey)}
            </Link>
          );
        })}
      </nav>

      {/* 底部工具区 */}
      <div className="border-t border-border px-3 py-4 space-y-1">
        {/* 登出 */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <LogOut strokeWidth={1.5} className="h-4 w-4 shrink-0" />
          {tAuth('logout')}
        </button>
      </div>
    </div>
  );
}
