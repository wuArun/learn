# 📚 项目完整文档导航

## 🎯 项目概览

本项目是一个完整的 **Spring AI Alibaba Agent 应用**，包含：
- ✅ Java 17 + Spring Boot 3.3 后端
- ✅ React 18 前端项目结构
- ✅ 多种 Agent 类型支持
- ✅ 完整的 CI/CD 自动化
- ✅ Docker 和 Kubernetes 支持
- ✅ 详细的文档和教程

---

## 📖 文档导航

### 🚀 快速开始（5分钟）
**新手必读！** 最快速的方式启动项目
- 📄 **[QUICK_START.md](./QUICK_START.md)** - 5分钟快速开始指南
  - 启动应用
  - 打开浏览器
  - 快速测试

### 📝 详细文档
**完整的项目文档**
- 📄 **[AGENT_README.md](./AGENT_README.md)** - 项目详细文档
  - 项目结构
  - API 文档
  - 功能特性
  - 配置说明
  - 常见问题

### 🧪 测试指南
**各种测试方法**
- 📄 **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - 本地测试完整指南
  - 脚本测试
  - curl 测试
  - 浏览器测试
  - API 测试工具
  - 性能测试
  - 常见问题排查

### 🚀 部署指南
**多种部署方式**
- 📄 **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - GitHub 自动化部署
  - GitHub Actions CI/CD
  - Docker 部署
  - Kubernetes 部署
  - AWS 部署
  - Heroku 部署
  - 监控和日志

### 📊 测试和部署总结
**快速参考**
- 📄 **[TEST_AND_DEPLOY_SUMMARY.md](./TEST_AND_DEPLOY_SUMMARY.md)** - 8种测试和部署方式总结
  - 7种本地测试方式
  - 8种云平台部署方式
  - 架构对比表格
  - 推荐路径

### ✅ 提交清单
**代码提交规范**
- 📄 **[COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md)** - 提交前检查清单
  - 代码检查项
  - 提交规范
  - GitHub Actions 检查

---

## 🏗️ 项目结构

```
learn/
├── 📁 src/
│   └── main/
│       ├── java/com/arun/agent/
│       │   ├── AgentApplication.java              # Spring Boot 启动类
│       │   ├── controller/AgentController.java    # REST API 接口
│       │   ├── service/AgentService.java          # Agent 业务逻辑
│       │   └── dto/                               # DTO 数据模型
│       └── resources/
│           ├── application.yml                    # 应用配置
│           └── static/index.html                  # Vue3 Web UI
│
├── 📁 frontend/                                   # React 前端项目
│   ├── src/
│   │   ├── components/                           # React 组件
│   │   ├── pages/                                # 页面组件
│   │   ├── services/                             # API 服务
│   │   ├── types/                                # TypeScript 类型
│   │   └── styles/                               # 样式文件
│   ├── package.json                              # 依赖配置
│   └── tsconfig.json                             # TypeScript 配置
│
├── 📁 k8s/
│   ├── deployment.yaml                           # K8s Deployment
│   └── ingress.yaml                              # K8s Ingress
│
├── 📁 .github/workflows/
│   ├── ci-cd.yml                                 # CI/CD 流程
│   └── docs.yml                                  # 文档部署
│
├── pom.xml                                       # Maven 配置
├── Dockerfile                                    # Docker 镜像
├── docker-compose.yml                            # Docker Compose
│
├── AGENT_README.md                               # 详细文档
├── QUICK_START.md                                # 快速开始
├── TESTING_GUIDE.md                              # 测试指南
├── DEPLOYMENT_GUIDE.md                           # 部署指南
├── TEST_AND_DEPLOY_SUMMARY.md                    # 总结
├── COMMIT_CHECKLIST.md                           # 提交清单
└── README.md                                     # 项目简介
```

---

## 🎓 学习路径

### 初学者（0-1小时）
```
1. 阅读 QUICK_START.md (5分钟)
   ↓
2. 本地运行项目 (5分钟)
   ↓
3. 在浏览器中测试 (5分钟)
   ↓
4. 修改一个简单的功能 (10分钟)
```

### 开发者（1-3小时）
```
1. 完整阅读 AGENT_README.md (15分钟)
   ↓
2. 理解项目结构 (10分钟)
   ↓
3. 学习 API 文档 (15分钟)
   ↓
4. 添加一个新的 Agent 类型 (30分钟)
   ↓
5. 编写单元测试 (20分钟)
   ↓
6. 提交代码并触发 CI/CD (10分钟)
```

### 运维人员（2-4小时）
```
1. 学习 DEPLOYMENT_GUIDE.md (30分钟)
   ↓
2. 在本地用 Docker 部署 (15分钟)
   ↓
3. 在本地用 K8s 部署 (30分钟)
   ↓
4. 配置 GitHub Actions (20分钟)
   ↓
5. 设置监控和告警 (30分钟)
```

