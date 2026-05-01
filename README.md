# Language Learning App

一个极简的语言学习应用，采用瑞士平面设计风格，支持多语言和主题切换。

## 技术栈

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI (基于 Radix UI)
- **Icons**: Lucide React
- **Backend/Auth**: Supabase (Auth & Database)
- **i18n**: next-intl
- **Theme**: next-themes

## 功能特性

### ✅ 已实现

- 🔐 **身份验证**: Supabase Magic Link + 密码登录
- 🌍 **国际化**: 支持中文、英文、日文切换
- 🎨 **主题管理**: 明亮/暗黑模式切换
- 📱 **响应式布局**: 桌面侧边栏 + 移动底部导航
- 🎯 **极简设计**: 瑞士平面设计风格，无圆角，大留白
- 🤖 **对话式学习**: 基于 LLM 的生词学习功能
- 👤 **用户设置**: 昵称和密码管理

### 🚧 待开发

- 📚 词汇列表和详情
- 🎓 学习练习和测验
- 📊 学习进度统计

## 数据库结构

### profiles 表
```sql
- id: uuid (主键，关联 auth.users)
- email: text
- nickname: text (新增：用户昵称)
- preferred_language: text (en/zh/ja)
- created_at: timestamp
- updated_at: timestamp
```

### dictionaries 表
```sql
- id: uuid (主键)
- user_id: uuid (外键 -> profiles)
- word: text
- language: text (en/zh/ja)
- phonetic: text (新增：音标)
- definition_native: text (新增：母语释义)
- definition_target: text (新增：目标语释义)
- mnemonics: text (新增：助记法)
- examples: jsonb (新增：例句数组)
- conversation_history: jsonb (新增：对话历史)
- definition_json: jsonb (保持兼容性)
- proficiency_level: integer (0-5)
- created_at: timestamp
- updated_at: timestamp
```

## 本地开发

### 前置要求

- Node.js 18+
- npm 或 yarn
- Supabase 账号
- Google Gemini API Key（用于 LLM 功能）

### 安装步骤

1. 克隆仓库
```bash
git clone <your-repo-url>
cd language-learning-app
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量

复制 `.env.example` 到 `.env.local` 并填入配置：

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

**获取 Gemini API Key**：访问 [Google AI Studio](https://makersuite.google.com/app/apikey)

4. 应用数据库迁移
```bash
npm run db:push
npm run db:types
```

5. 运行开发服务器
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 📚 完整文档

项目包含完善的文档体系，所有文档已整理到 `docs/` 文件夹：

- **[docs/README.md](./docs/README.md)** - 📖 文档中心（从这里开始）
- **[QUICKSTART.md](./QUICKSTART.md)** - 🚀 5 分钟快速启动
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - 💻 完整开发指南
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - 🏗️ 系统架构文档
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - 🚢 部署指南
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - � 故障排查指南
- **[TEST_GUIDE.md](./TEST_GUIDE.md)** - 🧪 测试指南
- **[CHECKLIST.md](./CHECKLIST.md)** - ✅ 功能完成度检查

### 分类文档

- **[docs/auth/](./docs/auth/)** - 🔐 认证功能文档
- **[docs/debug/](./docs/debug/)** - 🐛 调试和问题修复
- **[docs/setup/](./docs/setup/)** - ⚙️ 配置和设置指南

## 部署到 Vercel

### 通过 GitHub

1. 将代码推送到 GitHub
```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. 在 [Vercel](https://vercel.com) 导入项目

3. 配置环境变量
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. 部署！

### Supabase 配置

确保在 Supabase 项目设置中配置正确的重定向 URL：

- Development: `http://localhost:3000/auth/callback`
- Production: `https://your-domain.vercel.app/auth/callback`

## 项目结构

```
language-learning-app/
├── app/
│   ├── [locale]/              # 国际化路由
│   │   ├── auth/              # 认证回调
│   │   ├── dashboard/         # 仪表板
│   │   ├── login/             # 登录页
│   │   ├── vocabulary/        # 词汇页
│   │   ├── practice/          # 练习页
│   │   └── settings/          # 设置页
│   └── globals.css            # 全局样式
├── components/
│   ├── auth/                  # 认证组件
│   ├── dashboard/             # 仪表板组件
│   ├── providers/             # Provider 组件
│   └── ui/                    # Shadcn UI 组件
├── i18n/                      # 国际化配置
├── lib/
│   ├── supabase/              # Supabase 客户端
│   └── utils.ts               # 工具函数
├── messages/                  # 翻译文件
│   ├── en.json
│   ├── zh.json
│   └── ja.json
└── supabase/
    └── migrations/            # 数据库迁移
```

## 设计原则

### 瑞士平面设计风格

- ✅ 无圆角 (`--radius: 0rem`)
- ✅ 大留白和清晰的层级
- ✅ 非衬线字体 (Inter)
- ✅ 极简的配色方案
- ✅ 清晰的网格系统
- ❌ 禁止花哨的渐变
- ❌ 禁止过度装饰

## 免费方案确认

所有使用的技术栈都是免费的：

- ✅ Next.js - 开源免费
- ✅ Supabase - 免费套餐（500MB 数据库 + 50,000 月活用户）
- ✅ Vercel - 免费套餐（个人项目）
- ✅ 所有 npm 包 - 开源免费

## License

MIT
