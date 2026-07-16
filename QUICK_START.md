# Spring AI Alibaba Agent 快速启动指南

## 📱 5分钟快速开始

### 步骤 1：启动应用

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```bash
start.bat
```

**或者使用 Maven:**
```bash
mvn spring-boot:run
```

**或者使用 Docker:**
```bash
docker-compose up --build
```

### 步骤 2：打开浏览器

访问 [http://localhost:8080](http://localhost:8080)

### 步骤 3：开始使用

1. 在左侧选择 Agent 类型
2. 在下方输入框输入你的问题
3. 点击发送或按 Ctrl+Enter

---

## 🎯 快速测试

### 使用 curl 测试 API

```bash
# 1. 健康检查
curl http://localhost:8080/api/agent/health

# 2. 发送问题
curl -X POST http://localhost:8080/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"你好","agentType":"general"}'

# 3. 获取 Agent 类型
curl http://localhost:8080/api/agent/types
```

### 使用测试脚本

```bash
chmod +x test-api.sh
./test-api.sh
```

---

## 🔧 配置修改

### 修改服务端口

编辑 `src/main/resources/application.yml`:
```yaml
server:
  port: 9000  # 改成你想要的端口
```

### 配置 API Key

方式 1 - 环境变量：
```bash
export DASHSCOPE_API_KEY=your-api-key
mvn spring-boot:run
```

方式 2 - application.yml：
```yaml
spring:
  ai:
    alibaba:
      api-key: your-api-key-here
```

---

## 📊 项目结构一览

```
learn/
├── src/main/java/com/arun/agent/
│   ├── AgentApplication.java          ⭐ 启动类
│   ├── controller/AgentController.java ⭐ API 端点
│   ├── service/AgentService.java      ⭐ Agent 逻辑
│   └── dto/                           ⭐ 数据模型
├── src/main/resources/
│   ├── application.yml                ⭐ 配置文件
│   └── static/index.html              ⭐ Web UI
├── pom.xml                            ⭐ Maven 依赖
├── start.sh / start.bat               🚀 启动脚本
├── test-api.sh                        🧪 测试脚本
├── Dockerfile                         🐳 Docker 镜像
└── docker-compose.yml                 🐳 Docker Compose
```

---

## 🚨 常见问题

### 问题 1：无法访问 http://localhost:8080

**解决方案：**
1. 检查应用是否启动：
   ```bash
   curl http://localhost:8080/api/agent/health
   ```
2. 检查防火墙设置
3. 修改端口后检查是否对应修改

### 问题 2：Maven 依赖下载缓慢

**解决方案：**
修改 Maven settings.xml，使用国内镜像：
```xml
<mirror>
    <id>aliyun</id>
    <name>aliyun maven</name>
    <url>http://maven.aliyun.com/nexus/content/groups/public</url>
    <mirrorOf>central</mirrorOf>
</mirror>
```

### 问题 3：Java 版本不匹配

**解决方案：**
确保 Java 版本 >= 17：
```bash
java -version
# 应该显示 17 或更高版本
```

### 问题 4：前端页面空白

**解决方案：**
1. 打开浏览器开发者工具（F12）
2. 检查 Console 选项卡是否有错误
3. 检查 Network 选项卡看 API 调用是否成功

---

## 📚 进阶使用

### 集成真实 LLM

编辑 `AgentService.java` 的 `handleGeneralChat` 方法：

```java
// 替换这段代码
private String handleGeneralChat(String message) {
    // 调用真实的 LLM API
    return callLLMAPI(message);
}

private String callLLMAPI(String message) {
    // 使用 Spring AI 或直接调用阿里云 API
    // ...
}
```

### 添加新的 Agent 类型

1. 在 `AgentService.java` 中添加处理方法
2. 更新 `handleAgentLogic` 方法
3. 在前端的 `agentTypes` 数组中添加新类型

### 使用数据库存储对话

1. 添加 JPA 依赖
2. 创建 Conversation 实体
3. 修改 `AgentService` 使用数据库而不是内存存储

---

## 📝 日志查看

应用日志默认输出到控制台。

要输出到文件，修改 `application.yml`:
```yaml
logging:
  file:
    name: logs/application.log
  level:
    root: INFO
    com.arun.agent: DEBUG
```

---

## 🤝 支持和帮助

- 📖 查看详细文档：[AGENT_README.md](AGENT_README.md)
- 🐛 遇到 Bug：检查日志输出
- 💡 有建议：欢迎提交 Issue

---

## ✨ 下一步

1. ✅ 应用已启动运行
2. ⬜ 集成真实 LLM API
3. ⬜ 添加数据库持久化
4. ⬜ 部署到生产环境
5. ⬜ 自定义前端样式

祝你使用愉快！🎉
