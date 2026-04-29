# 修复注册和登录问题

## 问题说明

### 问题 1: 注册后提示确认邮件但未收到
**原因**: Supabase 启用了邮箱确认，但由于速率限制或配置问题，邮件未发送。

### 问题 2: 使用注册的账号密码登录显示 "Invalid login credentials"
**原因**: 用户账号未确认，Supabase 不允许未确认的用户登录。

---

## 🔧 解决方案

### 方案 1: 禁用邮箱确认（推荐用于开发）

这样用户注册后可以立即登录，无需确认邮箱。

#### 步骤：

1. **访问 Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/jwoyiuswfpdacfyieppo/auth/providers
   ```

2. **配置 Email 提供商**
   - 点击 "Email" 行
   - 找到 "Confirm email" 选项
   - **取消勾选** "Enable email confirmations" ❌
   - 点击 "Save"

3. **测试注册**
   ```
   1. 访问 http://localhost:3000/zh/login
   2. 选择"密码登录"
   3. 输入新邮箱和密码
   4. 点击"注册"
   5. 应该显示："账号创建成功！现在可以登录了。"
   6. 立即使用相同邮箱和密码登录
   7. 应该成功登录到 Dashboard
   ```

### 方案 2: 手动确认已注册的用户

如果你已经注册了一些用户但无法登录：

1. **访问 Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/jwoyiuswfpdacfyieppo/auth/users
   ```

2. **找到你的用户**
   - 在用户列表中找到你注册的邮箱

3. **手动确认用户**
   - 点击用户行
   - 找到 "Email Confirmed" 字段
   - 如果显示 "No"，点击旁边的按钮手动确认
   - 或者点击 "Send confirmation email" 重新发送确认邮件

4. **测试登录**
   - 现在应该可以使用该邮箱和密码登录了

### 方案 3: 删除旧用户并重新注册

如果方案 2 不工作：

1. **删除旧用户**
   ```
   在 Supabase Dashboard > Authentication > Users
   找到用户并点击删除按钮
   ```

2. **禁用邮箱确认**（按方案 1）

3. **重新注册**
   - 使用相同或不同的邮箱
   - 这次应该可以立即登录

---

## 🧪 测试流程

### 完整的注册和登录测试

1. **确保已禁用邮箱确认**
   ```
   Supabase Dashboard > Authentication > Providers > Email
   ❌ Confirm email (应该取消勾选)
   ```

2. **清除浏览器缓存**
   ```
   Ctrl+Shift+Delete
   选择"缓存的图片和文件"和"Cookie"
   ```

3. **访问登录页**
   ```
   http://localhost:3000/zh/login
   ```

4. **注册新账号**
   ```
   邮箱: newuser@example.com
   密码: test123456
   点击"注册"
   ```

5. **验证成功消息**
   ```
   应该显示："账号创建成功！现在可以登录了。"
   而不是："账号创建成功！请查看邮箱确认。"
   ```

6. **立即登录**
   ```
   输入相同的邮箱和密码
   点击"登录"
   应该立即跳转到 Dashboard
   ```

7. **验证 Dashboard**
   ```
   应该看到：
   - 欢迎消息："欢迎, newuser"
   - 总词汇量卡片
   - 左侧边栏（桌面）或底部导航（移动）
   ```

---

## 🔍 错误消息翻译

现在所有错误消息都会根据用户选择的语言显示：

### 中文错误消息

| 错误 | 中文提示 |
|------|---------|
| Invalid login credentials | 邮箱或密码错误，请重试。 |
| Email not confirmed | 请先确认您的邮箱。请查看收件箱。 |
| Too many attempts | 尝试次数过多，请稍后再试。 |
| Email already registered | 邮箱已注册，请直接登录。 |
| Password too weak | 密码太弱，请使用至少 6 个字符。 |

### 英文错误消息

