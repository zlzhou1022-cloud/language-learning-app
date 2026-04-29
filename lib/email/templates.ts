interface TemplateProps {
  confirmationUrl: string;
}

export const emailTemplates = {
  zh: ({ confirmationUrl }: TemplateProps) => ({
    subject: '您的登录链接 — 语言学习',
    html: `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, "PingFang SC", "Helvetica Neue", Arial, sans-serif; background: #FDFDFD; color: #1A1A1A; padding: 48px 24px; }
    .wrap { max-width: 480px; margin: 0 auto; }
    .label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #888; margin-bottom: 36px; }
    h1 { font-size: 20px; font-weight: 600; letter-spacing: -0.02em; margin-bottom: 10px; }
    p { font-size: 14px; line-height: 1.7; color: #666; margin-bottom: 28px; }
    .btn { display: inline-block; background: #1A1A1A; color: #FDFDFD !important; text-decoration: none; font-size: 14px; font-weight: 500; padding: 11px 26px; border-radius: 4px; }
    hr { border: none; border-top: 1px solid #EEEEEE; margin: 28px 0; }
    .small { font-size: 12px; color: #999; line-height: 1.6; }
    .small a { color: #555; word-break: break-all; }
    .footer { margin-top: 40px; font-size: 12px; color: #BBB; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="label">语言学习</div>
    <h1>您的登录链接</h1>
    <p>点击下方按钮即可登录。此链接有效期为 1 小时，且只能使用一次。</p>
    <a href="${confirmationUrl}" class="btn">登录</a>
    <hr>
    <div class="small">
      <p style="margin-bottom:6px">如果按钮无法点击，请复制以下链接到浏览器：</p>
      <a href="${confirmationUrl}">${confirmationUrl}</a>
    </div>
    <div class="footer"><p>如果您没有请求此邮件，请忽略。</p></div>
  </div>
</body>
</html>`,
  }),

  en: ({ confirmationUrl }: TemplateProps) => ({
    subject: 'Your login link — Language Learning',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; background: #FDFDFD; color: #1A1A1A; padding: 48px 24px; }
    .wrap { max-width: 480px; margin: 0 auto; }
    .label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #888; margin-bottom: 36px; }
    h1 { font-size: 20px; font-weight: 600; letter-spacing: -0.02em; margin-bottom: 10px; }
    p { font-size: 14px; line-height: 1.7; color: #666; margin-bottom: 28px; }
    .btn { display: inline-block; background: #1A1A1A; color: #FDFDFD !important; text-decoration: none; font-size: 14px; font-weight: 500; padding: 11px 26px; border-radius: 4px; }
    hr { border: none; border-top: 1px solid #EEEEEE; margin: 28px 0; }
    .small { font-size: 12px; color: #999; line-height: 1.6; }
    .small a { color: #555; word-break: break-all; }
    .footer { margin-top: 40px; font-size: 12px; color: #BBB; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="label">Language Learning</div>
    <h1>Your login link</h1>
    <p>Click the button below to sign in. This link expires in 1 hour and can only be used once.</p>
    <a href="${confirmationUrl}" class="btn">Sign in</a>
    <hr>
    <div class="small">
      <p style="margin-bottom:6px">If the button doesn't work, copy and paste this link into your browser:</p>
      <a href="${confirmationUrl}">${confirmationUrl}</a>
    </div>
    <div class="footer"><p>If you didn't request this email, you can safely ignore it.</p></div>
  </div>
</body>
</html>`,
  }),

  ja: ({ confirmationUrl }: TemplateProps) => ({
    subject: 'ログインリンク — 言語学習',
    html: `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, "Hiragino Sans", "Yu Gothic", "Helvetica Neue", Arial, sans-serif; background: #FDFDFD; color: #1A1A1A; padding: 48px 24px; }
    .wrap { max-width: 480px; margin: 0 auto; }
    .label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #888; margin-bottom: 36px; }
    h1 { font-size: 20px; font-weight: 600; letter-spacing: -0.02em; margin-bottom: 10px; }
    p { font-size: 14px; line-height: 1.7; color: #666; margin-bottom: 28px; }
    .btn { display: inline-block; background: #1A1A1A; color: #FDFDFD !important; text-decoration: none; font-size: 14px; font-weight: 500; padding: 11px 26px; border-radius: 4px; }
    hr { border: none; border-top: 1px solid #EEEEEE; margin: 28px 0; }
    .small { font-size: 12px; color: #999; line-height: 1.6; }
    .small a { color: #555; word-break: break-all; }
    .footer { margin-top: 40px; font-size: 12px; color: #BBB; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="label">言語学習</div>
    <h1>ログインリンク</h1>
    <p>下のボタンをクリックしてログインしてください。このリンクは1時間有効で、1回のみ使用できます。</p>
    <a href="${confirmationUrl}" class="btn">ログイン</a>
    <hr>
    <div class="small">
      <p style="margin-bottom:6px">ボタンが機能しない場合は、以下のリンクをブラウザにコピーしてください：</p>
      <a href="${confirmationUrl}">${confirmationUrl}</a>
    </div>
    <div class="footer"><p>このメールに心当たりがない場合は、無視してください。</p></div>
  </div>
</body>
</html>`,
  }),
} as const;

export type SupportedLocale = keyof typeof emailTemplates;
