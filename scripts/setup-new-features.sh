#!/bin/bash

# 新功能设置脚本
# 用于快速配置对话式学习功能

set -e  # 遇到错误立即退出

echo "🚀 开始设置新功能..."
echo ""

# 检查是否有 .env.local 文件
if [ ! -f .env.local ]; then
    echo "❌ 错误：找不到 .env.local 文件"
    echo "请先复制 .env.example 到 .env.local 并配置环境变量"
    exit 1
fi

# 检查 GEMINI_API_KEY 是否配置
if ! grep -q "GEMINI_API_KEY=" .env.local; then
    echo "⚠️  警告：未找到 GEMINI_API_KEY"
    echo "请在 .env.local 中添加："
    echo "GEMINI_API_KEY=your-gemini-api-key"
    echo ""
    echo "获取 API Key: https://makersuite.google.com/app/apikey"
    echo ""
    read -p "是否继续？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📦 安装依赖..."
npm install

echo ""
echo "🗄️  应用数据库迁移..."
npm run db:push

echo ""
echo "🔄 生成 TypeScript 类型..."
npm run db:types

echo ""
echo "✅ 类型检查..."
npm run type-check

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 设置完成！"
    echo ""
    echo "下一步："
    echo "1. 运行开发服务器: npm run dev"
    echo "2. 访问 http://localhost:3000"
    echo "3. 测试新功能："
    echo "   - Settings 页面（修改昵称和密码）"
    echo "   - Learn 页面（对话式学习）"
    echo ""
    echo "📚 查看文档："
    echo "   - docs/SETUP_GUIDE.md"
    echo "   - docs/LEARN_FEATURE.md"
    echo ""
else
    echo ""
    echo "⚠️  类型检查失败"
    echo "这可能是因为数据库迁移还未完全同步"
    echo "请手动运行："
    echo "  npm run db:push"
    echo "  npm run db:types"
    echo "  npm run type-check"
fi
