#!/bin/bash

echo "🌸 启动 FlowerOS 开发服务器..."

# 检查是否安装了 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ 请先安装 pnpm: npm install -g pnpm"
    exit 1
fi

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖中..."
    pnpm install
fi

# 启动开发服务器
echo "🚀 启动开发服务器..."
pnpm dev
