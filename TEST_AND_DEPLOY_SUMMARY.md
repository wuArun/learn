# 🧪 完整的测试和部署指南总结

## 📊 可用的测试方式

### 1️⃣ **本地快速测试**（5分钟）

**启动后端：**
```bash
cd /workspaces/learn
mvn spring-boot:run
```

**在另一个终端运行测试脚本：**
```bash
chmod +x test-api.sh
./test-api.sh
```

**或使用浏览器访问：**
```
http://localhost:8080
```

---

### 2️⃣ **单元测试**

```bash
# 运行所有测试
mvn test

# 运行指定测试
mvn test -Dtest=AgentServiceTest

# 生成覆盖率报告
mvn clean test jacoco:report
```

生成的报告位置：
```
target/site/jacoco/index.html
```

---

### 3️⃣ **集成测试**

```bash
# 运行集成测试
mvn verify

# 运行特定集成测试
mvn verify -Dtest=AgentIntegrationTest
```

---

### 4️⃣ **API 测试工具**

#### 使用 Postman

1. 导入集合：[postman-collection.json](./postman-collection.json)
2. 设置环境变量
3. 运行测试脚本

#### 使用 REST Client (VS Code)

创建 `requests.http` 文件：

```http
@baseUrl = http://localhost:8080/api/agent

### 健康检查
GET {{baseUrl}}/health

### 发送消息
POST {{baseUrl}}/chat
Content-Type: application/json

{
  "message": "你好",
  "agentType": "general"
}
```

#### 使用 curl

```bash
# 获取 Agent 类型
curl http://localhost:8080/api/agent/types

# 发送消息
curl -X POST http://localhost:8080/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"测试","agentType":"general"}'
```

---

### 5️⃣ **性能测试**

```bash
# 使用 Apache Bench
ab -n 1000 -c 50 http://localhost:8080/api/agent/health

# 使用 wrk
wrk -t4 -c100 -d30s http://localhost:8080/api/agent/health

# 使用 JMeter
jmeter -n -t test-plan.jmx -l results.jtl -j jmeter.log
```

---

### 6️⃣ **Docker 容器测试**

```bash
# 构建镜像
docker build -t agent-app:local .

# 运行容器
docker run -p 8080:8080 agent-app:local

# 测试容器
curl http://localhost:8080/api/agent/health
```

---

### 7️⃣ **GitHub Actions 自动测试**

提交代码时自动触发：

```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature
```

**查看测试结果：**
- GitHub → Actions 标签页
- 点击对应的工作流运行

---

## 🚀 可用的部署方式

### 方式 1：**本地 JAR 部署**（最简单）

```bash
# 编译
mvn clean package

# 运行
java -jar target/learn-1.0.0.jar

# 或使用脚本
./start.sh        # Linux/Mac
start.bat         # Windows
```

**访问：** `http://localhost:8080`

---

### 方式 2：**Docker 部署**

#### 单容器部署：

```bash
# 构建镜像
docker build -t agent-app:1.0 .

# 运行容器
docker run -p 8080:8080 \
  -e DASHSCOPE_API_KEY=your-key \
  agent-app:1.0
```

#### Docker Compose 部署：

```bash
# 启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

---

### 方式 3：**Kubernetes 部署**（企业级）

```bash
# 1. 替换 API Key
sed -i 's/your-api-key-here/YOUR_ACTUAL_KEY/g' k8s/deployment.yaml

# 2. 部署
kubectl apply -f k8s/deployment.yaml

# 3. 检查状态
kubectl get pods -n agent-app
kubectl logs -n agent-app -l app=agent-app

# 4. 获取访问地址
kubectl get svc -n agent-app
```

---

### 方式 4：**GitHub Container Registry 部署**

```bash
# 1. 登录
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# 2. 拉取镜像
docker pull ghcr.io/wuArun/learn:latest

# 3. 运行
docker run -p 8080:8080 ghcr.io/wuArun/learn:latest
```

---

### 方式 5：**Heroku 部署**

```bash
# 1. 登录
heroku login

# 2. 创建应用
heroku create my-agent-app

# 3. 设置环境变量
heroku config:set DASHSCOPE_API_KEY=your-key

# 4. 部署
git push heroku main

# 5. 查看日志
heroku logs --tail
```

---

### 方式 6：**AWS 部署**

#### 使用 ECS：

```bash
# 创建任务定义
aws ecs register-task-definition --cli-input-json file://task-definition.json

