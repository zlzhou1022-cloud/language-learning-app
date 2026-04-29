# 文档索引

欢迎来到 Language Learning App 项目！这里是所有文档的索引。

## 📚 快速导航

### 🚀 开始使用
- **[README.md](./README.md)** - 项目概述和介绍
- **[QUICKSTART.md](./QUICKSTART.md)** - 5 分钟快速启动指南
- **[CHECKLIST.md](./CHECKLIST.md)** - 项目完成度检查清单

### 💻 开发相关
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - 完整的开发指南
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - 系统架构文档
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - 项目交付总结

### 🚢 部署相关
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Vercel 部署指南
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Supabase 配置说明

## 📖 文档详细说明

### README.md
**适合人群**: 所有人  
**内容**:
- 项目介绍
- 技术栈说明
- 功能特性列表
- 数据库结构
- 本地开发步骤
- 设计原则
- 免费方案确认

**何时阅读**: 第一次了解项目时

---

### QUICKSTART.md
**适合人群**: 开发者  
**内容**:
- 5 分钟快速启动
- 项目结构速览
- 设计特点
- 常用命令
- 数据库操作
- 下一步建议

**何时阅读**: 准备开始开发时

---

### DEVELOPMENT.md
**适合人群**: 开发者  
**内容**:
- 开发环境设置
- 常用命令详解
- 项目结构详解
- 开发工作流
- 组件开发指南
- 样式指南
- 数据库操作
- 国际化使用
- 调试技巧
- 性能优化
- 代码规范

**何时阅读**: 深入开发功能时

---

### ARCHITECTURE.md
**适合人群**: 架构师、高级开发者  
**内容**:
- 系统架构图
- 技术栈层次
- 数据流说明
- 组件架构
- 状态管理
- 安全架构
- 性能优化策略
- 部署架构
- 扩展性设计
- 设计模式

**何时阅读**: 需要理解整体架构时

---

### DEPLOYMENT.md
**适合人群**: DevOps、开发者  
**内容**:
- Vercel 部署步骤
- GitHub 集成
- 环境变量配置
- Supabase 配置
- 自动部署设置
- 自定义域名
- 监控和日志
- 故障排查
- 成本估算

**何时阅读**: 准备部署到生产环境时

---

### SUPABASE_SETUP.md
**适合人群**: 后端开发者、DevOps  
**内容**:
- 当前 Supabase 配置
- 数据库状态
- 认证配置
- 环境变量说明
- 数据库管理
- 迁移操作
- 监控和日志
- 安全最佳实践
- 免费套餐限制
- 故障排查

**何时阅读**: 需要操作数据库或配置认证时

---

### PROJECT_SUMMARY.md
**适合人群**: 项目经理、技术负责人  
**内容**:
- 已完成功能清单
- 项目文件结构
- 数据库表结构
- 安全特性
- 设计规范
- 成本分析
- 部署步骤
- 待开发功能
- 开发命令
- 项目亮点

**何时阅读**: 需要了解项目整体状态时

---

### CHECKLIST.md
**适合人群**: 所有人  
**内容**:
- 技术栈检查
- 核心功能检查
- 数据库检查
- UI/UX 检查
- 代码质量检查
- 构建和部署检查
- 文档检查
- 测试检查
- 性能检查
- 安全检查
- 下一步计划

**何时阅读**: 验证项目完成度时

---

## 🎯 按场景查找文档

### 场景 1: 我是新加入的开发者
1. 阅读 [README.md](./README.md) 了解项目
2. 跟随 [QUICKSTART.md](./QUICKSTART.md) 启动项目
3. 参考 [DEVELOPMENT.md](./DEVELOPMENT.md) 开始开发

### 场景 2: 我需要添加新功能
1. 查看 [DEVELOPMENT.md](./DEVELOPMENT.md) 的开发工作流
2. 参考 [ARCHITECTURE.md](./ARCHITECTURE.md) 理解架构
3. 使用 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 操作数据库

