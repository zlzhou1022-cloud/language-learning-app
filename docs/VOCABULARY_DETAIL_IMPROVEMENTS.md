# 词汇详情页改进 - 继续学习和编辑功能

## 更新时间
2026年5月3日

## 改进概述
优化词汇详情页的"继续学习"和"编辑"功能，提供更好的用户体验和内容管理。

## 问题与解决方案

### 1. 手机端按钮高度问题 ✅
**问题**: 手机端的继续学习和编辑按钮高度非常窄，难以点击

**解决方案**:
- 将按钮高度从 `h-10` 改为 `h-12`
- 删除按钮在桌面端添加 `sm:flex-none` 保持合适宽度
- 文件：`components/vocabulary/vocabulary-detail.tsx`

### 2. 继续学习功能 ✅
**问题**: 继续学习应该进入对话模式，而不是直接编辑卡片

**解决方案**:
- 添加 `mode=continue` URL 参数
- 进入对话界面，AI 直接询问用户问题
- 使用新的 `CONTINUE_LEARNING_PROMPT`
- 对话后点击"更新卡片"按钮
- **只更新学习要点和助记方法**，保留其他内容

**实现细节**:
```typescript
// 新的 prompt
export const CONTINUE_LEARNING_PROMPT = (existingCard) => `
用户想继续学习这个单词：${existingCard.word}

已有卡片信息：
- 音标：${existingCard.phonetic}
- 母语释义：${existingCard.definition_native}
- 目标语释义：${existingCard.definition_target}
- 学习要点：${existingCard.learning_notes}
- 助记方法：${existingCard.mnemonics}

重要：
1. 不要重复提供已有的信息
2. 直接询问用户想深入了解什么
3. 对话结束后，总结新的学习要点和助记方法
`;
```

**保存逻辑**:
```typescript
if (wordId && editMode === 'continue') {
  // 只更新学习要点和助记方法
  await supabase
    .from('dictionaries')
    .update({
      learning_notes: card.learning_notes,
      mnemonics: card.mnemonics,
    })
    .eq('id', wordId);
}
```

### 3. 编辑功能 ✅
**问题**: 编辑按钮应该直接进入卡片编辑界面

**解决方案**:
- 添加 `mode=edit` URL 参数
- 直接进入卡片编辑界面
- 可以修改所有字段
- 保存时更新完整卡片

### 4. 新增内容高亮显示 ✅
**问题**: 用户新增的修改需要明显区分

**解决方案**:
- 在卡片编辑界面，如果有原始卡片数据，显示对比
- 原始内容：灰色文本框
- 新增内容：绿色高亮边框 + 背景色
- 完整内容：可编辑的文本框

**视觉效果**:
```
┌─────────────────────────────┐
│ 原始内容（灰色）             │
│ 这是原来的学习要点...        │
└─────────────────────────────┘

┌─────────────────────────────┐
│ ✨ 新增内容（绿色高亮）      │
│ 这是新添加的学习要点...      │
└─────────────────────────────┘

┌─────────────────────────────┐
│ 完整内容（可编辑）           │
│ 这是原来的学习要点...        │
│ 这是新添加的学习要点...      │
└─────────────────────────────┘
```

## 文件更改

### 1. 词汇详情页
**文件**: `components/vocabulary/vocabulary-detail.tsx`

**更改**:
- 按钮高度：`h-10` → `h-12`
- 继续学习链接：`/learn?wordId=${word.id}&mode=continue`
- 编辑链接：`/learn?wordId=${word.id}&mode=edit`

### 2. Learn 页面
**文件**: `app/[locale]/learn/page.tsx`

**更改**:
- 添加 `mode` 参数：`mode?: 'continue' | 'edit'`
- 传递给 LearnInterface：`editMode={mode}`

### 3. Learn Interface
**文件**: `components/learn/learn-interface.tsx`

**更改**:
- 添加 `editMode` prop
- 根据 `editMode` 决定进入对话还是编辑
- 更新保存逻辑，继续学习模式只更新部分字段
- 传递 `continueMode` 给 ChatInterface
- 传递 `originalCard` 给 CardEditor

### 4. Chat Interface
**文件**: `components/learn/chat-interface.tsx`

**更改**:
- 添加 `continueMode` prop
- 使用新的 `CONTINUE_LEARNING_PROMPT`
- 按钮文字：继续学习模式显示"更新卡片"

