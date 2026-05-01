#!/bin/bash

# 更新数据库类型脚本

echo "📦 应用数据库迁移..."
npm run db:push

echo "🔄 生成 TypeScript 类型..."
npm run db:types

echo "✅ 完成！现在可以运行 npm run type-check 检查类型"
