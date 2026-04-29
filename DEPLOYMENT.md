# 部署指南

## 部署到 Vercel（推荐）

### 步骤 1: 准备 GitHub 仓库

1. 在 GitHub 创建新仓库
2. 推送代码到 GitHub:

```bash
cd language-learning-app
git add .
git commit -m "Initial commit: Language Learning App"
git branch -M main
git remote add origin https://github.com/your-username/your-repo-name.git
git push -u origin main
```

### 步骤 2: 连接 Vercel

1. 访问 [Vercel](https://vercel.com)
2. 点击 "Add New Project"
3. 导入你的 GitHub 仓库
4. Vercel 会自动检测 Next.js 项目

### 步骤 3: 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=https://jwoyiuswfpdacfyieppo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 步骤 4: 部署

点击 "Deploy" 按钮，Vercel 会自动：
- 安装依赖
- 构建项目
- 部署到全球 CDN

### 步骤 5: 配置 Supabase 重定向 URL

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 Authentication > URL Configuration
4. 添加重定向 URL:
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app.vercel.app/**` (通配符)

## 自动部署

Vercel 会自动为你设置 CI/CD：

- ✅ 每次推送到 `main` 分支会自动部署到生产环境
- ✅ 每个 Pull Request 会创建预览部署
- ✅ 自动 HTTPS 证书
- ✅ 全球 CDN 加速

## 自定义域名（可选）

1. 在 Vercel 项目设置中点击 "Domains"
2. 添加你的自定义域名
3. 按照指示配置 DNS 记录
4. 更新 Supabase 重定向 URL 为你的自定义域名

## 监控和日志

- 在 Vercel Dashboard 查看部署日志
- 使用 Vercel Analytics（免费）监控性能
- 在 Supabase Dashboard 查看数据库日志

## 故障排查

### 构建失败

检查 Vercel 构建日志，常见问题：
- 环境变量未设置
- TypeScript 类型错误
- 依赖安装失败

### 认证失败

检查：
- Supabase URL 和 Key 是否正确
- 重定向 URL 是否配置正确
- 邮件服务是否正常

### 数据库连接失败

检查：
- Supabase 项目是否处于活动状态
- 数据库迁移是否已应用
- RLS 策略是否正确配置

## 成本估算

### 免费套餐限制

**Vercel (Hobby Plan)**
- ✅ 无限部署
- ✅ 100 GB 带宽/月
- ✅ 自动 HTTPS
- ✅ 预览部署

**Supabase (Free Plan)**
- ✅ 500 MB 数据库
- ✅ 50,000 月活用户
- ✅ 1 GB 文件存储
- ✅ 2 GB 带宽

对于个人项目和小型应用，这些免费套餐完全足够！
