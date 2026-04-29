import { createClient as createAdminClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { emailTemplates, type SupportedLocale } from '@/lib/email/templates';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/lib/database.types';

const resend = new Resend(process.env.RESEND_API_KEY);

function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return createAdminClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, locale } = body as { email: string; locale: string };

    if (!email || !locale) {
      return NextResponse.json({ error: 'Missing email or locale' }, { status: 400 });
    }

    const origin = request.nextUrl.origin;
    // redirectTo 指向 callback，callback 再处理 token_hash
    const redirectTo = `${origin}/${locale}/auth/callback`;

    // 1. 用 Admin API 生成 Magic Link token_hash（不触发 Supabase 发邮件）
    const admin = createSupabaseAdmin();
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo },
    });

    if (error || !data?.properties?.hashed_token) {
      console.error('generateLink error:', error);
      return NextResponse.json(
        { error: error?.message ?? 'Failed to generate link' },
        { status: 400 }
      );
    }

    // 直接构建指向我们 callback 的链接，带上 token_hash 参数
    // 这样可以避免 Supabase 的中间重定向导致的 token 消费问题
    const tokenHash = data.properties.hashed_token;
    const confirmationUrl = `${redirectTo}?token_hash=${encodeURIComponent(tokenHash)}&type=magiclink`;

    // 2. 选择对应语言的邮件模板
    const templateLocale: SupportedLocale =
      locale in emailTemplates ? (locale as SupportedLocale) : 'en';
    const template = emailTemplates[templateLocale]({ confirmationUrl });

    // 3. 用 Resend 发送多语言邮件
    const { error: sendError } = await resend.emails.send({
      from: `Language Learning <${process.env.SMTP_SENDER_EMAIL ?? 'onboarding@resend.dev'}>`,
      to: email,
      subject: template.subject,
      html: template.html,
    });

    if (sendError) {
      console.error('Resend error:', sendError);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('send-magic-link error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
