# 开发指南

## 开发环境设置

### 前置要求
- Node.js 18+ 
- npm 或 yarn
- Git
- 代码编辑器（推荐 VS Code）

### 首次设置

1. **克隆仓库**
```bash
git clone <your-repo-url>
cd language-learning-app
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
# .env.local 已经配置好，如需修改：
cp .env.example .env.local
# 编辑 .env.local
```

4. **启动开发服务器**
```bash
npm run dev
```

访问 http://localhost:3000

## 常用命令

### 开发
```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm start            # 启动生产服务器
npm run lint         # 运行 ESLint
npm run type-check   # TypeScript 类型检查
```

### 数据库
```bash
npm run db:push      # 推送迁移到 Supabase
npm run db:pull      # 从 Supabase 拉取更改
npm run db:types     # 生成 TypeScript 类型
npm run db:reset     # 重置数据库（危险！）
```

## 项目结构详解

### 目录说明

```
app/
├── [locale]/              # 国际化路由
│   ├── layout.tsx        # 本地化布局（主题、i18n）
│   ├── page.tsx          # 首页（重定向逻辑）
│   ├── login/            # 登录页面
│   ├── auth/callback/    # OAuth 回调
│   └── dashboard/        # 仪表板（需要认证）
├── layout.tsx            # 根布局
└── globals.css           # 全局样式（Tailwind + 主题变量）

components/
├── auth/                 # 认证相关组件
├── dashboard/            # 仪表板组件
├── providers/            # Context Providers
└── ui/                   # Shadcn UI 组件

lib/
├── supabase/            # Supabase 客户端
│   ├── client.ts        # 浏览器端客户端
│   ├── server.ts        # 服务端客户端
│   └── middleware.ts    # 中间件客户端
├── database.types.ts    # 数据库类型（自动生成）
└── utils.ts             # 工具函数

i18n/
├── routing.ts           # 路由配置
└── request.ts           # 请求配置

messages/
├── en.json              # 英文翻译
├── zh.json              # 中文翻译
└── ja.json              # 日文翻译

supabase/
├── config.toml          # Supabase 配置
└── migrations/          # 数据库迁移文件
```

## 开发工作流

### 1. 创建新功能

```bash
# 创建新分支
git checkout -b feature/new-feature

# 开发...
# 提交代码
git add .
git commit -m "feat: add new feature"

# 推送
git push origin feature/new-feature
```

### 2. 添加新页面

```typescript
// app/[locale]/new-page/page.tsx
import { getTranslations } from 'next-intl/server';

export default async function NewPage() {
  const t = await getTranslations('newPage');
  
  return (
    <div className="container mx-auto max-w-6xl space-y-8 p-8">
      <h1 className="text-3xl font-normal tracking-tight">
        {t('title')}
      </h1>
    </div>
  );
}
```

### 3. 添加翻译

```json
// messages/en.json
{
  "newPage": {
    "title": "New Page"
  }
}

// messages/zh.json
{
  "newPage": {
    "title": "新页面"
  }
}

// messages/ja.json
{
  "newPage": {
    "title": "新しいページ"
  }
}
```

### 4. 添加数据库表

```bash
# 创建迁移文件
npx supabase migration new add_new_table

# 编辑 supabase/migrations/[timestamp]_add_new_table.sql
```

```sql
-- 示例：创建新表
create table public.new_table (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 启用 RLS
alter table public.new_table enable row level security;

-- 添加策略
create policy "Users can view their own data"
  on public.new_table for select
  using (auth.uid() = user_id);
```

```bash
# 应用迁移
npm run db:push

# 生成类型
npm run db:types
```

### 5. 创建 API 路由

```typescript
// app/api/example/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('dictionaries')
    .select('*');
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ data });
}
```

## 组件开发

### Server Component（默认）

```typescript
// 服务端组件 - 可以直接访问数据库
import { createClient } from '@/lib/supabase/server';

export default async function ServerComponent() {
  const supabase = await createClient();
  const { data } = await supabase.from('dictionaries').select('*');
  
  return <div>{/* 渲染数据 */}</div>;
}
```

### Client Component

```typescript
'use client';

// 客户端组件 - 用于交互
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function ClientComponent() {
  const [data, setData] = useState([]);
  
  const loadData = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('dictionaries').select('*');
    setData(data || []);
  };
  
  return <div>{/* 交互式 UI */}</div>;
}
```

## 样式指南

### Tailwind 类名顺序

```typescript
// 推荐顺序：布局 -> 间距 -> 尺寸 -> 颜色 -> 字体 -> 其他
<div className="flex items-center justify-between p-4 w-full bg-background text-foreground text-sm hover:bg-muted">
```

### 瑞士平面设计原则

