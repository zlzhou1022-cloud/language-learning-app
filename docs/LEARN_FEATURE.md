# 对话式生词学习功能文档

## 功能概述

基于 LLM 的对话式生词学习功能，采用"协同构建流"（Co-Creation Flow）设计理念，让用户通过与 AI 导师对话的方式深入理解单词，最终生成个性化的学习卡片。

## 核心流程

### Step 1: 单词输入
- 用户在 `/learn` 页面输入想要学习的生词
- 点击"开始学习"按钮启动对话

### Step 2: 启动对话（Socratic Mode）
- LLM 以"专业语言导师"身份出现
- 初始响应包含：
  - 音标（IPA 格式）
  - 母语/目标语双语释义
  - 2 个地道例句（带翻译）
  - 询问用户是否有疑问或需要特定场景应用

### Step 3: 多轮对话
- 用户可以追问任何问题
- LLM 根据上下文提供深入解释
- 对话历史限制在最近 5 轮，节省 Token

### Step 4: 总结与草稿生成
- 用户点击"生成卡片"按钮
- LLM 总结对话内容，输出结构化 JSON：
  ```json
  {
    "word": "单词原文",
    "phonetic": "音标",
    "definition_native": "母语释义",
    "definition_target": "目标语释义",
    "mnemonics": "助记法",
    "examples": [
      {
        "sentence": "例句原文",
        "translation": "例句翻译"
      }
    ]
  }
  ```

### Step 5: 协同编辑
- 前端将 JSON 填充到可编辑表单
- 用户可以修改任何字段
- 可以添加/删除例句
- 点击"保存"写入数据库

### Step 6: 二次迭代
- 在词汇详情页可以"重新开启对话"
- 带入已有卡片上下文继续学习

## 技术架构

### LLM 模块化适配器

```
lib/llm/
├── baseProvider.ts      # 抽象接口定义
├── geminiProvider.ts    # Gemini 实现
└── prompts.ts          # Prompt 模版
```

#### 接口定义
```typescript
interface LLMProvider {
  generateChatResponse(messages: ChatMessage[]): Promise<string>;
  summarizeDictionaryCard(word: string, history: ChatMessage[]): Promise<DictionaryCard>;
}
```

#### 当前实现
- **Gemini 1.5 Flash**: 快速、免费、适合对话场景
- 支持流式响应（可选）
- 自动限制对话历史（最近 5 轮）

### 数据库结构

```sql
-- profiles 表新增字段
ALTER TABLE profiles ADD COLUMN nickname TEXT;

-- dictionaries 表新增字段
ALTER TABLE dictionaries ADD COLUMN phonetic TEXT;
ALTER TABLE dictionaries ADD COLUMN definition_native TEXT;
ALTER TABLE dictionaries ADD COLUMN definition_target TEXT;
ALTER TABLE dictionaries ADD COLUMN mnemonics TEXT;
ALTER TABLE dictionaries ADD COLUMN examples JSONB DEFAULT '[]';
ALTER TABLE dictionaries ADD COLUMN conversation_history JSONB DEFAULT '[]';
```

### 状态管理

使用 **Zustand** 管理用户状态：

```typescript
// lib/store/userStore.ts
interface UserStore {
  profile: UserProfile | null;
  fetchProfile: () => Promise<void>;
  updateNickname: (nickname: string) => Promise<void>;
}
```

**优势**：
- 昵称修改后立即同步到 Dashboard
- 无需刷新页面
- 轻量级，性能优秀

## UI/UX 设计

### 对话界面
- ❌ 禁止圆滚滚的聊天气泡
- ✅ 采用侧边留白的块状文字布局
- ✅ 类似 Notion AI 的简洁风格
- ✅ 清晰的角色标识（You / AI Tutor）

### 输入框
- 固定在屏幕底部
- 极简线稿风格
- 支持 Enter 发送

### 状态反馈
- LLM 生成时显示三个跳动的点
- 不使用巨大的旋转图标
- 保持极简美学

### 卡片设计
- "档案纸"样式
- 字体层级清晰
- 边框简洁
- 大量留白

## API 路由

### POST /api/chat
生成对话响应

