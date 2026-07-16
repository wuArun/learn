#!/bin/bash

# Spring AI Alibaba Agent API 测试脚本

BASE_URL="http://localhost:8080/api/agent"

echo "🧪 Spring AI Alibaba Agent API 测试"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 健康检查
echo -e "${YELLOW}1️⃣  健康检查...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ 健康检查通过${NC}"
else
    echo -e "${RED}❌ 健康检查失败 (HTTP $response)${NC}"
    echo "请确保服务已启动: mvn spring-boot:run"
    exit 1
fi
echo ""

# 2. 获取 Agent 类型
echo -e "${YELLOW}2️⃣  获取可用 Agent 类型...${NC}"
curl -s "$BASE_URL/types" | jq '.' || echo "获取失败"
echo ""

# 3. 测试通用对话
echo -e "${YELLOW}3️⃣  测试通用对话 Agent...${NC}"
curl -s -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "你好",
    "agentType": "general"
  }' | jq '.'
echo ""

# 4. 测试知识库 Agent
echo -e "${YELLOW}4️⃣  测试知识库 Agent...${NC}"
curl -s -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "什么是 Spring？",
    "agentType": "knowledge"
  }' | jq '.'
echo ""

# 5. 测试计算器 Agent
echo -e "${YELLOW}5️⃣  测试计算器 Agent...${NC}"
curl -s -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "2 + 3 * 4",
    "agentType": "calculator"
  }' | jq '.'
echo ""

# 6. 测试天气 Agent
echo -e "${YELLOW}6️⃣  测试天气 Agent...${NC}"
curl -s -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "今天天气怎么样？",
    "agentType": "weather"
  }' | jq '.'
echo ""

# 7. 对话历史测试
echo -e "${YELLOW}7️⃣  获取对话历史...${NC}"
CONV_ID=$(curl -s -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "测试", "agentType": "general"}' | jq -r '.conversationId')

if [ -n "$CONV_ID" ] && [ "$CONV_ID" != "null" ]; then
    echo "对话 ID: $CONV_ID"
    curl -s "$BASE_URL/history/$CONV_ID" | jq '.'
else
    echo "获取对话 ID 失败"
fi
echo ""

echo -e "${GREEN}🎉 所有测试完成！${NC}"
echo ""
echo "📱 访问 Web UI: http://localhost:8080"