| 错误 | 英文提示 |
|------|---------|
| Invalid login credentials | Invalid email or password. Please try again. |
| Email not confirmed | Please confirm your email first. Check your inbox. |
| Too many attempts | Too many attempts. Please try again later. |
| Email already registered | Email already registered. Please login instead. |
| Password too weak | Password is too weak. Use at least 6 characters. |

### 日文错误消息

| 错误 | 日文提示 |
|------|---------|
| Invalid login credentials | メールアドレスまたはパスワードが無効です。 |
| Email not confirmed | まずメールを確認してください。 |
| Too many attempts | 試行回数が多すぎます。 |
| Email already registered | メールアドレスは既に登録されています。 |
| Password too weak | パスワードが弱すぎます。 |

---

## 🎯 推荐配置

### 开发环境

```
Supabase Authentication > Providers > Email:

✅ Enable email provider
✅ Enable password
❌ Confirm email (禁用)
✅ Enable Magic Link
```

**优点**:
- 注册后立即可以登录
- 无需等待邮件
- 快速测试
- 避免速率限制问题

### 生产环境

```
Supabase Authentication > Providers > Email:

✅ Enable email provider
✅ Enable password
✅ Confirm email (启用)
✅ Enable Magic Link
✅ Custom SMTP (推荐)
```

**优点**:
- 验证邮箱真实性
- 防止垃圾注册
- 更安全

---

## 🐛 常见问题

### Q: 我已经禁用了邮箱确认，但仍然提示确认邮件？

A: 
1. 确保点击了 "Save" 按钮
2. 等待几分钟让设置生效
3. 清除浏览器缓存
4. 使用新的邮箱地址测试

### Q: 登录时显示 "Invalid login credentials"？

A: 可能的原因：
1. 邮箱或密码输入错误
2. 用户未确认邮箱（如果启用了确认）
3. 用户不存在（需要先注册）

**解决**:
1. 检查邮箱和密码是否正确
2. 在 Supabase Dashboard 检查用户是否存在
3. 检查用户的 "Email Confirmed" 状态
4. 如果未确认，手动确认或禁用邮箱确认

### Q: 注册时显示 "Email already registered"？

A: 该邮箱已经注册过了，直接登录即可。

### Q: 密码要求是什么？

A: 
- 最少 6 个字符（默认）
- 可以在 Supabase Dashboard 中调整
- 建议生产环境使用更强的密码策略

### Q: 如何查看所有注册用户？

A:
```
Supabase Dashboard > Authentication > Users
```

### Q: 如何删除测试用户？

A:
```
1. 访问 Authentication > Users
2. 找到用户
3. 点击用户行右侧的 "..." 按钮
4. 选择 "Delete user"
```

---

## ✅ 验证清单

完成以下步骤确保一切正常：

- [ ] 访问 Supabase Dashboard
- [ ] 禁用 "Confirm email"
- [ ] 保存设置
- [ ] 清除浏览器缓存
- [ ] 访问 `/zh/login`
- [ ] 注册新账号
- [ ] 看到成功消息："现在可以登录了"
- [ ] 立即登录
- [ ] 成功跳转到 Dashboard
- [ ] 错误消息显示中文（如果选择中文）

---

## 📊 修改的文件

### 1. `components/auth/login-form.tsx`
- 改进错误处理
- 添加错误消息翻译
- 更好的用户反馈

### 2. `components/providers/theme-provider.tsx`
- 修复 script 标签警告
- 添加 mounted 检查

### 3. `messages/en.json`
- 添加错误消息翻译

### 4. `messages/zh.json`
- 添加错误消息翻译

### 5. `messages/ja.json`
- 添加错误消息翻译

---

## 🎉 完成！

现在：
- ✅ 注册后可以立即登录（如果禁用了邮箱确认）
- ✅ 错误消息会根据语言显示
- ✅ 更好的用户体验
- ✅ 没有 script 标签警告

---

**下一步**: 访问 Supabase Dashboard 禁用邮箱确认，然后测试注册和登录！
