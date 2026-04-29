# 📚 Language Learning App - 文档中心

欢迎来到 Language Learning App 的文档中心。所有项目文档都已分类整理在这里。

---

## 📖 快速导航

### 🚀 开始使用
- **[README.md](../README.md)** - 项目概述和快速开始
- **[QUICKSTART.md](../QUICKSTART.md)** - 5 分钟快速启动指南
- **[START_HERE.md](../START_HERE.md)** - 新手入门指南

### 💻 开发指南
- **[DEVELOPMENT.md](../DEVELOPMENT.md)** - 完整开发指南
- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - 系统架构文档
- **[AGENTS.md](../AGENTS.md)** - AI Agent 使用规则

### 🚢 部署和配置
- **[DEPLOYMENT.md](../DEPLOYMENT.md)** - 部署指南
- **[setup/](./setup/)** - 配置相关文档
  - Supabase 设置
  - 邮件配置
  - 密码认证配置

### 🐛 调试和故障排查
- **[TROUBLESHOOTING.md](../TROUBLESHOOTING.md)** - 故障排查指南
- **[debug/](./debug/)** - 调试相关文档
  - 调试总结
  - 路由问题修复
  - 页面加载问题修复

### 🔐 认证功能
- **[auth/](./auth/)** - 认证相关文档
  - 认证问题修复报告
  - 认证测试指南
  - Magic Link 安全修复

### 🧪 测试
- **[TEST_GUIDE.md](../TEST_GUIDE.md)** - 测试指南
- **[CHECKLIST.md](../CHECKLIST.md)** - 功能完成度检查清单

### 📊 项目管理
- **[PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md)** - 项目总结
- **[DOCS_INDEX.md](../DOCS_INDEX.md)** - 文档索引

---

## 📁 文档结构

```
docs/
├── README.md                    # 本文件 - 文档中心首页
├── auth/                        # 认证相关文档
│   ├── 认证问题最终修复总结.md
│   ├── 认证问题修复报告.md
│   ├── 认证问题2-最终修复.md
│   ├── 认证修复总结.md
│   ├── 认证测试指南.md
│   └── 快速测试-错误信息清除.md
├── debug/                       # 调试相关文档
│   ├── 调试总结.md
│   ├── DEBUG_REPORT.md
│   ├── REDIRECT_DEBUG.md
│   └── 页面加载问题修复报告.md
├── setup/                       # 配置相关文档
│   ├── SUPABASE_SETUP.md
│   ├── SUPABASE_EMAIL_FIX.md
│   ├── ENABLE_PASSWORD_AUTH.md
│   └── PASSWORD_AUTH_UPDATE.md
└── archive/                     # 归档文档
    ├── FINAL_FIXES.md
    ├── FIX_SIGNUP_LOGIN.md
    ├── FIXES_APPLIED.md
    ├── DELIVERY_REPORT.md
    └── 快速修复指南.md
```

---

## 🎯 按场景查找文档

### 场景 1: 我是新开发者，想了解项目
1. 阅读 [README.md](../README.md) - 了解项目概述
2. 阅读 [QUICKSTART.md](../QUICKSTART.md) - 快速启动项目
3. 阅读 [ARCHITECTURE.md](../ARCHITECTURE.md) - 理解系统架构
4. 阅读 [DEVELOPMENT.md](../DEVELOPMENT.md) - 学习开发流程

### 场景 2: 我要配置 Supabase
1. 阅读 [setup/SUPABASE_SETUP.md](./setup/SUPABASE_SETUP.md) - Supabase 基础配置
2. 阅读 [setup/SUPABASE_EMAIL_FIX.md](./setup/SUPABASE_EMAIL_FIX.md) - 邮件配置
3. 阅读 [setup/ENABLE_PASSWORD_AUTH.md](./setup/ENABLE_PASSWORD_AUTH.md) - 密码认证配置

### 场景 3: 我遇到了问题
1. 查看 [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) - 常见问题解决方案
2. 查看 [debug/](./debug/) - 具体问题的调试文档
3. 查看 [auth/](./auth/) - 认证相关问题

### 场景 4: 我要部署项目
1. 阅读 [DEPLOYMENT.md](../DEPLOYMENT.md) - 部署指南
2. 阅读 [CHECKLIST.md](../CHECKLIST.md) - 部署前检查清单
3. 阅读 [TEST_GUIDE.md](../TEST_GUIDE.md) - 测试指南

### 场景 5: 我要了解认证功能
1. 阅读 [auth/认证问题最终修复总结.md](./auth/认证问题最终修复总结.md) - 认证功能概述
2. 阅读 [auth/认证测试指南.md](./auth/认证测试指南.md) - 测试认证功能
3. 阅读 [auth/认证问题修复报告.md](./auth/认证问题修复报告.md) - 技术细节

---

## 📝 文档维护

### 文档分类说明

- **根目录文档**: 核心文档，经常使用
- **auth/**: 认证功能相关的所有文档
- **debug/**: 调试和问题修复文档
- **setup/**: 配置和设置指南
- **archive/**: 过时或已完成的文档归档

### 添加新文档

如果需要添加新文档，请按照以下规则：

1. **认证相关** → `docs/auth/`
2. **调试相关** → `docs/debug/`
3. **配置相关** → `docs/setup/`
4. **核心文档** → 项目根目录
5. **过时文档** → `docs/archive/`

### 文档命名规范

- 使用清晰描述性的名称
- 中文文档使用中文命名
- 英文文档使用英文命名，单词用 `-` 连接
- 例如: `认证问题修复报告.md`, `SUPABASE_SETUP.md`

---

## 🔍 搜索文档

### 按关键词搜索

- **认证/登录**: 查看 `auth/` 文件夹
- **Supabase**: 查看 `setup/` 文件夹
- **错误/问题**: 查看 `debug/` 文件夹和 `TROUBLESHOOTING.md`
- **部署**: 查看 `DEPLOYMENT.md`
- **开发**: 查看 `DEVELOPMENT.md`

### 使用 grep 搜索

```bash
# 在所有文档中搜索关键词
grep -r "关键词" docs/

# 在特定文件夹中搜索
grep -r "Magic Link" docs/auth/
```

---

## 📞 需要帮助？

如果你在文档中找不到需要的信息：

1. 查看 [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)
2. 查看 [DOCS_INDEX.md](../DOCS_INDEX.md)
3. 查看项目的 GitHub Issues
4. 联系项目维护者

---

## 📅 最后更新

**日期**: 2026-04-30  
**版本**: 0.1.0  
**状态**: 文档已整理完成

---

**祝你使用愉快！** 🎉
