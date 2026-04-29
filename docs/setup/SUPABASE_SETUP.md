# Supabase 配置说明

## 当前配置

项目已经配置并连接到 Supabase 项目：

- **项目名称**: language-learning-app
- **项目 ID**: jwoyiuswfpdacfyieppo
- **区域**: Northeast Asia (Tokyo)
- **项目 URL**: https://jwoyiuswfpdacfyieppo.supabase.co

## 数据库状态

✅ 数据库迁移已应用
✅ 表结构已创建
✅ RLS 策略已配置
✅ 触发器已设置

### 已创建的表

1. **profiles** - 用户信息表
2. **dictionaries** - 生词本表

### 已配置的功能

- ✅ 自动创建用户 profile（通过触发器）
- ✅ 自动更新 updated_at 时间戳
- ✅ 行级安全策略（用户只能访问自己的数据）
- ✅ 索引优化（提高查询性能）

## 认证配置

### 当前设置

- **认证方式**: Magic Link (Email)
- **邮件提供商**: Supabase 内置邮件服务

### 需要配置的重定向 URL

在部署到生产环境后，需要在 Supabase Dashboard 添加以下 URL：

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard/project/jwoyiuswfpdacfyieppo)
2. 进入 **Authentication** > **URL Configuration**
3. 添加以下 URL 到 **Redirect URLs**:

```
# 开发环境（已配置）
http://localhost:3000/auth/callback
http://localhost:3000/**

# 生产环境（部署后添加）
https://your-domain.vercel.app/auth/callback
https://your-domain.vercel.app/**
```

## 环境变量

### 本地开发

`.env.local` 文件已创建并配置：

```env
NEXT_PUBLIC_SUPABASE_URL=https://jwoyiuswfpdacfyieppo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 生产环境

在 Vercel 部署时，需要添加相同的环境变量：

1. 进入 Vercel 项目设置
2. 选择 **Environment Variables**
3. 添加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 数据库管理

### 查看数据

访问 [Supabase Dashboard](https://supabase.com/dashboard/project/jwoyiuswfpdacfyieppo/editor)

### 执行 SQL

在 SQL Editor 中可以直接执行查询：

```sql
-- 查看所有用户
SELECT * FROM profiles;

-- 查看所有生词
SELECT * FROM dictionaries;

-- 查看用户的生词数量
SELECT 
  p.email,
  COUNT(d.id) as word_count
FROM profiles p
LEFT JOIN dictionaries d ON p.id = d.user_id
GROUP BY p.email;
```

### 备份数据

Supabase 自动备份，也可以手动导出：

```bash
# 导出数据库结构
npx supabase db dump --linked > backup.sql

# 导出数据
npx supabase db dump --linked --data-only > data.sql
```

## 数据库迁移

### 创建新迁移

```bash
# 创建新的迁移文件
npx supabase migration new add_new_feature

# 编辑 supabase/migrations/[timestamp]_add_new_feature.sql
# 添加你的 SQL 代码

# 应用迁移
npx supabase db push
```

### 同步远程更改

如果在 Supabase Dashboard 中直接修改了数据库：

```bash
# 拉取远程更改
npx supabase db pull new_migration_name

# 这会创建一个新的迁移文件
```

### 生成 TypeScript 类型

每次修改数据库结构后，重新生成类型：

```bash
npx supabase gen types typescript --linked > lib/database.types.ts
```

## 监控和日志

### 查看日志

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard/project/jwoyiuswfpdacfyieppo)
2. 选择 **Logs**
3. 可以查看：
   - API 请求日志
   - 数据库查询日志
   - 认证日志
   - 错误日志

### 性能监控

在 Dashboard 的 **Reports** 页面可以查看：
- API 请求数量
- 数据库连接数
- 存储使用情况
- 带宽使用情况

## 安全最佳实践

### ✅ 已实现

- Row Level Security (RLS) 启用
- 用户数据隔离
- 安全的认证流程
- 环境变量保护

### 🔒 建议

1. **定期更新密钥**
   - 定期轮换 API keys
   - 使用 service_role key 时要特别小心

2. **监控异常活动**
   - 定期检查日志
   - 设置告警通知

3. **备份策略**
   - 定期导出重要数据
   - 测试恢复流程

## 免费套餐限制

### Supabase Free Tier

- ✅ 500 MB 数据库存储
- ✅ 50,000 月活用户
- ✅ 1 GB 文件存储
- ✅ 2 GB 带宽/月
- ✅ 无限 API 请求
- ⚠️ 项目会在 7 天不活动后暂停（访问即可恢复）

### 监控使用情况

在 Dashboard 的 **Settings** > **Usage** 查看当前使用情况。

## 故障排查

### 连接失败

```bash
# 检查 Supabase CLI 登录状态
npx supabase projects list

# 重新登录
npx supabase login

# 重新链接项目
npx supabase link --project-ref jwoyiuswfpdacfyieppo
```

### 迁移失败

```bash
# 查看迁移历史
npx supabase migration list --linked

# 修复迁移历史
npx supabase db pull repair_migration --yes
```

### RLS 策略问题

如果用户无法访问数据，检查 RLS 策略：

```sql
-- 查看当前策略
SELECT * FROM pg_policies WHERE tablename = 'dictionaries';

-- 测试策略
SELECT * FROM dictionaries WHERE user_id = auth.uid();
```

## 有用的链接

- [Supabase Dashboard](https://supabase.com/dashboard/project/jwoyiuswfpdacfyieppo)
- [Supabase 文档](https://supabase.com/docs)
- [SQL Editor](https://supabase.com/dashboard/project/jwoyiuswfpdacfyieppo/sql)
- [API 文档](https://supabase.com/dashboard/project/jwoyiuswfpdacfyieppo/api)
- [认证设置](https://supabase.com/dashboard/project/jwoyiuswfpdacfyieppo/auth/users)

## 联系支持

如果遇到问题：
1. 查看 [Supabase 文档](https://supabase.com/docs)
2. 访问 [Supabase Discord](https://discord.supabase.com)
3. 提交 [GitHub Issue](https://github.com/supabase/supabase/issues)
