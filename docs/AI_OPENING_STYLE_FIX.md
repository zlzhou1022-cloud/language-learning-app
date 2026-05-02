# AI 开场白风格修复 + 状态清理问题修复

## 更新时间
2026年5月3日

## 问题 1: AI 开场白不明确
用户反馈：继续学习时，AI 偶尔会直接问用户有什么问题，没有说明是继续学习的情况。需要根据当前选择的 AI 风格，采用合适的语气来说明现在是新学单词还是继续学习。

## 问题 2: 状态污染导致显示错误单词
用户反馈：在输入一个单词，AI 开始回答后迅速停止回答，退回学习首页，然后输入另一个单词，出现的还是原来单词的回答。

这是因为 `ChatInterface` 组件使用了 `initializedRef` 来防止重复初始化，但当用户返回首页再输入新单词时，组件没有被完全重新初始化，导致旧的对话内容被保留。

## 解决方案

### 1. 更新 Prompt 函数签名

**文件**: `lib/llm/prompts.ts`

#### INITIAL_WORD_PROMPT
添加 `aiStyle` 参数，根据不同风格提供不同的开场白：

```typescript
export const INITIAL_WORD_PROMPT = (
  word: string, 
  userLanguage: string, 
  aiStyle: AIStyle = 'academic'
) => {
  // 根据 AI 风格选择开场白
  const greetings = {
    academic: `让我们来学习这个单词：${word}`,
    casual: `好的，我们来看看这个词：${word}`,
    mnemonic: `开始学习：${word}`
  };

  return `
这是一个新单词学习。用户想学习：${word}

${greetings[aiStyle]}
...
`;
};
```

#### CONTINUE_LEARNING_PROMPT
添加 `aiStyle` 参数，根据不同风格提供不同的继续学习开场白：

```typescript
export const CONTINUE_LEARNING_PROMPT = (
  existingCard: { 
    word: string; 
    phonetic: string; 
    definition_native: string; 
    definition_target: string; 
    learning_notes: string; 
    mnemonics: string 
  }, 
  aiStyle: AIStyle = 'academic'
) => {
  // 根据 AI 风格选择开场白
  const greetings = {
    academic: `我们继续深入学习这个单词：${existingCard.word}

你之前已经学过这个词了，现在让我们在已有基础上继续探讨。`,
    casual: `嘿，我们之前学过这个词：${existingCard.word}

现在继续聊聊这个词吧，看看还有什么想了解的。`,
    mnemonic: `继续学习：${existingCard.word}

你已经掌握了基础，现在补充更多记忆要点。`
  };

  return `
这是继续学习模式。用户之前已经学过这个单词，现在想继续深入学习。

${greetings[aiStyle]}
...
`;
};
```

### 2. 添加缺失的 Prompt 函数

#### CONTINUE_CONVERSATION_PROMPT
这个函数之前被引用但未定义，现已添加：

```typescript
export const CONTINUE_CONVERSATION_PROMPT = (
  existingCard: { 
    word: string; 
    phonetic: string; 
    definition_native: string; 
    definition_target: string 
  }
) => {
  return `
用户想继续讨论这个单词：${existingCard.word}

已有卡片信息：
- 音标：${existingCard.phonetic}
- 母语释义：${existingCard.definition_native}
- 目标语释义：${existingCard.definition_target}

请基于这些信息继续对话，回答用户的问题。

记住：在回复的最后一行添加进度标记 [PROGRESS:15]（继续对话阶段）
`;
};
```

#### SUMMARIZE_CARD_PROMPT
这个函数之前被引用但未定义，现已添加：

```typescript
export const SUMMARIZE_CARD_PROMPT = (
  word: string, 
  conversationHistory: string
) => {
  return `
基于以下对话历史，生成一个结构化的单词卡片。

单词：${word}

对话历史：
${conversationHistory}

请根据对话内容，生成一个 JSON 格式的单词卡片，包含以下字段：

{
  "word": "单词本身",
  "phonetic": "音标（IPA格式）",
  "definition_native": "用户母语释义（简洁，50字以内）",
  "definition_target": "单词本身语言的释义（简洁，50字以内）",
  "learning_notes": "学习要点（从对话中提取的关键知识点，100-200字）",
  "mnemonics": "助记方法（从对话中提取或创建，50-100字）",
  "language": "单词的语言代码（en=英语, ja=日语, zh=中文）",
  "examples": [
    {
      "sentence": "例句1",
      "translation": "例句1翻译"
    },
    {
      "sentence": "例句2",
      "translation": "例句2翻译"
    }
  ]
}

重要说明：
1. definition_native：用户母语的释义
2. definition_target：单词本身语言的释义（例如：学习英语单词时提供英语释义，学习日语单词时提供日语释义）
3. language字段必须根据单词本身的语言判断，不是用户界面语言
4. learning_notes：总结对话中讨论的关键知识点（词源、用法、场景、易混淆点等）
5. mnemonics：提取或创建有效的记忆方法
6. examples：提供2个地道的例句，带翻译

