# 本地测试指南

## 快速测试

### 方式 1：使用提供的测试脚本（推荐）

```bash
# 确保后端已启动
mvn spring-boot:run &

# 等待服务启动（约 10 秒）
sleep 10

# 运行完整的 API 测试
chmod +x test-api.sh
./test-api.sh
```

### 方式 2：手动 curl 测试

```bash
# 1. 健康检查
curl http://localhost:8080/api/agent/health

# 2. 获取 Agent 类型
curl http://localhost:8080/api/agent/types

# 3. 发送聊天消息
curl -X POST http://localhost:8080/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"你好","agentType":"general"}'

# 4. 获取对话历史
curl http://localhost:8080/api/agent/history/{conversationId}
```

### 方式 3：使用浏览器访问

1. 启动后端：`mvn spring-boot:run`
2. 打开浏览器：`http://localhost:8080`
3. 在 Web UI 中与 Agent 交互

## 详细的测试步骤

### 步骤 1：启动后端服务

```bash
cd /workspaces/learn
mvn clean package
mvn spring-boot:run
```

或使用启动脚本：

**Linux/Mac:**
```bash
./start.sh
```

**Windows:**
```bash
start.bat
```

### 步骤 2：验证服务健康状态

```bash
curl http://localhost:8080/api/agent/health
# 预期响应：{"status":"OK","message":"Agent service is running","timestamp":...}
```

### 步骤 3：运行 API 测试

```bash
chmod +x test-api.sh
./test-api.sh
```

预期输出示例：
```
🧪 Spring AI Alibaba Agent API 测试
==========================================

1️⃣  健康检查...
✅ 健康检查通过

2️⃣  获取可用 Agent 类型...
{
  "types": ["general", "calculator", "knowledge", "weather"],
  "descriptions": {...}
}

3️⃣  测试通用对话 Agent...
{
  "reply": "👋 你好！我是一个 Spring AI Alibaba Agent...",
  "conversationId": "uuid",
  "status": "success",
  "executionTime": 45
}
...
```

### 步骤 4：测试前端页面

打开浏览器访问：`http://localhost:8080`

## 测试场景

### 场景 1：通用对话

```bash
curl -X POST http://localhost:8080/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "你好",
    "agentType": "general"
  }'
```

**预期响应：** Agent 问候消息

### 场景 2：知识库查询

```bash
curl -X POST http://localhost:8080/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "什么是Spring？",
    "agentType": "knowledge"
  }'
```

**预期响应：** Spring 框架相关信息

### 场景 3：计算器

```bash
curl -X POST http://localhost:8080/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "2 + 3 * 4",
    "agentType": "calculator"
  }'
```

**预期响应：** 计算结果

### 场景 4：天气查询

```bash
curl -X POST http://localhost:8080/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "今天天气怎么样？",
    "agentType": "weather"
  }'
```

**预期响应：** 天气信息

## 对话管理测试

### 获取对话历史

```bash
# 先发送一条消息获取 conversationId
CONV_ID=$(curl -s -X POST http://localhost:8080/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"测试","agentType":"general"}' | jq -r '.conversationId')

# 获取对话历史
curl http://localhost:8080/api/agent/history/$CONV_ID | jq '.'
```

### 清空对话历史

```bash
curl -X DELETE http://localhost:8080/api/agent/history/$CONV_ID
```

## 性能测试

### 并发请求测试

```bash
# 使用 Apache Bench 进行并发测试
ab -n 100 -c 10 http://localhost:8080/api/agent/health

# 使用 wrk 进行压力测试
wrk -t4 -c100 -d30s http://localhost:8080/api/agent/health
```

## 常见问题排查

### 问题 1：无法连接到服务

```bash
# 检查服务是否启动
lsof -i :8080
# 或 Windows 上：
netstat -ano | findstr :8080

# 检查防火墙
sudo ufw allow 8080  # Linux
```

### 问题 2：API 返回 404

确保 URL 正确：
```bash
# ❌ 错误：http://localhost:8080/chat
# ✅ 正确：http://localhost:8080/api/agent/chat
```

### 问题 3：JSON 解析错误

检查请求体格式：
```bash
# 确保 JSON 正确
curl -X POST http://localhost:8080/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"hello","agentType":"general"}'
```

## IDE 集成测试

### IntelliJ IDEA / WebStorm

1. 打开 File → New → HTTP Request
2. 输入测试请求：

```http request
### 健康检查
GET http://localhost:8080/api/agent/health

### 发送消息
POST http://localhost:8080/api/agent/chat
Content-Type: application/json

{
  "message": "你好",
  "agentType": "general"
}

### 获取历史
GET http://localhost:8080/api/agent/history/{{conversationId}}
```

### VS Code

安装 "REST Client" 扩展，创建 `requests.http` 文件：

```http
@baseUrl = http://localhost:8080/api/agent

### 健康检查
GET {{baseUrl}}/health

### 获取类型
GET {{baseUrl}}/types

### 发送消息
POST {{baseUrl}}/chat
Content-Type: application/json

{
  "message": "你好",
  "agentType": "general"
}
```

## 自动化测试

使用 Postman / Insomnia 导入测试集合：

[导入 Postman Collection](./postman-collection.json)

## 测试覆盖率

- ✅ 单一 Agent 类型
- ✅ 多个 Agent 类型切换
- ✅ 对话历史管理
- ✅ 错误处理
- ✅ 并发请求
- ✅ 性能基准
