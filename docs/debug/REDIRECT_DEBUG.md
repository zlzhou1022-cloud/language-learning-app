# 重定向问题调试

## 问题描述
访问 `http://localhost:3000/` 时页面一直加载，不显示任何内容。

## 可能的原因

### 1. 重定向循环
当前的路由流程：
```
1. 用户访问: /
2. next-intl 中间件: / → /en (或其他语言)
3. Supabase 中间件: 检查认证
   - 如果未登录: /en → /en/login
4. app/[locale]/page.tsx: 
   - 如果未登录: redirect → /en/login
```

**问题**: `/en` 路径可能被中间件和页面组件同时处理，导致循环。

### 2. 中间件逻辑问题
`lib/supabase/middleware.ts` 中的重定向逻辑：
- 检查 `!request.nextUrl.pathname.includes('/login')`
- 但是 `/en` 路径不包含 `/login`，所以会被重定向

## 修复方案

### 方案 1: 修改中间件逻辑（已应用）
在 `lib/supabase/middleware.ts` 中添加对 locale 根路径的检查：
```typescript
if (
  !user &&
  !request.nextUrl.pathname.includes('/login') &&
  !request.nextUrl.pathname.includes('/auth') &&
  !request.nextUrl.pathname.match(/^\/[a-z]{2}$/) // 不重定向 locale 根路径
) {
  // 重定向到登录
}
```

### 方案 2: 修改页面组件（已应用）
在 `app/[locale]/page.tsx` 中使用完整路径：
```typescript
if (user) {
  redirect(`/${locale}/dashboard`);
} else {
  redirect(`/${locale}/login`);
}
```

## 测试步骤

1. 清除浏览器缓存和 cookies
2. 打开浏览器开发者工具（F12）
3. 切换到 Network 标签
4. 访问 `http://localhost:3000/`
5. 观察重定向链：
   - 应该看到: `/` → `/en` → `/en/login`
   - 不应该有循环重定向

## 预期行为

### 未登录用户
```
访问: http://localhost:3000/
  ↓
next-intl 中间件: 检测语言 → /en
  ↓
Supabase 中间件: 未登录 → 允许访问 /en
  ↓
app/[locale]/page.tsx: 未登录 → redirect /en/login
  ↓
显示登录页面
```

### 已登录用户
```
访问: http://localhost:3000/
  ↓
next-intl 中间件: 检测语言 → /en
  ↓
Supabase 中间件: 已登录 → 允许访问 /en
  ↓
app/[locale]/page.tsx: 已登录 → redirect /en/dashboard
  ↓
显示仪表板
```

## 调试命令

### 查看浏览器请求
在浏览器控制台运行：
```javascript
// 查看所有请求
performance.getEntriesByType('navigation')

// 查看重定向次数
performance.getEntriesByType('navigation')[0].redirectCount
```

### 添加调试日志
在 `middleware.ts` 中添加：
```typescript
console.log('Middleware:', {
  pathname: request.nextUrl.pathname,
  hasUser: !!user,
  willRedirect: !user && !pathname.includes('/login')
});
```

## 如果问题仍然存在

### 临时解决方案：直接访问登录页
```
http://localhost:3000/en/login
http://localhost:3000/zh/login
http://localhost:3000/ja/login
```

### 完全禁用中间件重定向（测试用）
在 `lib/supabase/middleware.ts` 中注释掉重定向逻辑：
```typescript
// if (!user && ...) {
//   return NextResponse.redirect(url)
// }
```

这样可以确认是否是中间件导致的问题。
