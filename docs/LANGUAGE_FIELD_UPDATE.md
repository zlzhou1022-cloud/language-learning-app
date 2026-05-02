# Language 字段更新 - 基于单词本身的语言

## 更新时间
2026年5月3日

## 问题描述
之前的实现中，`dictionaries` 表的 `language` 字段存储的是**用户学习时的界面语言**（locale），而不是**单词本身的语言**。

### 旧逻辑问题：
- 用户在中文界面学习英语单词 "hello"
- 保存时：`language = 'zh'`（界面语言）
- 结果：英语单词被错误地归类到"中文"

### 期望逻辑：
- 用户在任何界面学习英语单词 "hello"
- 保存时：`language = 'en'`（单词本身的语言）
- 结果：英语单词正确归类到"英语"

## 解决方案

### 1. 更新 DictionaryCard 接口
**文件**: `lib/llm/baseProvider.ts`

添加 `language` 字段到接口：
```typescript
export interface DictionaryCard {
  word: string;
  phonetic: string;
  definition_native: string;
  definition_target: string;
  learning_notes: string;
  mnemonics: string;
  examples: Array<{
    sentence: string;
    translation: string;
  }>;
  language: string; // 单词本身的语言 (en/ja/zh)
}
```

### 2. 更新 AI Prompts
**文件**: `lib/llm/prompts.ts`

#### SUMMARIZE_CARD_PROMPT（钻研模式）
添加 `language` 字段到 JSON 结构：
```json
{
  "language": "单词的语言代码（en=英语, ja=日语, zh=中文）"
}
```

说明：
- `language` 必须是 "en"、"ja" 或 "zh" 之一
- 根据**单词本身的语言**判断，不是用户界面语言

#### 效率模式 Prompt（learn-interface.tsx）
**文件**: `components/learn/learn-interface.tsx`

在效率模式的 prompt 中添加：
```json
{
  "language": "单词的语言代码（en=英语, ja=日语, zh=中文）"
}
```

重要说明：
```
重要：language字段必须根据单词本身的语言判断，不是用户界面语言。
```

### 3. 更新保存逻辑
**文件**: `components/learn/learn-interface.tsx`

**旧代码**：
```typescript
const cardData = {
  user_id: user.id,
  word: card.word,
  language: locale, // ❌ 使用界面语言
  // ...
};
```

**新代码**：
```typescript
const cardData = {
  user_id: user.id,
  word: card.word,
  language: card.language, // ✅ 使用单词本身的语言
  // ...
};
```

### 4. 更新卡片加载逻辑
**文件**: `components/learn/learn-interface.tsx`

从数据库加载现有卡片时，包含 `language` 字段：
```typescript
const card: DictionaryCard = {
  word: data.word,
  phonetic: data.phonetic || '',
  definition_native: data.definition_native || '',
  definition_target: data.definition_target || '',
  learning_notes: data.learning_notes || '',
  mnemonics: data.mnemonics || '',
  language: data.language || 'en', // 默认英语
  examples: Array.isArray(data.examples) 
    ? (data.examples as Array<{ sentence: string; translation: string }>)
    : [],
};
```

### 5. 更新 Gemini Provider
**文件**: `lib/llm/geminiProvider.ts`

在解析 AI 返回的卡片时，包含 `language` 字段：
```typescript
const card: DictionaryCard = {
  word: (rawCard.word as string) || '',
  phonetic: (rawCard.phonetic as string) || '',
  definition_native: normalizeDefinition(rawCard.definition_native),
  definition_target: normalizeDefinition(rawCard.definition_target),
  learning_notes: (rawCard.learning_notes as string) || '通过对话学习了这个单词的用法和含义',
  mnemonics: (rawCard.mnemonics as string) || '',
  language: (rawCard.language as string) || 'en', // 默认英语
  examples: Array.isArray(rawCard.examples) ? rawCard.examples : [],
};
```

## 语言过滤逻辑

词汇列表页面的过滤逻辑**已经正确实现**：

**文件**: `components/vocabulary/vocabulary-list.tsx`

```typescript
const filteredWords = useMemo(() => {
  return initialWords.filter((word) => {
    // 语言过滤 - 基于单词的 language 字段
    if (selectedLanguage !== 'all' && word.language !== selectedLanguage) {
      return false;
    }
    // ...
  });
}, [initialWords, selectedLanguage, selectedTag, searchQuery]);
```

这个逻辑使用 `word.language` 进行过滤，现在 `word.language` 存储的是单词本身的语言，所以过滤是正确的。

## 语言代码映射

| 语言 | 代码 | 示例单词 |
|------|------|----------|
| 英语 | `en` | hello, test, apple |
| 日语 | `ja` | こんにちは, ありがとう |
| 中文 | `zh` | 你好, 谢谢 |

## AI 判断逻辑

AI 会根据以下特征判断单词的语言：
1. **字符集**：拉丁字母 → 英语，假名/汉字 → 日语，汉字 → 中文
2. **语言特征**：词汇结构、语法特点
3. **上下文**：对话中的语言环境

## 测试场景

### 场景 1：中文界面学习英语单词
- 用户界面：中文（locale='zh'）
- 学习单词：hello
- 期望结果：`language = 'en'`
- 过滤结果：在"英语"分类下显示

### 场景 2：英文界面学习日语单词
- 用户界面：英文（locale='en'）
- 学习单词：こんにちは
- 期望结果：`language = 'ja'`
- 过滤结果：在"日语"分类下显示

### 场景 3：日文界面学习中文单词
- 用户界面：日文（locale='ja'）
- 学习单词：你好
- 期望结果：`language = 'zh'`
- 过滤结果：在"中文"分类下显示

## 向后兼容

对于已存在的旧数据（`language` 存储的是界面语言）：
- 加载时使用默认值 `'en'`
- 用户重新编辑保存后，会更新为正确的单词语言
- 或者可以运行数据迁移脚本批量更新

## 构建状态
✅ `npm run build` 成功通过
✅ TypeScript 类型检查通过
✅ 所有路由正常生成

## 影响的文件
1. `lib/llm/baseProvider.ts` - 接口定义
2. `lib/llm/prompts.ts` - AI prompts
3. `lib/llm/geminiProvider.ts` - AI 响应解析
4. `components/learn/learn-interface.tsx` - 保存和加载逻辑
5. `components/vocabulary/vocabulary-list.tsx` - 过滤逻辑（无需修改）

## 注意事项
1. AI 必须正确判断单词的语言，这依赖于 prompt 的清晰度
2. 默认值设为 `'en'`，适用于大多数场景
3. 语言代码必须是 `'en'`、`'ja'`、`'zh'` 之一
4. 旧数据可能需要手动或批量更新
