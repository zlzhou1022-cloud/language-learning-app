# Supabase 邮件配置修复

## 问题：需要确认两次邮件

### 原因
Supabase 默认启用了"邮箱确认"功能，导致：
1. 第一封邮件：确认邮箱
2. 第二封邮件：Magic Link 登录

### 解决方案

#### 方法 1: 禁用邮箱确认（推荐用于开发）

1. **访问 Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/jwoyiuswfpdacfyieppo
   ```

2. **进入 Authentication 设置**
   - 点击左侧菜单 "Authentication"
   - 点击 "Providers"
   - 找到 "Email" 提供商

3. **禁用邮箱确认**
   - 找到 "Confirm email" 选项
   - **取消勾选** "Enable email confirmations"
   - 点击 "Save"

4. **测试**
   - 现在发送 Magic Link 应该只需要一封邮件
   - 点击邮件中的链接即可直接登录

#### 方法 2: 配置邮件模板（生产环境推荐）

如果你想保留邮箱确认功能，可以自定义邮件模板：

1. **访问邮件模板设置**
   ```
   Authentication > Email Templates
   ```

2. **编辑 "Confirm signup" 模板**
   - 自定义邮件内容
   - 添加品牌信息
   - 使用友好的语言

3. **编辑 "Magic Link" 模板**
   - 自定义登录邮件
   - 添加说明文字

#### 方法 3: 使用自定义 SMTP（生产环境）

对于生产环境，建议使用自己的邮件服务：

1. **配置 SMTP**
   ```
   Project Settings > Auth > SMTP Settings
   ```

2. **填入 SMTP 信息**
   - Host: smtp.your-provider.com
   - Port: 587
   - Username: your-email@domain.com
   - Password: your-password

3. **测试发送**
   - 发送测试邮件
   - 确认收到

### 当前配置状态

**项目**: language-learning-app  
**项目 ID**: jwoyiuswfpdacfyieppo  
**区域**: Tokyo  

**推荐设置（开发环境）**:
- ✅ Enable email provider
- ❌ Confirm email (禁用)
- ✅ Enable Magic Link

**推荐设置（生产环境）**:
- ✅ Enable email provider
- ✅ Confirm email (启用)
- ✅ Enable Magic Link
- ✅ Custom SMTP
- ✅ Custom email templates

### 快速修复步骤

```bash
# 1. 访问 Supabase Dashboard
open https://supabase.com/dashboard/project/jwoyiuswfpdacfyieppo/auth/providers

# 2. 找到 Email 提供商

# 3. 取消勾选 "Confirm email"

# 4. 保存设置

# 5. 测试登录
```

### 验证修复

1. **清除浏览器缓存和 Cookies**

2. **访问登录页面**
   ```
   http://localhost:3000/en/login
   ```

3. **输入邮箱并发送 Magic Link**

4. **检查邮箱**
   - 应该只收到一封邮件
   - 邮件主题: "Magic Link"
   - 点击链接应该直接登录

5. **确认登录成功**
   - 应该重定向到 Dashboard
   - 显示欢迎消息

### 常见问题

#### Q: 我还是收到两封邮件
A: 
1. 确认已保存设置
2. 清除浏览器缓存
3. 等待几分钟让设置生效
4. 尝试使用新的邮箱地址

#### Q: 邮件进入垃圾箱
A:
1. 检查垃圾邮件文件夹
2. 将 noreply@mail.app.supabase.io 添加到白名单
3. 考虑使用自定义 SMTP

#### Q: 邮件发送很慢
A:
1. Supabase 免费套餐有发送限制
2. 考虑升级到付费套餐
3. 或使用自定义 SMTP

#### Q: 想要自定义邮件内容
A:
1. 访问 Authentication > Email Templates
2. 编辑模板
3. 使用变量: {{ .ConfirmationURL }}, {{ .Email }} 等

### 邮件模板变量

可用的模板变量：

```
{{ .Email }}              - 用户邮箱
{{ .Token }}              - 验证令牌
{{ .TokenHash }}          - 令牌哈希
{{ .ConfirmationURL }}    - 确认链接
{{ .SiteURL }}            - 网站 URL
{{ .RedirectTo }}         - 重定向 URL
```

### 示例邮件模板

**Magic Link 邮件**:

```html
<h2>登录到 Language Learning App</h2>
<p>点击下面的链接登录：</p>
<p><a href="{{ .ConfirmationURL }}">登录</a></p>
<p>此链接将在 1 小时后过期。</p>
<p>如果您没有请求此邮件，请忽略。</p>
```

### 生产环境检查清单

- [ ] 配置自定义 SMTP
- [ ] 自定义邮件模板
- [ ] 添加品牌 Logo
- [ ] 测试所有邮件类型
- [ ] 配置 SPF/DKIM 记录
- [ ] 监控邮件发送率
- [ ] 设置邮件发送限制

---

**修复后，登录流程应该是**:

```
1. 用户输入邮箱
   ↓
2. 点击 "Send Magic Link"
   ↓
3. 收到一封邮件（Magic Link）
   ↓
4. 点击邮件中的链接
   ↓
5. 自动登录并跳转到 Dashboard ✅
```

---

**需要帮助？** 查看 [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
