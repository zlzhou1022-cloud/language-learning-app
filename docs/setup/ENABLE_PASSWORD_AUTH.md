# 启用密码认证

## 在 Supabase 中启用密码登录

### 步骤 1: 访问 Supabase Dashboard

```
https://supabase.com/dashboard/project/jwoyiuswfpdacfyieppo/auth/providers
```

### 步骤 2: 启用 Email 提供商的密码功能

1. **找到 "Email" 提供商**
   - 在 Authentication > Providers 页面
   - 点击 "Email" 行

2. **启用密码认证**
   - 确保 "Enable email provider" 已勾选 ✅
   - 确保 "Enable password" 已勾选 ✅
   - **建议**: 取消勾选 "Confirm email" ❌（开发环境）

3. **配置密码策略（可选）**
   - Minimum password length: 6（默认）
   - Password strength: 可以设置为 "Weak" 用于开发

4. **保存设置**
   - 点击 "Save" 按钮

### 步骤 3: 解决 Rate Limit 问题

#### 问题原因
Supabase 免费套餐对邮件发送有速率限制：
- 每小时最多 4 封邮件
- 超过限制会显示 "email rate limit exceeded"

#### 解决方案

**方案 1: 使用密码登录（推荐）**
- 密码登录不需要发送邮件
- 没有速率限制
- 立即登录

**方案 2: 等待速率限制重置**
- 等待 1 小时后重试
- 或使用不同的邮箱地址

**方案 3: 配置自定义 SMTP**
1. 访问 Project Settings > Auth > SMTP Settings
2. 配置你自己的邮件服务器
3. 免费套餐也可以使用自定义 SMTP

**方案 4: 升级到付费套餐**
- Pro 套餐有更高的邮件限制
- 但对于开发来说，密码登录更方便

### 步骤 4: 测试密码登录

1. **访问登录页面**
   ```
   http://localhost:3000/zh/login
   ```

2. **选择"密码登录"标签**

3. **注册新账号**
   - 输入邮箱
   - 输入密码（至少 6 个字符）
   - 点击 "Sign Up"

4. **登录**
   - 输入相同的邮箱和密码
   - 点击 "Login"
   - 应该立即登录成功

### 当前登录方式

应用现在支持两种登录方式：

#### 1. 密码登录（推荐）
```
优点：
✅ 无需等待邮件
✅ 没有速率限制
✅ 立即登录
✅ 适合开发和测试

缺点：
❌ 需要记住密码
❌ 需要注册流程
```

#### 2. Magic Link（邮箱链接）
```
优点：
✅ 无需密码
✅ 更安全
✅ 用户体验好

缺点：
❌ 需要等待邮件
❌ 有速率限制（免费套餐）
❌ 可能进入垃圾邮件
```

### 推荐配置

**开发环境**:
```
✅ Enable email provider
✅ Enable password
❌ Confirm email (禁用，避免双重确认)
✅ Enable Magic Link
```

**生产环境**:
```
✅ Enable email provider
✅ Enable password
✅ Confirm email (启用，增加安全性)
✅ Enable Magic Link
✅ Custom SMTP (避免速率限制)
```

### 数据库用户管理

用户数据存储在：
- `auth.users` - Supabase 认证表（自动管理）
- `public.profiles` - 你的用户信息表（通过触发器自动创建）

查看用户：
```sql
-- 在 Supabase SQL Editor 中运行
SELECT * FROM auth.users;
SELECT * FROM public.profiles;
```

### 常见问题

#### Q: 注册后需要确认邮箱吗？
A: 如果禁用了 "Confirm email"，则不需要。用户可以立即登录。

#### Q: 忘记密码怎么办？
A: 
1. 可以使用 Magic Link 登录
2. 或实现密码重置功能（未来功能）

#### Q: 密码有什么要求？
A: 
- 最少 6 个字符（默认）
- 可以在 Supabase Dashboard 中调整

#### Q: 如何删除测试用户？
A:
1. 访问 Authentication > Users
2. 找到用户
3. 点击删除按钮

#### Q: Rate limit 多久重置？
A: 通常是 1 小时

### 安全建议

**开发环境**:
- 可以使用简单密码（如 "123456"）
- 禁用邮箱确认
- 使用测试邮箱

**生产环境**:
- 强制使用强密码
- 启用邮箱确认
- 配置自定义 SMTP
- 启用 2FA（未来功能）
- 监控异常登录

### 测试账号

你可以创建一些测试账号：

```
邮箱: test@example.com
密码: test123

邮箱: admin@example.com
密码: admin123
```

### 验证配置

1. **检查 Supabase 设置**
   ```
   Authentication > Providers > Email
   - Enable email provider: ✅
   - Enable password: ✅
   ```

2. **测试注册**
   ```
   1. 访问 /zh/login
   2. 选择"密码登录"
   3. 输入邮箱和密码
   4. 点击 "Sign Up"
   5. 应该显示成功消息
   ```

3. **测试登录**
   ```
   1. 输入相同的邮箱和密码
   2. 点击 "Login"
   3. 应该跳转到 Dashboard
   ```

4. **检查用户**
   ```
   在 Supabase Dashboard:
   Authentication > Users
   应该看到新创建的用户
   ```

### 下一步

- [ ] 启用 Supabase 密码认证
- [ ] 测试注册流程
- [ ] 测试登录流程
- [ ] 创建测试账号
- [ ] 验证 Dashboard 访问

---

**配置完成后，你就可以使用密码登录了！** 🎉