### 场景 3: 我需要部署项目
1. 阅读 [DEPLOYMENT.md](./DEPLOYMENT.md) 了解部署流程
2. 参考 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 配置后端
3. 使用 [CHECKLIST.md](./CHECKLIST.md) 验证部署

### 场景 4: 我需要理解项目架构
1. 阅读 [ARCHITECTURE.md](./ARCHITECTURE.md) 了解整体架构
2. 查看 [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) 了解实现细节
3. 参考 [DEVELOPMENT.md](./DEVELOPMENT.md) 了解代码组织

### 场景 5: 我遇到了问题
1. 查看 [DEVELOPMENT.md](./DEVELOPMENT.md) 的常见问题
2. 参考 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 的故障排查
3. 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 的故障排查

### 场景 6: 我需要向他人介绍项目
1. 使用 [README.md](./README.md) 作为介绍材料
2. 展示 [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) 的项目亮点
3. 参考 [CHECKLIST.md](./CHECKLIST.md) 说明完成度

## 📁 代码文档

### 关键文件说明

```
app/
├── [locale]/layout.tsx       # 主布局，包含主题和国际化
├── [locale]/page.tsx         # 首页重定向逻辑
├── [locale]/login/           # 登录页面
├── [locale]/dashboard/       # 仪表板（需要认证）
└── globals.css               # 全局样式和主题变量

components/
├── auth/login-form.tsx       # 登录表单组件
├── dashboard/dashboard-nav.tsx  # 导航组件
├── language-switcher.tsx     # 语言切换器
├── theme-toggle.tsx          # 主题切换器
└── ui/                       # Shadcn UI 组件库

lib/
├── supabase/
│   ├── client.ts            # 浏览器端 Supabase 客户端
│   ├── server.ts            # 服务端 Supabase 客户端
│   └── middleware.ts        # 中间件 Supabase 客户端
├── database.types.ts        # 数据库类型定义（自动生成）
└── utils.ts                 # 工具函数

i18n/
├── routing.ts               # 国际化路由配置
└── request.ts               # 国际化请求配置

messages/
├── en.json                  # 英文翻译
├── zh.json                  # 中文翻译
└── ja.json                  # 日文翻译

supabase/
└── migrations/              # 数据库迁移文件
    └── 20260429000001_initial_schema.sql
```

## 🔗 外部资源

### 官方文档
- [Next.js 文档](https://nextjs.org/docs)
- [Supabase 文档](https://supabase.com/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Shadcn UI 文档](https://ui.shadcn.com)
- [next-intl 文档](https://next-intl-docs.vercel.app)
- [next-themes 文档](https://github.com/pacocoursey/next-themes)

### 项目链接
- Supabase Dashboard: https://supabase.com/dashboard/project/jwoyiuswfpdacfyieppo
- GitHub Repository: (待添加)
- 生产环境: (待部署)

## 💡 文档维护

### 更新文档
当项目发生重大变更时，请更新相应文档：

- 添加新功能 → 更新 README.md, DEVELOPMENT.md
- 修改架构 → 更新 ARCHITECTURE.md
- 添加新依赖 → 更新 README.md
- 修改部署流程 → 更新 DEPLOYMENT.md
- 数据库变更 → 更新 SUPABASE_SETUP.md

### 文档规范
- 使用 Markdown 格式
- 保持简洁清晰
- 添加代码示例
- 包含截图（如需要）
- 及时更新

## 📞 获取帮助

如果文档中没有找到答案：

1. 查看项目 Issues
2. 查阅官方文档
3. 在团队中提问
4. 创建新的 Issue

## 🎉 开始使用

现在你已经了解了所有文档，选择适合你的文档开始吧！

**推荐路径**:  
README.md → QUICKSTART.md → DEVELOPMENT.md → 开始编码！

---

**最后更新**: 2026-04-29  
**文档版本**: 1.0.0