### 5. Card Editor
**文件**: `components/learn/card-editor.tsx`

**更改**:
- 添加 `originalCard` prop
- 实现内容对比逻辑
- 高亮显示新增内容
- 绿色边框 + 背景色标识新增部分

### 6. Prompts
**文件**: `lib/llm/prompts.ts`

**新增**:
- `CONTINUE_LEARNING_PROMPT` - 继续学习模式的 prompt

### 7. 翻译文件
**文件**: `messages/zh.json`, `messages/en.json`, `messages/ja.json`

**新增**:
- `updateCard`: "更新卡片" / "Update Card" / "カードを更新"

## 用户流程

### 继续学习流程
1. 用户在词汇详情页点击"继续学习"
2. 进入对话界面，AI 询问："关于这个词，你有什么想深入了解的吗？"
3. 用户提问，AI 回答
4. 对话结束后，用户点击"更新卡片"
5. 进入卡片编辑界面，显示：
   - 原始学习要点（灰色）
   - 新增学习要点（绿色高亮）
   - 原始助记方法（灰色）
   - 新增助记方法（绿色高亮）
6. 用户确认后保存，**只更新学习要点和助记方法**

### 编辑流程
1. 用户在词汇详情页点击"编辑"
2. 直接进入卡片编辑界面
3. 可以修改所有字段
4. 保存后更新完整卡片

## 技术细节

### URL 参数
- `wordId`: 单词 ID
- `mode=continue`: 继续学习模式
- `mode=edit`: 编辑模式

### 数据流
```
词汇详情页
  ↓ (点击继续学习)
Learn 页面 (mode=continue)
  ↓
LearnInterface (editMode='continue')
  ↓
ChatInterface (continueMode=true)
  ↓ (点击更新卡片)
CardEditor (originalCard 存在)
  ↓ (显示高亮)
保存 (只更新 learning_notes 和 mnemonics)
```

### 高亮逻辑
```typescript
// 检查内容是否有变化
const hasChanged = (field) => {
  if (!originalCard) return false;
  return card[field] !== originalCard[field] && 
         card[field].includes(originalCard[field]);
};

// 提取新增内容
const getNewContent = (field) => {
  if (!originalCard || !hasChanged(field)) return '';
  const original = originalCard[field];
  const current = card[field];
  if (current.startsWith(original)) {
    return current.substring(original.length).trim();
  }
  return '';
};
```

## 样式规范

### 按钮高度
- 手机端和桌面端统一：`h-12` (48px)
- 确保易于点击

### 高亮颜色
- 边框：`border-2 border-green-500/50`
- 背景：`bg-green-500/10`
- 文字：`text-green-600 dark:text-green-400`
- 图标：✨ (sparkles emoji)

## 构建状态
✅ `npm run build` 成功通过
✅ TypeScript 类型检查通过
✅ 所有路由正常生成

## 测试建议

### 测试场景 1：继续学习
1. 创建一个单词卡片
2. 进入词汇详情页
3. 点击"继续学习"
4. 验证进入对话界面
5. 验证 AI 直接询问问题
6. 进行对话
7. 点击"更新卡片"
8. 验证显示原始内容和新增内容（绿色高亮）
9. 保存后验证只更新了学习要点和助记方法

### 测试场景 2：编辑
1. 进入词汇详情页
2. 点击"编辑"
3. 验证直接进入卡片编辑界面
4. 修改各个字段
5. 保存后验证所有字段都已更新

### 测试场景 3：手机端
1. 在手机端打开词汇详情页
2. 验证按钮高度合适，易于点击
3. 测试继续学习和编辑功能

## 注意事项

1. **内容合并逻辑**：
   - AI 应该将新内容追加到原有内容后面
   - 使用换行或分隔符区分
   - 避免重复内容

2. **高亮显示条件**：
   - 只在有 `originalCard` 且内容确实改变时显示
   - 新增内容必须包含原始内容
   - 使用 `startsWith` 检测追加模式

3. **保存策略**：
   - 继续学习模式：只更新 `learning_notes` 和 `mnemonics`
   - 编辑模式：更新所有字段
   - 新建模式：插入完整数据

4. **用户体验**：
   - 按钮高度适中，易于点击
   - 高亮颜色明显但不刺眼
   - 保留原始内容供参考
   - 可编辑完整内容