**请求**：
```json
{
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**响应**：
```json
{
  "response": "LLM 的回复内容"
}
```

### POST /api/chat/summarize
总结对话并生成卡片

**请求**：
```json
{
  "word": "单词",
  "messages": [...]
}
```

**响应**：
```json
{
  "card": {
    "word": "...",
    "phonetic": "...",
    "definition_native": "...",
    "definition_target": "...",
    "mnemonics": "...",
    "examples": [...]
  }
}
```

## 环境配置

### 必需的环境变量

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key
```

### 获取 Gemini API Key

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 创建新的 API Key
3. 复制到 `.env.local` 文件

**免费额度**：
- 每分钟 60 次请求
- 每天 1500 次请求
- 完全免费

## 使用流程

### 1. 添加新单词

```
Dashboard → 点击"添加生词" → 输入单词 → 开始学习
```

### 2. 与 AI 对话

```
AI 提供初始解释 → 用户提问 → AI 回答 → 多轮对话
```

### 3. 生成卡片

```
点击"生成卡片" → AI 总结对话 → 显示可编辑表单
```

### 4. 编辑保存

```
修改字段 → 添加/删除例句 → 点击"保存" → 返回词汇列表
```

### 5. 二次学习

```
词汇列表 → 点击单词 → "重新开启对话" → 继续学习
```

## 性能优化

### Token 节省策略

1. **限制对话历史**：只保留最近 5 轮对话
2. **精简 Prompt**：避免冗长的系统提示
3. **结构化输出**：使用 JSON 格式减少解析成本

### 响应速度优化

1. **使用 Gemini Flash**：比 Pro 版本快 2-3 倍
2. **流式响应**（可选）：打字机效果提升体验
3. **客户端缓存**：避免重复请求

## 扩展性

### 支持更多 LLM 提供商

只需实现 `LLMProvider` 接口：

```typescript
// lib/llm/openaiProvider.ts
export class OpenAIProvider implements LLMProvider {
  async generateChatResponse(messages: ChatMessage[]): Promise<string> {
    // OpenAI API 调用
  }
  
  async summarizeDictionaryCard(word: string, history: ChatMessage[]): Promise<DictionaryCard> {
    // 总结逻辑
  }
}
```

### 支持更多语言

在 `prompts.ts` 中添加语言映射：

```typescript
const languageMap: Record<string, string> = {
  'zh': '中文',
  'en': 'English',
  'ja': '日本語',
  'ko': '한국어',  // 新增韩语
  'fr': 'Français', // 新增法语
};
```

## 故障排查

### LLM 响应失败

**问题**：API 返回 500 错误

**解决**：
1. 检查 `GEMINI_API_KEY` 是否正确
2. 查看浏览器控制台错误信息
3. 检查 Gemini API 配额是否用完

### 卡片保存失败

**问题**：点击保存后没有反应

**解决**：
1. 检查用户是否已登录
2. 查看 Supabase RLS 策略是否正确
3. 检查必填字段是否都已填写

### 昵称不同步

**问题**：修改昵称后 Dashboard 没有更新

**解决**：
1. 检查 Zustand store 是否正确初始化
2. 确认 `fetchProfile` 在组件挂载时被调用
3. 刷新页面重新加载状态

## 最佳实践

### Prompt 工程

1. **明确角色定位**：语言专家，不是聊天机器人
2. **控制输出长度**：简洁明了，避免废话
3. **结构化输出**：使用 JSON 格式便于解析
4. **提供示例**：在 Prompt 中给出期望的输出格式

### 用户体验

1. **即时反馈**：显示加载状态，避免用户等待
2. **错误处理**：友好的错误提示，不要显示技术细节
3. **保存草稿**：考虑在编辑时自动保存到 localStorage
4. **快捷键**：支持 Enter 发送消息，Esc 关闭对话

### 安全性

1. **输入验证**：限制单词长度，防止恶意输入
2. **Rate Limiting**：限制 API 调用频率
3. **内容过滤**：检测并拒绝不当内容
4. **用户隔离**：确保 RLS 策略正确，用户只能访问自己的数据

## 未来改进

- [ ] 支持语音输入
- [ ] 支持图片识别单词
- [ ] 添加单词发音功能
- [ ] 支持批量导入单词
- [ ] 添加学习进度追踪
- [ ] 实现间隔重复算法
- [ ] 支持导出 Anki 卡片

---

**文档版本**: 1.0  
**最后更新**: 2026-05-01  
**维护者**: Development Team
