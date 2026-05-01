# 快速设置指南

## 🚀 新功能设置

本指南帮助你快速配置新增的对话式学习功能。

## 1️⃣ 数据库迁移

### 应用迁移

```bash
# 推送新的数据库迁移
npm run db:push

# 生成新的 TypeScript 类型
npm run db:types
```

### 验证迁移

登录 [Supabase Dashboard](https://supabase.com/dashboard)，检查：

- `profiles` 表是否有 `nickname` 字段
- `dictionaries` 表是否有新增的字段：
  - `phonetic`
  - `definition_native`
  - `definition_target`
  - `mnemonics`
  - `examples`
  - `conversation_history`

## 2️⃣ 获取 Gemini API Key

### 步骤

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 使用 Google 账号登录
3. 点击 "Create API Key"
4. 选择一个 Google Cloud 项目（或创建新项目）
5. 复制生成的 API Key

### 配置环境变量

编辑 `.env.local` 文件：

```bash
# 已有的 Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 新增：Gemini API Key
GEMINI_API_KEY=your-gemini-api-key-here
```

**重要**：添加环境变量后需要重启开发服务器！

```bash
# 停止当前服务器（Ctrl+C）
# 重新启动
npm run dev
```

## 3️⃣ 安装新依赖

```bash
npm install
```

新增的依赖：
- `zustand` - 状态管理库

## 4️⃣ 测试功能

### 测试 Settings 页面

1. 访问 `http://localhost:3000/en/settings`
2. 修改昵称
3. 点击"更新昵称"
4. 返回 Dashboard，检查欢迎语是否显示新昵称

### 测试密码修改

1. 在 Settings 页面输入新密码
2. 确认密码
3. 点击"更新密码"
4. 登出后使用新密码登录

### 测试对话式学习

1. 访问 Dashboard
2. 点击"添加生词"按钮
3. 输入一个单词，如 "serendipity"
4. 点击"开始学习"
5. 等待 AI 响应
6. 尝试提问，如 "Can you give me more examples?"
7. 点击"生成卡片"
8. 编辑卡片内容
9. 点击"保存"

## 5️⃣ 部署到 Vercel

### 更新环境变量

在 Vercel Dashboard 中添加新的环境变量：

1. 进入你的项目
2. Settings → Environment Variables
3. 添加：
   ```
   GEMINI_API_KEY = your-gemini-api-key
   ```
4. 选择适用环境：Production, Preview, Development

### 重新部署

```bash
# 推送代码到 GitHub
git add .
git commit -m "feat: add conversational learning feature"
git push origin main
```

Vercel 会自动检测并部署。

### 应用数据库迁移

如果使用 Supabase 托管数据库：

```bash
# 确保已链接到远程项目
npx supabase link --project-ref your-project-ref

# 推送迁移
npx supabase db push
```

## 6️⃣ 验证部署

### 检查清单

- [ ] 网站可以正常访问
- [ ] 登录功能正常
- [ ] Settings 页面可以修改昵称
- [ ] Dashboard 显示昵称
- [ ] Learn 页面可以输入单词
- [ ] AI 对话功能正常
- [ ] 可以生成和保存卡片

### 常见问题

#### 问题 1: LLM 响应失败

**错误信息**：`GEMINI_API_KEY is not configured`

**解决**：
1. 检查 Vercel 环境变量是否正确设置
2. 确认变量名拼写正确（区分大小写）
3. 重新部署项目

#### 问题 2: 数据库字段不存在

**错误信息**：`column "nickname" does not exist`

**解决**：
```bash
# 应用数据库迁移
npx supabase db push
```

#### 问题 3: 昵称不显示

**解决**：
1. 清除浏览器缓存
2. 刷新页面
3. 检查 Zustand store 是否正确初始化

## 7️⃣ Gemini API 配额

### 免费额度

- **每分钟**：60 次请求
- **每天**：1500 次请求
- **完全免费**

### 监控使用量

访问 [Google Cloud Console](https://console.cloud.google.com/)：

1. 选择你的项目
2. APIs & Services → Dashboard
3. 查看 "Generative Language API" 的使用情况

### 超出配额怎么办？

**选项 1**：等待配额重置（每天 UTC 00:00）

**选项 2**：升级到付费计划（按需付费）

**选项 3**：切换到其他 LLM 提供商（如 OpenAI）

## 8️⃣ 性能优化建议

### 对话历史限制

默认只保留最近 5 轮对话，如需调整：

```typescript
// lib/llm/baseProvider.ts
export function limitConversationHistory(
  messages: ChatMessage[],
  maxRounds: number = 5  // 修改这里
): ChatMessage[] {
  // ...
}
```

### 缓存策略

考虑添加 Redis 缓存常见单词的解释：

```typescript
// 伪代码
const cachedResponse = await redis.get(`word:${word}`);
if (cachedResponse) {
  return cachedResponse;
}
```

### CDN 加速

Vercel 自动提供全球 CDN，无需额外配置。

## 9️⃣ 安全建议

### API Key 保护

- ✅ 使用环境变量存储
- ✅ 不要提交到 Git
- ✅ 定期轮换 API Key
- ❌ 不要在客户端代码中暴露

### Rate Limiting

考虑添加 API 调用频率限制：

```typescript
// middleware.ts 或 API route
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});
```

### 内容过滤

在 Prompt 中添加内容安全指令：

```typescript
const SYSTEM_ROLE = `你是一个专业的语言导师。
请拒绝回答与学习无关的问题。
不要生成不当、暴力或敏感内容。`;
```

## 🎉 完成！

现在你的应用已经具备完整的对话式学习功能了！

### 下一步

- 查看 [LEARN_FEATURE.md](./LEARN_FEATURE.md) 了解功能详情
- 阅读 [DEVELOPMENT.md](../DEVELOPMENT.md) 学习开发指南
- 参考 [ARCHITECTURE.md](../ARCHITECTURE.md) 理解系统架构

### 需要帮助？

- 查看 [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)
- 检查浏览器控制台错误
- 查看 Supabase Dashboard 日志
- 查看 Vercel 部署日志

---

**祝你使用愉快！** 🚀