```typescript
// ✅ 好的例子
<Card className="border-border">
  <CardHeader className="space-y-2">
    <CardTitle className="text-2xl font-normal tracking-tight">
      Title
    </CardTitle>
  </CardHeader>
</Card>

// ❌ 避免
<Card className="rounded-xl shadow-2xl bg-gradient-to-r from-purple-500 to-pink-500">
  <CardHeader>
    <CardTitle className="text-4xl font-black">
      TITLE!!!
    </CardTitle>
  </CardHeader>
</Card>
```

### 颜色使用

```typescript
// 使用语义化颜色变量
bg-background       // 背景色
text-foreground     // 前景色（文字）
text-muted-foreground  // 次要文字
border-border       // 边框
bg-muted           // 次要背景

// 避免直接使用颜色值
bg-white           // ❌
bg-gray-100        // ❌
```

## 数据库操作

### 查询数据

```typescript
// 简单查询
const { data, error } = await supabase
  .from('dictionaries')
  .select('*');

// 带条件查询
const { data, error } = await supabase
  .from('dictionaries')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

// 关联查询
const { data, error } = await supabase
  .from('dictionaries')
  .select(`
    *,
    profiles (
      email,
      preferred_language
    )
  `);
```

### 插入数据

```typescript
const { data, error } = await supabase
  .from('dictionaries')
  .insert({
    user_id: userId,
    word: 'hello',
    language: 'en',
    definition_json: { meaning: 'greeting' },
    proficiency_level: 0
  })
  .select()
  .single();
```

### 更新数据

```typescript
const { data, error } = await supabase
  .from('dictionaries')
  .update({ proficiency_level: 3 })
  .eq('id', wordId)
  .select()
  .single();
```

### 删除数据

```typescript
const { error } = await supabase
  .from('dictionaries')
  .delete()
  .eq('id', wordId);
```

## 国际化

### 使用翻译

```typescript
// Server Component
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('namespace');
  return <h1>{t('key')}</h1>;
}

// Client Component
'use client';
import { useTranslations } from 'next-intl';

export function Component() {
  const t = useTranslations('namespace');
  return <h1>{t('key')}</h1>;
}
```

### 添加新语言

1. 在 `i18n/routing.ts` 添加语言代码
2. 创建 `messages/[locale].json`
3. 翻译所有文本

## 调试技巧

### 查看 Supabase 查询

```typescript
const { data, error } = await supabase
  .from('dictionaries')
  .select('*');

console.log('Data:', data);
console.log('Error:', error);
```

### 查看认证状态

```typescript
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);
```

### 查看环境变量

```typescript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
```

## 性能优化

### 1. 使用 Server Components

尽可能使用 Server Components，减少客户端 JavaScript。

### 2. 图片优化

```typescript
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority // 首屏图片
/>
```

### 3. 字体优化

```typescript
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});
```

### 4. 数据库查询优化

```typescript
// ✅ 只选择需要的字段
.select('id, word, language')

// ❌ 避免选择所有字段
.select('*')
```

## 测试

### 手动测试清单

- [ ] 登录流程
- [ ] 语言切换
- [ ] 主题切换
- [ ] 响应式布局
- [ ] 数据加载
- [ ] 错误处理

### 浏览器测试

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] 移动端浏览器

## 常见问题

### Q: 构建失败
A: 运行 `npm run type-check` 检查类型错误

### Q: 认证不工作
A: 检查 Supabase 重定向 URL 配置

### Q: 样式不生效
A: 确保 Tailwind 配置正确，重启开发服务器

### Q: 翻译缺失
A: 检查所有语言文件是否有相同的 key

## 代码规范

### 命名约定

- 组件：PascalCase (`UserProfile.tsx`)
- 函数：camelCase (`getUserData`)
- 常量：UPPER_SNAKE_CASE (`API_URL`)
- 文件：kebab-case (`user-profile.tsx`)

### 导入顺序

```typescript
// 1. React/Next.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. 第三方库
import { createClient } from '@supabase/supabase-js';

// 3. 本地组件
import { Button } from '@/components/ui/button';

// 4. 工具函数
import { cn } from '@/lib/utils';

// 5. 类型
import type { Database } from '@/lib/database.types';
```

## Git 工作流

### Commit 消息格式

```
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 代码格式调整
refactor: 重构代码
test: 添加测试
chore: 构建/工具更改
```

### 分支策略

- `main` - 生产分支
- `develop` - 开发分支
- `feature/*` - 功能分支
- `fix/*` - 修复分支

## 资源链接

- [Next.js 文档](https://nextjs.org/docs)
- [Supabase 文档](https://supabase.com/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Shadcn UI 文档](https://ui.shadcn.com)
- [next-intl 文档](https://next-intl-docs.vercel.app)
