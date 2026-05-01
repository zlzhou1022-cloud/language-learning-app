# 🔑 获取 Gemini API Key 指南

## 为什么需要 Gemini API Key？

对话式学习功能使用 Google Gemini AI 来：
- 解释单词含义
- 提供例句
- 回答你的问题
- 生成学习卡片

## 📝 获取步骤（5 分钟）

### 1️⃣ 访问 Google AI Studio

打开浏览器，访问：
```
https://makersuite.google.com/app/apikey
```

或者访问：
```
https://aistudio.google.com/app/apikey
```

### 2️⃣ 登录 Google 账号

使用你的 Google 账号登录（Gmail 账号）

### 3️⃣ 创建 API Key

1. 点击 **"Create API Key"** 按钮
2. 选择一个 Google Cloud 项目：
   - 如果你有项目，选择现有项目
   - 如果没有，点击 **"Create API key in new project"**
3. 等待几秒钟，API Key 会自动生成

### 4️⃣ 复制 API Key

1. 点击 **"Copy"** 按钮复制 API Key
2. API Key 格式类似：`AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

### 5️⃣ 配置到项目

打开 `.env.local` 文件，找到这一行：
```env
GEMINI_API_KEY=your-gemini-api-key-here
```

替换为你的 API Key：
```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 6️⃣ 重启开发服务器

**重要**：修改环境变量后必须重启服务器！

```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
npm run dev
```

---

## 🆓 免费额度

Gemini API 提供慷慨的免费额度：

| 限制 | 免费额度 |
|------|----------|
| 每分钟请求 | 60 次 |
| 每天请求 | 1,500 次 |
| 费用 | **完全免费** |

对于个人学习使用，这个额度完全足够！

---

## 🔒 安全提示

### ✅ 正确做法
- 将 API Key 保存在 `.env.local` 文件中
- 不要提交 `.env.local` 到 Git
- 不要在客户端代码中暴露 API Key

### ❌ 错误做法
- 不要将 API Key 直接写在代码中
- 不要分享你的 API Key
- 不要将 API Key 提交到 GitHub

---

## 🧪 测试 API Key

配置完成后，测试一下：

1. 重启开发服务器
2. 访问 http://localhost:3000/zh/learn
3. 输入一个单词，如 "hello"
4. 点击"开始学习"
5. 如果 AI 正常回复，说明配置成功！

---

## 🐛 故障排查

### 问题 1: AI 回复 "Sorry, I encountered an error"

**原因**：API Key 未配置或配置错误

**解决**：
1. 检查 `.env.local` 中的 `GEMINI_API_KEY`
2. 确认 API Key 格式正确（以 `AIza` 开头）
3. 重启开发服务器

### 问题 2: "GEMINI_API_KEY is not configured"

**原因**：环境变量未加载

**解决**：
1. 确认 `.env.local` 文件在项目根目录
2. 确认文件名正确（不是 `.env` 或 `.env.example`）
3. 重启开发服务器

### 问题 3: "API key not valid"

**原因**：API Key 无效或已过期

**解决**：
1. 访问 Google AI Studio
2. 删除旧的 API Key
3. 创建新的 API Key
4. 更新 `.env.local`
5. 重启服务器

---

## 📊 监控使用量

想查看你的 API 使用情况？

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 选择你的项目
3. 进入 **APIs & Services** → **Dashboard**
4. 查看 **Generative Language API** 的使用统计

---

## 💡 提示

### 节省配额
- 对话历史自动限制在最近 5 轮
- 避免频繁刷新页面
- 不要重复提问相同问题

### 最佳实践
- 明确提问，获得更好的回答
- 一次对话学习一个单词
- 满意后再生成卡片

---

## 🔗 相关链接

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API 文档](https://ai.google.dev/docs)
- [定价信息](https://ai.google.dev/pricing)
- [使用限制](https://ai.google.dev/docs/quota)

---

## ✅ 完成检查清单

- [ ] 访问 Google AI Studio
- [ ] 创建 API Key
- [ ] 复制 API Key
- [ ] 配置到 `.env.local`
- [ ] 重启开发服务器
- [ ] 测试对话功能

---

**需要帮助？** 查看 `docs/SETUP_GUIDE.md` 或 `TROUBLESHOOTING.md`

**祝你学习愉快！** 🚀
