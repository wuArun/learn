# Spring AI Alibaba Agent 应用

这是一个基于 Spring Boot 3.x 和 Spring AI Alibaba 的智能 Agent 应用示例。

## 🎯 功能特性

- ✅ **多类型 Agent 支持**：通用对话、计算器、知识库、天气查询
- ✅ **Web UI 前端**：现代化的 Vue 3 + 自适应设计
- ✅ **对话管理**：对话历史记录、清空历史功能
- ✅ **RESTful API**：完整的后端 API 接口
- ✅ **实时反馈**：异步请求、加载状态提示
- ✅ **错误处理**：完善的异常处理机制

## 📋 系统要求

- Java 17+
- Maven 3.6+
- 现代浏览器（Chrome、Firefox、Safari 等）

## 🚀 快速开始

### 1. 克隆/获取项目
```bash
cd /workspaces/learn
```

### 2. 安装依赖（可选，Maven 会自动下载）
```bash
mvn clean install
```

### 3. 启动应用
```bash
mvn spring-boot:run
```

或者直接运行编译后的 JAR：
```bash
mvn clean package
java -jar target/learn-1.0.0.jar
```

### 4. 访问应用
打开浏览器访问：
```
http://localhost:8080
```

## 📁 项目结构

```
learn/
├── src/main/java/com/arun/agent/
│   ├── AgentApplication.java           # 应用启动类
│   ├── controller/
│   │   └── AgentController.java        # REST API 控制器
│   ├── service/
│   │   └── AgentService.java           # Agent 业务逻辑
│   └── dto/
│       ├── AgentRequest.java           # 请求 DTO
│       └── AgentResponse.java          # 响应 DTO
├── src/main/resources/
│   ├── application.yml                 # 应用配置文件
│   └── static/
│       └── index.html                  # Web UI 前端页面
└── pom.xml                             # Maven 配置文件
```

## 🔌 API 文档

### 1. 处理 Agent 请求
**POST** `/api/agent/chat`

请求体：
```json
{
  "message": "2 + 3 * 4",
  "conversationId": "optional-conversation-id",
  "agentType": "calculator"
}
```

响应：
```json
{
  "reply": "计算结果...",
  "conversationId": "uuid",
  "status": "success",
  "executionTime": 123
}
```

### 2. 获取对话历史
**GET** `/api/agent/history/{conversationId}`

### 3. 清空对话历史
**DELETE** `/api/agent/history/{conversationId}`

### 4. 获取可用 Agent 类型
**GET** `/api/agent/types`

### 5. 健康检查
**GET** `/api/agent/health`

## 🤖 Agent 类型说明

| Agent 类型 | 图标 | 说明 | 使用场景 |
|----------|------|------|--------|
| general | 💬 | 通用智能对话 | 一般问答、闲聊 |
| calculator | 🧮 | 数学计算 | 数学表达式计算 |
| knowledge | 📚 | 知识库问答 | 技术知识查询 |
| weather | 🌤️ | 天气查询 | 天气信息查询 |

## 🛠️ 集成真实 LLM API

### 方式 1：使用阿里云 DashScope API

1. **获取 API Key**
   - 访问 [阿里云 DashScope](https://dashscope.aliyun.com/)
   - 注册并获取 API Key

2. **配置环境变量**
   ```bash
   export DASHSCOPE_API_KEY=your-api-key-here
   ```

3. **或在 application.yml 中配置**
   ```yaml
   spring:
     ai:
       alibaba:
         api-key: your-api-key-here
         model: qwen-max
   ```

4. **修改 AgentService**
   - 替换 `handleGeneralChat` 方法中的逻辑
   - 调用真实的 LLM API

### 方式 2：使用 Spring AI Alibaba

```java
@Autowired
private ChatClient chatClient;

public String callLLM(String prompt) {
    return chatClient.prompt()
        .user(prompt)
        .call()
        .getResult()
        .getOutput()
        .getContent();
}
```

## 📝 使用示例

### 示例 1：通用对话
```
用户：你好
Agent：👋 你好！我是一个 Spring AI Alibaba Agent...
```

### 示例 2：知识库查询
```
用户：什么是 Spring？
Agent：📚 知识回复：Spring Framework 是 Java 企业级应用开发的标准框架
```

### 示例 3：天气查询
```
用户：今天天气怎么样？
Agent：🌤️ 天气查询结果：当前温度：25°C...
```

## 🔧 配置说明

### application.yml 配置项

```yaml
spring:
  application:
    name: agent-application      # 应用名称
  ai:
    alibaba:
      api-key: ${DASHSCOPE_API_KEY:your-api-key-here}  # API Key
      model: qwen-max             # 模型名称

server:
  port: 8080                      # 服务端口
  servlet:
    context-path: /               # 上下文路径

logging:
  level:
    root: INFO                    # 日志级别
    com.arun.agent: DEBUG         # 应用日志级别
```

## 🐛 常见问题

### Q1: 启动时报 Java 版本错误
**A**: 确保 Java 版本 >= 17
```bash
java -version
```

### Q2: 无法连接到服务器
**A**: 
1. 检查服务是否启动：`http://localhost:8080/api/agent/health`
2. 检查防火墙设置
3. 查看日志输出：`mvn spring-boot:run`

### Q3: Maven 依赖下载失败
**A**: 
1. 检查网络连接
2. 修改 Maven 镜像源（settings.xml）
3. 清空本地仓存：`mvn clean`

### Q4: 如何修改监听端口
**A**: 在 application.yml 中修改：
```yaml
server:
  port: 8081  # 改成其他端口
```

## 🚀 部署指南

### Docker 部署

1. **创建 Dockerfile**
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/learn-1.0.0.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

2. **构建镜像**
```bash
mvn clean package
docker build -t agent-app:1.0 .
```

3. **运行容器**
```bash
docker run -p 8080:8080 agent-app:1.0
```

### 生产环境配置

```yaml
spring:
  profiles:
    active: prod

server:
  port: 8080
  compression:
    enabled: true
    mime-types: text/html,text/xml,text/plain,text/css,application/javascript,application/json

logging:
  level:
    root: WARN
    com.arun.agent: INFO
  file:
    name: logs/application.log
```

## 📚 学习资源

- [Spring Boot 官方文档](https://spring.io/projects/spring-boot)
- [Spring AI 文档](https://spring.io/projects/spring-ai)
- [Vue 3 官方文档](https://vuejs.org/)
- [阿里云 DashScope API](https://dashscope.aliyun.com/)

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👤 作者

Created with ❤️ by Arun

---

## 📞 支持

如有问题，请：
1. 查看 issue 列表
2. 查看常见问题
3. 提交新的 issue

---

**最后更新**: 2026-07-16
**版本**: 1.0.0