请只返回 JSON 格式的数据，不要包含其他文字说明。
`;
};
```

### 3. 更新 ChatInterface 调用

**文件**: `components/learn/chat-interface.tsx`

更新 prompt 调用，传递 `aiStyle` 参数：

```typescript
// 继续学习模式
if (existingCard && continueMode) {
  userMessage = {
    role: 'user',
    content: CONTINUE_LEARNING_PROMPT(existingCard, aiStyle), // 传递 aiStyle
  };
}

// 新单词学习
else {
  userMessage = {
    role: 'user',
    content: INITIAL_WORD_PROMPT(
      word,
      languageMap[locale] || 'English',
      aiStyle  // 传递 aiStyle
    ),
  };
}
```

## 不同风格的开场白示例

### 学术模式 (academic)
**新学单词**:
> 让我们来学习这个单词：test

**继续学习**:
> 我们继续深入学习这个单词：test
> 
> 你之前已经学过这个词了，现在让我们在已有基础上继续探讨。

### 日常模式 (casual)
**新学单词**:
> 好的，我们来看看这个词：test

**继续学习**:
> 嘿，我们之前学过这个词：test
> 
> 现在继续聊聊这个词吧，看看还有什么想了解的。

### 速记模式 (mnemonic)
**新学单词**:
> 开始学习：test

**继续学习**:
> 继续学习：test
> 
> 你已经掌握了基础，现在补充更多记忆要点。

## 验证结果

- ✅ TypeScript 类型检查通过
- ✅ 构建成功 (`npm run build`)
- ✅ 所有 prompt 函数正确导出
- ✅ ChatInterface 正确传递 aiStyle 参数
- ✅ 不同风格的开场白语气适配
- ✅ ChatInterface 添加 key 强制重新初始化，避免状态污染

## 影响范围

### 受影响的功能
1. 钻研模式 - 新学单词和继续学习
2. 所有三种 AI 风格（学术、日常、速记）
3. 状态管理 - 返回首页后重新输入单词

### 受影响的文件
1. `lib/llm/prompts.ts` - 添加 aiStyle 参数，补充缺失的 prompt 函数
2. `components/learn/chat-interface.tsx` - 传递 aiStyle 参数
3. `components/learn/learn-interface.tsx` - 添加 key 强制重新初始化

## 状态清理问题的解决方案

### 问题分析
`ChatInterface` 组件使用 `initializedRef` 来防止重复初始化：

```typescript
const initializedRef = useRef(false);

useEffect(() => {
  if (initializedRef.current) return; // 防止重复初始化
  initializedRef.current = true;
  // ... 初始化逻辑
}, [word, existingCard, locale, savedMessages, continueMode, systemRole]);
```

当用户返回首页再输入新单词时，React 可能会复用同一个组件实例，导致 `initializedRef.current` 仍然是 `true`，从而跳过初始化，显示旧的对话内容。

### 解决方案
在 `learn-interface.tsx` 中为 `ChatInterface` 添加 `key` 属性，强制 React 在单词变化时重新创建组件实例：

```typescript
<ChatInterface
  key={`${word}-${isExistingWord ? 'existing' : 'new'}`} // 添加 key 强制重新初始化
  word={word}
  existingCard={existingCard}
  onGenerateCard={handleGenerateCard}
  onBack={handleBackToInput}
  savedMessages={savedMessages}
  savedProgress={savedProgress}
  onMessagesChange={handleMessagesChange}
  continueMode={editMode === 'continue' || isExistingWord}
  aiStyle={aiStyle}
/>
```

**key 的组成**:
- `word`: 单词本身，确保不同单词有不同的 key
- `isExistingWord`: 区分新单词和重复单词，因为它们的处理逻辑不同

这样，每次单词变化或状态变化时，React 都会销毁旧的 `ChatInterface` 实例并创建新的实例，确保所有状态（包括 `initializedRef`）都被重置。

## 用户体验改进

1. **明确场景**：AI 开场白明确说明是新学单词还是继续学习
2. **风格一致**：开场白语气与选择的 AI 风格保持一致
3. **避免混淆**：用户不会再遇到 AI 直接问问题而不说明情况的情况

## 总结

此次修复完成了 TASK 8，解决了两个重要问题：

### 1. AI 开场白不明确
- AI 会根据场景（新学/继续学习）和风格（学术/日常/速记）提供合适的开场白
- 补充了之前缺失的 `CONTINUE_CONVERSATION_PROMPT` 和 `SUMMARIZE_CARD_PROMPT` 函数
- 所有 prompt 函数都正确传递和使用 `aiStyle` 参数

### 2. 状态污染问题
- 通过添加 `key` 属性强制 React 重新创建 `ChatInterface` 组件实例
- 确保每次输入新单词时，所有状态都被正确重置
- 避免了旧单词的对话内容污染新单词的对话

所有改进都已通过测试并成功构建。
