# 高亮显示功能改进

## 更新时间
2026年5月3日

## 改进概述
优化卡片编辑界面的新增内容高亮显示功能，解决用户体验问题。

## 问题与解决方案

### 问题 1：高亮仅限于学习要点 ❌
**问题**: 只有学习要点字段有新增内容高亮显示

**解决方案**: ✅
- 扩展高亮功能到**所有可编辑字段**
- 包括：音标、母语释义、目标语释义、学习要点、助记方法
- 使用统一的 `renderHighlightedInput` 函数

### 问题 2：继续学习模式无高亮 ❌
**问题**: 继续学习模式下的卡片确认界面没有高亮显示

**解决方案**: ✅
- 在 `learn-interface` 中传递 `originalCard` 给 `CardEditor`
- 对于 `editMode === 'continue'` 和 `editMode === 'edit'` 都显示高亮
- 条件：`originalCard={editMode === 'continue' || editMode === 'edit' ? existingCard || undefined : undefined}`

### 问题 3：输入时高亮跳出 ❌
**问题**: 手动输入内容更新时，输入第一个字符后高亮框会自动跳出来打断输入

**解决方案**: ✅
- 使用 `useState` 在**初始加载时一次性计算**哪些字段有变化
- 存储在 `changedFields` 状态中
- 后续输入不会重新计算，避免打断用户

**技术实现**:
```typescript
const [changedFields] = useState(() => {
  if (!originalCard) return {};
  
  const changes: Record<string, { 
    hasChanged: boolean; 
    newContent: string; 
    originalContent: string 
  }> = {};
  
  // 只在初始化时计算一次
  textFields.forEach(field => {
    const original = String(originalCard[field] || '');
    const current = String(initialCard[field] || '');
    
    if (current !== original && 
        current.includes(original) && 
        current.length > original.length) {
      // 记录变化
      changes[field] = { ... };
    }
  });
  
  return changes;
});
```

### 问题 4：按钮高度不一致 ❌
**问题**: 单词详情页的继续学习和编辑按钮在移动端比删除按钮上下高度窄很多

**解决方案**: ✅
- 移除前两个按钮的 `flex-1`，改为 `sm:flex-1`（只在桌面端拉伸）
- 删除按钮移除 `px-6`，改为 `sm:px-6`（只在桌面端添加内边距）
- 所有按钮在手机端高度一致：`h-12`

**修改前**:
```typescript
// 继续学习和编辑：flex-1（手机端也拉伸）
className="flex h-12 flex-1 ..."

// 删除：px-6（手机端也有内边距）
className="flex h-12 ... px-6 sm:flex-none"
```

**修改后**:
```typescript
// 继续学习和编辑：只在桌面端拉伸
className="flex h-12 ... sm:flex-1"

// 删除：只在桌面端有内边距
className="flex h-12 ... sm:flex-none sm:px-6"
```

## 技术实现

### 1. 统一的高亮渲染函数

```typescript
const renderHighlightedInput = (
  field: keyof DictionaryCard,
  value: string,
  onChange: (value: string) => void,
  isTextarea: boolean = false,
  rows: number = 3,
  placeholder?: string
) => {
  const change = changedFields[field];
  
  if (!change?.hasChanged) {
    // 没有变化，正常显示
    return <Input/Textarea ... />;
  }

  // 有变化，显示高亮
  return (
    <div className="space-y-2">
      {/* 原始内容 */}
      <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
        {change.originalContent}
      </div>
      
      {/* 新增内容 - 高亮显示 */}
      <div className="rounded-md border-2 border-green-500/50 bg-green-500/10 px-3 py-2 text-sm">
        <div className="mb-1 text-xs font-medium text-green-600 dark:text-green-400">
          ✨ 新增内容
        </div>
        {change.newContent}
      </div>
      
      {/* 可编辑的完整内容 */}
      <Input/Textarea ... />
    </div>
  );
};
```

### 2. 支持的字段

所有文本字段都支持高亮：
- `phonetic` - 音标
- `definition_native` - 母语释义
- `definition_target` - 目标语释义
- `learning_notes` - 学习要点
- `mnemonics` - 助记方法

### 3. 高亮条件

只有同时满足以下条件才显示高亮：
1. 存在 `originalCard`（有原始卡片数据）
2. 当前内容 ≠ 原始内容
3. 当前内容包含原始内容
4. 当前内容长度 > 原始内容长度
5. 能够提取出新增内容

### 4. 样式规范

**原始内容**:
- 边框：`border border-border`
- 背景：`bg-muted/50`
- 文字：`text-muted-foreground`

**新增内容**:
- 边框：`border-2 border-green-500/50`
- 背景：`bg-green-500/10`
- 标题：`text-green-600 dark:text-green-400`
- 图标：✨ sparkles

**可编辑内容**:
- 正常的输入框样式
- 包含完整内容（原始 + 新增）

## 文件更改

### 1. CardEditor 组件
**文件**: `components/learn/card-editor.tsx`

**主要更改**:
- 添加 `changedFields` 状态（初始化时计算）
- 创建 `renderHighlightedInput` 函数
- 更新所有文本字段使用新函数
- 删除旧的 `hasChanged` 和 `getNewContent` 函数

### 2. 词汇详情页
**文件**: `components/vocabulary/vocabulary-detail.tsx`

**主要更改**:
- 继续学习按钮：移除 `flex-1`，添加 `sm:flex-1`
- 编辑按钮：移除 `flex-1`，添加 `sm:flex-1`
- 删除按钮：移除 `px-6`，添加 `sm:px-6`

## 用户体验改进

### 改进前的问题：
1. ❌ 只有学习要点有高亮
2. ❌ 继续学习模式无高亮
3. ❌ 输入时高亮框跳出打断输入
4. ❌ 手机端按钮高度不一致

### 改进后的效果：
1. ✅ 所有字段都有高亮
2. ✅ 继续学习和编辑模式都有高亮
3. ✅ 输入流畅，不会被打断
4. ✅ 手机端所有按钮高度一致

## 测试场景

### 场景 1：继续学习 - 所有字段高亮
1. 创建一个单词卡片
2. 进入词汇详情页，点击"继续学习"
3. 与 AI 对话，AI 补充所有字段的内容
4. 点击"更新卡片"
5. 验证所有有变化的字段都显示高亮

### 场景 2：编辑模式 - 所有字段高亮
1. 进入词汇详情页，点击"编辑"
2. 如果卡片是从继续学习生成的，验证高亮显示
3. 验证所有字段都正确显示

### 场景 3：输入流畅性
1. 进入卡片编辑界面（有高亮显示）
2. 在任意字段中输入内容
3. 验证输入流畅，高亮框不会跳出
4. 验证高亮内容保持不变

### 场景 4：手机端按钮
1. 在手机端打开词汇详情页
2. 验证三个按钮高度完全一致
3. 验证所有按钮易于点击

## 构建状态
✅ `npm run build` 成功通过
✅ TypeScript 类型检查通过
✅ 所有路由正常生成

## 注意事项

1. **初始化计算**：
   - `changedFields` 使用 `useState(() => {...})` 初始化
   - 只在组件挂载时计算一次
   - 后续不会重新计算

2. **高亮条件严格**：
   - 必须是追加模式（新内容在原内容后面）
   - 使用 `startsWith` 检测
   - 避免误判

3. **响应式设计**：
   - 手机端：所有按钮等宽等高
   - 桌面端：前两个按钮拉伸，删除按钮固定宽度

4. **性能优化**：
   - 避免在每次渲染时计算高亮
   - 使用状态缓存计算结果
   - 输入时不触发重新计算
