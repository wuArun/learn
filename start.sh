#!/bin/bash

# Spring AI Alibaba Agent 应用启动脚本

echo "================================"
echo "Spring AI Alibaba Agent 应用"
echo "================================"
echo ""

# 检查 Java 版本
echo "🔍 检查 Java 版本..."
if ! command -v java &> /dev/null; then
    echo "❌ Java 未安装，请先安装 Java 17+"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | grep -oP 'version "\K[0-9]+' | head -1)
if [ "$JAVA_VERSION" -lt 17 ]; then
    echo "❌ Java 版本过低 (当前: $JAVA_VERSION)，需要 Java 17+"
    exit 1
fi
echo "✅ Java 版本检查通过: $JAVA_VERSION"
echo ""

# 检查 Maven
echo "🔍 检查 Maven 安装..."
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven 未安装"
    exit 1
fi
echo "✅ Maven 已安装"
echo ""

# 编译项目
echo "📦 正在编译项目..."
mvn clean package -q

if [ $? -eq 0 ]; then
    echo "✅ 编译成功"
else
    echo "❌ 编译失败"
    exit 1
fi
echo ""

# 启动应用
echo "🚀 正在启动应用..."
echo ""
echo "📱 访问地址: http://localhost:8080"
echo "🛑 按 Ctrl+C 停止应用"
echo ""

java -jar target/learn-1.0.0.jar