---

## 🔧 常用命令速查

### 后端开发

```bash
# 启动后端
mvn spring-boot:run

# 运行测试
mvn test

# 打包
mvn clean package

# 查看依赖
mvn dependency:tree
```

### 前端开发

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm start

# 构建
npm run build
```

### Git 工作流

```bash
# 创建分支
git checkout -b feature/my-feature

# 查看状态
git status

# 添加文件
git add -A

# 提交
git commit -m "feat: add feature"

# 推送
git push origin feature/my-feature

# 创建 PR
gh pr create --base main
```

### Docker 操作

```bash
# 构建镜像
docker build -t agent-app:1.0 .

# 运行容器
docker run -p 8080:8080 agent-app:1.0

# 使用 Compose
docker-compose up -d
docker-compose logs -f
docker-compose down
```

### 测试操作

```bash
# 运行完整测试脚本
./test-api.sh

# 手动 API 测试
curl http://localhost:8080/api/agent/health

# 性能测试
ab -n 1000 -c 50 http://localhost:8080/api/agent/health
```

---

## 📊 支持的功能

### Agent 类型

| Agent | 图标 | 说明 | 使用示例 |
|------|------|------|---------|
| **通用对话** | 💬 | 智能聊天助手 | "你好" / "讲个笑话" |
| **计算器** | 🧮 | 数学表达式计算 | "2+3*4" |
| **知识库** | 📚 | 技术知识问答 | "什么是Spring?" |
| **天气查询** | 🌤️ | 天气信息查询 | "今天天气怎么样?" |

### API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| **POST** | `/api/agent/chat` | 发送聊天消息 |
| **GET** | `/api/agent/types` | 获取 Agent 类型 |
| **GET** | `/api/agent/history/{id}` | 获取对话历史 |
| **DELETE** | `/api/agent/history/{id}` | 清空对话历史 |
| **GET** | `/api/agent/health` | 健康检查 |

---

## 🐛 常见问题快速查找

| 问题 | 答案位置 | 解决方案 |
|------|---------|---------|
| 无法启动应用 | QUICK_START.md | 检查 Java 版本和 Maven |
| API 测试失败 | TESTING_GUIDE.md | 确保服务已启动 |
| Docker 构建失败 | DEPLOYMENT_GUIDE.md | 检查 Dockerfile 和依赖 |
| K8s 部署问题 | DEPLOYMENT_GUIDE.md | 检查 Secret 和 ConfigMap |
| 性能问题 | TESTING_GUIDE.md | 运行性能测试并分析 |

---

## 🚀 下一步

### 立即开始
1. 👉 阅读 [QUICK_START.md](./QUICK_START.md)
2. 👉 启动应用：`mvn spring-boot:run`
3. 👉 访问：http://localhost:8080

### 深入学习
1. 👉 完整阅读 [AGENT_README.md](./AGENT_README.md)
2. 👉 学习 [TESTING_GUIDE.md](./TESTING_GUIDE.md)
3. 👉 理解 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### 贡献代码
1. 👉 创建特性分支：`git checkout -b feature/my-feature`
2. 👉 参考 [COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md)
3. 👉 提交 Pull Request

---

## 📞 获取帮助

### 查找答案
1. 📖 查看相应的详细文档
2. 🧪 运行测试脚本
3. 🐛 检查日志输出

### 提交问题
1. 🐱 [GitHub Issues](https://github.com/wuArun/learn/issues)
2. 💬 讨论和建议

### 查看状态
1. ✅ [GitHub Actions](https://github.com/wuArun/learn/actions)
2. 📊 [Code Coverage](https://sonarcloud.io/)
3. 🐳 [Docker Images](https://ghcr.io/wuArun/learn)

---

## 📈 项目统计

```
💻 代码行数    1000+
📝 文档数     10+
🧪 测试方式   7+
🚀 部署方式   8+
📦 依赖数     50+
⭐ 代码质量   A
```

---

## 🎉 项目亮点

✨ **完整的企业级应用**
- Spring Boot 3.3 + Spring AI
- 现代化前端（Vue3/React）
- 完整的 CI/CD 流程
- Kubernetes 生产支持

📚 **详细的文档**
- 10+ 文档文件
- 代码示例完整
- 快速参考和详细指南
- 多个学习路径

🚀 **多种部署方式**
- 本地 JAR
- Docker
- Kubernetes
- 云平台（AWS、Heroku 等）

✅ **完善的测试和检查**
- 自动化 CI/CD
- 代码质量检查
- 安全扫描
- 覆盖率报告

---

## 📄 许可证

MIT License - 详见 LICENSE 文件

---

**最后更新**: 2026-07-16  
**维护者**: Arun  
**版本**: 1.0.0

---

**立即开始？** 👉 [QUICK_START.md](./QUICK_START.md)
