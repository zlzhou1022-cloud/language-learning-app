# 🚀 部署前检查清单

在部署新功能之前，请按照此清单逐项检查。

## ✅ 数据库准备

### 本地测试

- [ ] 运行数据库迁移
  ```bash
  npm run db:push
  ```

- [ ] 生成 TypeScript 类型
  ```bash
  npm run db:types
  ```

- [ ] 验证迁移成功
  - 检查 `profiles` 表是否有 `nickname` 字段
  - 检查 `dictionaries` 表是否有新字段

### 生产环境

- [ ] 链接到远程 Supabase 项目
  ```bash
  npx supabase link --project-ref your-project-ref
  ```

- [ ] 推送迁移到生产
  ```bash
  npx supabase db push
  ```

- [ ] 在 Supabase Dashboard 验证表结构

## ✅ 环境变量配置

### 本地环境 (.env.local)

- [ ] `NEXT_PUBLIC_SUPABASE_URL` 已配置
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 已配置
- [ ] `GEMINI_API_KEY` 已配置并测试

### Vercel 生产环境

- [ ] 在 Vercel Dashboard 添加 `GEMINI_API_KEY`
- [ ] 选择所有环境（Production, Preview, Development）
- [ ] 保存并触发重新部署

## ✅ 代码质量检查

- [ ] TypeScript 类型检查通过
  ```bash
  npm run type-check
  ```

- [ ] ESLint 检查通过
  ```bash
  npm run lint
  ```

- [ ] 生产构建成功
  ```bash
  npm run build
  ```

## ✅ 功能测试

### Settings 页面

- [ ] 可以访问 `/settings` 页面
- [ ] 可以修改昵称
- [ ] 昵称修改后立即同步到 Dashboard
- [ ] 可以修改密码
- [ ] 密码验证正常工作
- [ ] 错误提示清晰友好

### Learn 页面

- [ ] 可以访问 `/learn` 页面
- [ ] 可以输入单词
- [ ] AI 响应正常（测试 2-3 个单词）
- [ ] 可以进行多轮对话
- [ ] 可以生成卡片
- [ ] 卡片编辑器正常工作
- [ ] 可以添加/删除例句
- [ ] 保存卡片成功
- [ ] 保存后跳转到词汇页面

### Dashboard

- [ ] 欢迎语显示昵称（或邮箱用户名）
- [ ] "添加生词"按钮可用
- [ ] 点击跳转到 Learn 页面
- [ ] 词汇统计正确显示

### 导航

- [ ] "Learn" 导航项显示
- [ ] 所有导航链接正常工作
- [ ] 移动端导航正常
- [ ] 桌面端侧边栏正常

## ✅ 浏览器兼容性

- [ ] Chrome 测试通过
- [ ] Firefox 测试通过
- [ ] Safari 测试通过（如有 Mac）
- [ ] Edge 测试通过
- [ ] 移动端浏览器测试通过

## ✅ 响应式设计

- [ ] 桌面端（>1024px）布局正常
- [ ] 平板端（768px-1024px）布局正常
- [ ] 移动端（<768px）布局正常
- [ ] 所有交互元素可点击
- [ ] 文字可读性良好

## ✅ 性能检查

- [ ] 页面加载时间 < 3 秒
- [ ] LLM 响应时间可接受（2-4 秒）
- [ ] 无明显的性能瓶颈
- [ ] 图片和资源已优化

## ✅ 安全检查

- [ ] API Key 不暴露在客户端
- [ ] 环境变量正确配置
- [ ] RLS 策略正常工作
- [ ] 用户只能访问自己的数据
- [ ] 认证中间件保护所有路由

## ✅ 文档更新

- [ ] README.md 已更新
- [ ] IMPLEMENTATION_SUMMARY.md 已创建
- [ ] docs/LEARN_FEATURE.md 已创建
- [ ] docs/SETUP_GUIDE.md 已创建
- [ ] 所有文档链接正确

## ✅ Git 提交

- [ ] 所有更改已提交
  ```bash
  git add .
  git commit -m "feat: add conversational learning feature with LLM integration"
  ```

- [ ] 提交信息清晰描述更改
- [ ] 推送到远程仓库
  ```bash
  git push origin main
  ```

## ✅ Vercel 部署

- [ ] Vercel 自动部署触发
- [ ] 部署成功（无错误）
- [ ] 生产环境可访问
- [ ] 所有功能在生产环境正常工作

## ✅ 生产环境验证

### 基础功能

- [ ] 登录功能正常
- [ ] 语言切换正常
- [ ] 主题切换正常
- [ ] 导航正常

### 新功能

- [ ] Settings 页面正常
- [ ] Learn 页面正常
- [ ] AI 对话功能正常
- [ ] 卡片生成和保存正常
- [ ] 昵称同步正常

### 数据持久化

- [ ] 修改的昵称保存成功
- [ ] 保存的单词卡片可查询
- [ ] 刷新页面后数据仍然存在

## ✅ 监控和日志

- [ ] Vercel Analytics 正常（如已启用）
- [ ] Supabase 日志无异常
- [ ] 浏览器控制台无错误
- [ ] 网络请求正常

## ✅ API 配额检查

- [ ] Gemini API 配额充足
- [ ] Supabase 配额充足
- [ ] Vercel 配额充足

## ✅ 用户体验

- [ ] 加载状态清晰
- [ ] 错误提示友好
- [ ] 成功反馈明确
- [ ] 交互流畅自然
- [ ] 设计风格一致

## ✅ 备份和回滚计划

- [ ] 数据库有备份
- [ ] 知道如何回滚迁移
- [ ] 知道如何回滚代码部署
- [ ] 有应急联系方式

## 🎯 部署后任务

### 立即执行

- [ ] 测试生产环境所有功能
- [ ] 监控错误日志（前 24 小时）
- [ ] 检查 API 使用量
- [ ] 收集用户反馈

### 一周内

- [ ] 分析用户使用数据
- [ ] 优化性能瓶颈
- [ ] 修复发现的 bug
- [ ] 更新文档（如需要）

### 持续监控

- [ ] 每日检查错误日志
- [ ] 每周检查 API 配额
- [ ] 每月检查性能指标
- [ ] 定期收集用户反馈

---

## 📞 紧急联系

如果部署过程中遇到问题：

1. **回滚代码**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **回滚数据库**
   ```bash
   # 查看迁移历史
   npx supabase migration list
   
   # 回滚到指定版本
   npx supabase db reset --version <version>
   ```

3. **检查日志**
   - Vercel Dashboard → Deployments → Logs
   - Supabase Dashboard → Logs
   - 浏览器开发者工具 → Console

4. **联系支持**
   - Vercel Support: https://vercel.com/support
   - Supabase Support: https://supabase.com/support
   - Google AI Support: https://ai.google.dev/support

---

## ✅ 最终确认

- [ ] 所有检查项都已完成
- [ ] 生产环境运行正常
- [ ] 团队成员已通知
- [ ] 文档已更新
- [ ] 用户可以正常使用新功能

**部署完成！** 🎉

---

**检查清单版本**: 1.0  
**最后更新**: 2026-05-01  
**适用版本**: v1.0.0 (对话式学习功能)