# 创建服务
aws ecs create-service \
  --cluster agent-cluster \
  --service-name agent-service \
  --task-definition agent-app:1 \
  --desired-count 2
```

#### 使用 Lambda（无服务器）：

```bash
# 需要改造为无状态应用
sam deploy --guided
```

---

### 方式 7：**GitHub Actions 自动部署**

推送到 main 分支时自动：
- ✅ 构建 Docker 镜像
- ✅ 推送到 GitHub Container Registry
- ✅ 部署到指定服务器（可选）

---

### 方式 8：**云函数部署**（按需付费）

#### 阿里云函数计算：

```bash
# 创建函数
fun deploy -t template.yaml

# 调用函数
fun local invoke myFunction
```

#### 腾讯云 SCF：

```bash
# 部署
scf deploy --name agent-app

# 测试
scf invoke --name agent-app
```

---

## 📈 部署架构对比

| 部署方式 | 复杂度 | 成本 | 可靠性 | 扩展性 | 适用场景 |
|---------|------|------|--------|--------|---------|
| JAR 本地 | ⭐ | 极低 | ⭐⭐ | ⭐ | 开发/测试 |
| Docker | ⭐⭐ | 低 | ⭐⭐⭐ | ⭐⭐ | 生产单机 |
| Docker Compose | ⭐⭐ | 低 | ⭐⭐⭐ | ⭐⭐ | 多容器 |
| Kubernetes | ⭐⭐⭐⭐ | 中等 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 企业级 |
| Heroku | ⭐ | 中等 | ⭐⭐⭐ | ⭐⭐⭐ | 快速上线 |
| AWS ECS | ⭐⭐⭐ | 中等 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | AWS 用户 |
| Lambda | ⭐⭐ | 按需付费 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 低流量 |

---

## 🔄 完整的 CI/CD 流程

```
推送代码
  ↓
GitHub Actions 触发
  ├─ 编译测试 (Maven)
  ├─ 前端构建 (Node.js)
  ├─ 代码质量检查 (SonarCloud)
  ├─ 安全扫描 (Trivy)
  ├─ Docker 镜像构建
  └─ 推送到 GHCR
  ↓
Pull Request 审查
  ↓
合并到 main
  ↓
自动部署
  ├─ 更新 Docker 镜像
  ├─ 部署到指定环境
  └─ 运行烟雾测试
  ↓
发布 Release（标签推送时）
  ├─ 创建 GitHub Release
  └─ 上传制品
```

---

## 📋 测试和部署检查清单

### 提交前

- [ ] 本地测试通过：`./test-api.sh`
- [ ] 单元测试通过：`mvn test`
- [ ] 没有编译错误：`mvn clean compile`
- [ ] Docker 镜像构建成功：`docker build -t test .`

### Pull Request

- [ ] GitHub Actions 通过
- [ ] 代码覆盖率 > 80%
- [ ] 没有安全漏洞
- [ ] PR 描述完整

### 发布前

- [ ] 在暂存环境测试
- [ ] 更新版本号
- [ ] 更新 CHANGELOG
- [ ] 创建 Release Notes

### 部署后

- [ ] 健康检查通过
- [ ] 监控告警正常
- [ ] 日志无错误
- [ ] 功能测试通过

---

## 🔗 快速链接

| 资源 | 链接 |
|------|------|
| 📖 快速开始 | [QUICK_START.md](./QUICK_START.md) |
| 📚 详细文档 | [AGENT_README.md](./AGENT_README.md) |
| 🧪 测试指南 | [TESTING_GUIDE.md](./TESTING_GUIDE.md) |
| 🚀 部署指南 | [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) |
| ✅ 提交清单 | [COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md) |
| 🐳 Docker 镜像 | [ghcr.io/wuArun/learn](https://ghcr.io/wuArun/learn) |
| 📊 GitHub Actions | [Actions](https://github.com/wuArun/learn/actions) |

---

## 🎯 推荐路径

### 初学者：
1. 本地 JAR 部署 → 浏览器访问测试
2. 运行测试脚本验证 API
3. 查看日志理解流程

### 开发者：
1. Docker Compose 本地开发
2. GitHub Actions 自动测试
3. Push 到 GitHub 自动部署

### 运维人员：
1. Kubernetes 生产部署
2. 监控和告警配置
3. 自动扩展和恢复

---

**最后更新**: 2026-07-16

有问题？查看对应的详细文档或提交 Issue！🚀
