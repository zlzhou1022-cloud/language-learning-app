# 快速开始指南

## 🚀 5 分钟快速启动

### 1️⃣ 安装依赖

```bash
npm install
```

### 2️⃣ 配置环境变量

项目已经配置好了 Supabase 连接，`.env.local` 文件已创建。

如果需要使用自己的 Supabase 项目：

```bash
# 复制示例文件
cp .env.example .env.local

# 编辑 .env.local，填入你的 Supabase 配置
```

### 3️⃣ 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 4️⃣ 测试登录

1. 访问 `/login` 页面
2. 输入你的邮箱
3. 检查邮箱中的 Magic Link
4. 点击链接完成登录
5. 自动跳转到 Dashboard

## 📁 项目结构速览

```
app/[locale]/          # 国际化路由
├── login/            # 登录页（极简设计）
├── dashboard/        # 仪表板（显示词汇统计）
├── vocabulary/       # 词汇管理（待开发）
├── practice/         # 学习练习（待开发）
└── settings/         # 用户设置（待开发）

components/
├── auth/             # 登录表单
├── dashboard/        # 导航组件
└── ui/               # Shadcn UI 组件

lib/supabase/         # Supabase 客户端配置
messages/             # 翻译文件（中/英/日）
supabase/migrations/  # 数据库迁移
```

## 🎨 设计特点

### 瑞士平面设计风格
- 无圆角设计
- 大量留白
- 清晰的层级结构
- 极简配色（黑白灰）

### 响应式布局
- **桌面**: 左侧边栏导航
- **移动**: 底部导航栏

### 主题切换
- 明亮模式
- 暗黑模式
- 跟随系统

### 多语言支持
- 🇨🇳 中文
- 🇺🇸 English
- 🇯🇵 日本語

## 🔧 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 类型检查
npm run type-check
```

## 📊 数据库操作

### 查看数据库状态
```bash
npx supabase db diff --linked
```

### 创建新迁移
```bash
npx supabase migration new your_migration_name
```

### 应用迁移
```bash
npx supabase db push
```

### 生成类型
```bash
npx supabase gen types typescript --linked > lib/database.types.ts
```

## 🌐 语言切换

应用会自动检测浏览器语言，也可以手动切换：

- 桌面：侧边栏底部的语言选择器
- 移动：设置页面

## 🎯 下一步

1. **添加词汇功能**: 实现 CRUD 操作
2. **学习练习**: 添加闪卡、测验等功能
3. **用户设置**: 个性化配置
4. **数据可视化**: 学习进度图表

## 💡 提示

- 首次登录会自动创建用户 profile
- 所有数据都有 RLS（行级安全）保护
- Magic Link 有效期为 1 小时
- 支持深色模式，会自动跟随系统设置

## 🐛 遇到问题？

1. 检查 `.env.local` 配置是否正确
2. 确保 Supabase 项目处于活动状态
3. 查看浏览器控制台错误信息
4. 检查 Supabase Dashboard 的日志

## 📚 相关文档

- [Next.js 文档](https://nextjs.org/docs)
- [Supabase 文档](https://supabase.com/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Shadcn UI 文档](https://ui.shadcn.com)
