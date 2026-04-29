# 故障排查指南

## ✅ 已修复的问题

### 问题 1: 访问 /login 显示 404
**状态**: ✅ 已修复

### 问题 2: Missing <html> and <body> tags
**状态**: ✅ 已修复

---

## 正确的访问方式

这个应用使用了国际化路由，所有页面都在 `[locale]` 路径下。

### 解决方案

**正确的访问方式**：

- ✅ `http://localhost:3000/en/login` （英文）
- ✅ `http://localhost:3000/zh/login` （中文）
- ✅ `http://localhost:3000/ja/login` （日文）
- ✅ `http://localhost:3000/` （自动重定向到默认语言）

**错误的访问方式**：

- ❌ `http://localhost:3000/login` （会 404）

### 自动重定向

当你访问 `http://localhost:3000/` 时，应用会：

1. 检测你的浏览器语言
2. 自动重定向到对应的语言版本
3. 如果未登录，重定向到 `/[locale]/login`
4. 如果已登录，重定向到 `/[locale]/dashboard`

### 快速测试步骤

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **访问根路径**
   ```
   http://localhost:3000/
   ```
   应该自动重定向到 `http://localhost:3000/en/login`（或其他语言）

3. **直接访问登录页**
   ```
   http://localhost:3000/en/login
   ```

4. **测试其他语言**
   ```
   http://localhost:3000/zh/login  # 中文
   http://localhost:3000/ja/login  # 日文
   ```

### 如果仍然 404

1. **检查开发服务器是否正常启动**
   ```bash
   npm run dev
   ```
   应该看到：
   ```
   ✓ Ready in XXXms
   - Local: http://localhost:3000
   ```

2. **清除 .next 缓存**
   ```bash
   rm -rf .next
   npm run dev
   ```

3. **检查浏览器控制台**
   - 打开浏览器开发者工具（F12）
   - 查看 Console 和 Network 标签
   - 看是否有错误信息

4. **检查环境变量**
   ```bash
   # 确保 .env.local 存在
   cat .env.local
   ```
   应该包含：
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

### 路由结构说明

```
/                           → 重定向到 /[locale]
/en                         → 重定向到 /en/login（未登录）
/en/login                   → 登录页面 ✅
/en/dashboard               → 仪表板（需要登录）
/en/vocabulary              → 词汇页
/en/practice                → 练习页
/en/settings                → 设置页

/zh/login                   → 中文登录页 ✅
/ja/login                   → 日文登录页 ✅
```

### 中间件逻辑

应用使用了两层中间件：

1. **国际化中间件**
   - 检测语言
   - 重定向到正确的 locale 路径

2. **认证中间件**
   - 检查用户登录状态
   - 保护需要认证的路由
   - 重定向未登录用户到登录页

### 常见错误

#### 错误 1: 直接访问 /login
```
❌ http://localhost:3000/login
```
**解决**: 访问 `http://localhost:3000/` 让它自动重定向

#### 错误 2: 端口被占用
```
⚠ Port 3000 is in use
```
**解决**: 
```bash
# Windows
taskkill /F /IM node.exe

# 或者使用其他端口
npm run dev -- -p 3001
```

#### 错误 3: 环境变量未加载
```
Error: NEXT_PUBLIC_SUPABASE_URL is not defined
```
**解决**: 
```bash
# 确保 .env.local 存在
cp .env.example .env.local
# 编辑 .env.local 填入正确的值
```

### 调试技巧

1. **查看中间件日志**
   
   在 `middleware.ts` 中添加日志：
   ```typescript
   export async function middleware(request: NextRequest) {
     console.log('Middleware:', request.nextUrl.pathname)
     // ... rest of code
   }
   ```

2. **查看页面是否被渲染**
   
   在 `app/[locale]/login/page.tsx` 中添加日志：
   ```typescript
   export default async function LoginPage() {
     console.log('Login page rendering')
     // ... rest of code
   }
   ```

3. **检查路由是否注册**
   ```bash
   npm run build
   ```
   查看输出中是否有 `/[locale]/login` 路由

### 预期行为

**场景 1: 首次访问**
```
访问: http://localhost:3000/
↓
检测浏览器语言: en
↓
重定向: http://localhost:3000/en
↓
检查认证: 未登录
↓
重定向: http://localhost:3000/en/login
↓
显示登录页面 ✅
```

**场景 2: 已登录用户访问登录页**
```
访问: http://localhost:3000/en/login
↓
检查认证: 已登录
↓
重定向: http://localhost:3000/en/dashboard
↓
显示仪表板 ✅
```

### 如果问题仍未解决

1. 提供以下信息：
   - 访问的完整 URL
   - 浏览器控制台的错误信息
   - 开发服务器的输出
   - 浏览器语言设置

2. 尝试以下步骤：
   ```bash
   # 完全清理并重新安装
   rm -rf .next node_modules
   npm install
   npm run dev
   ```

3. 检查 Next.js 版本：
   ```bash
   npm list next
   ```
   应该是 16.2.4 或更高

### 成功标志

当一切正常时，你应该看到：

1. **开发服务器启动**
   ```
   ✓ Ready in XXXms
   ```

2. **访问根路径自动重定向**
   ```
   http://localhost:3000/ → http://localhost:3000/en/login
   ```

3. **登录页面正常显示**
   - 看到 "Language Learning" 标题
   - 看到邮箱输入框
   - 看到 "Send Magic Link" 按钮

4. **语言切换正常**
   - 可以在 en/zh/ja 之间切换
   - URL 和内容都会改变

---

**如果按照以上步骤仍然无法解决，请提供详细的错误信息！**
