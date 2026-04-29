import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams, origin } = url;

  const pathParts = url.pathname.split('/');
  const locale = pathParts[1] ?? 'en';

  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') ?? 'magiclink';
  const next = searchParams.get('next') ?? `/${locale}/dashboard`;

  console.log('[auth/callback] full URL:', request.url);
  console.log('[auth/callback] params:', { code: !!code, tokenHash: !!tokenHash, type, locale });

  const supabase = await createClient();

  // 处理 token_hash（magic link）
  // 注意：必须先验证 token，即使用户已登录
  // 这样可以防止旧的 magic link 被重复使用
  if (tokenHash && type) {
    console.log('[auth/callback] verifying OTP with token_hash');
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as 'magiclink' | 'email',
    });
    
    if (error) {
      console.error('[auth/callback] verifyOtp error:', error.message);
      // 如果已经登录但 token 无效，先登出再显示错误
      const { data: { user: existingUser } } = await supabase.auth.getUser();
      if (existingUser) {
        console.log('[auth/callback] logging out user due to invalid token');
        await supabase.auth.signOut();
      }
      return buildRedirect(request, `${origin}/${locale}/login?message=link_expired`);
    }
    
    if (data?.user) {
      console.log('[auth/callback] verifyOtp success, user:', data.user.email);
      return buildRedirect(request, `${origin}${next}`);
    }
  }

  // 处理 code（PKCE flow）
  if (code) {
    console.log('[auth/callback] exchanging code for session');
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('[auth/callback] exchangeCode error:', error.message);
      return buildRedirect(request, `${origin}/${locale}/login?message=link_expired`);
    }
    
    console.log('[auth/callback] exchangeCode success');
    return buildRedirect(request, `${origin}${next}`);
  }

  // 如果没有有效的认证参数，检查是否已登录
  const { data: { user: existingUser } } = await supabase.auth.getUser();
  if (existingUser) {
    console.log('[auth/callback] no auth params but already logged in, redirecting to dashboard');
    return buildRedirect(request, `${origin}${next}`);
  }

  console.log('[auth/callback] no valid params found and not logged in');
  return buildRedirect(request, `${origin}/${locale}/login?message=link_expired`);
}

function buildRedirect(request: Request, destination: string) {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';
  if (isLocalEnv || !forwardedHost) {
    return NextResponse.redirect(destination);
  }
  const destUrl = new URL(destination);
  destUrl.host = forwardedHost;
  destUrl.protocol = 'https:';
  return NextResponse.redirect(destUrl.toString());
}
