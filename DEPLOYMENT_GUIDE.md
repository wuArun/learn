# GitHub 自动化部署指南

## 📋 概述

本项目配置了完整的 CI/CD 流水线，支持以下自动化流程：

- ✅ **自动编译和测试** - 推送时自动运行
- ✅ **Docker 镜像构建** - 构建并推送到 GitHub Container Registry
- ✅ **代码质量检查** - SonarQube 集成
- ✅ **安全扫描** - Trivy 漏洞扫描
- ✅ **文档部署** - 自动部署到 GitHub Pages
- ✅ **Release 发布** - 标签推送时自动创建发布

## 🔐 环境配置

### 步骤 1：配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets：

#### 基础配置（必需）

```
Settings → Secrets and variables → Actions
```

| 秘钥名称 | 说明 | 获取方式 |
|---------|------|---------|
| `GITHUB_TOKEN` | GitHub 自动生成 | 自动提供 |
| `SONAR_TOKEN` | SonarQube 令牌 | [SonarCloud](https://sonarcloud.io/) |
| `DOCKER_USERNAME` | Docker Hub 用户名 | Docker Hub 账户 |
| `DOCKER_PASSWORD` | Docker Hub 密码 | Docker Hub 令牌 |

#### 部署配置（可选）

```
DEPLOY_HOST         # 部署服务器地址
DEPLOY_USER         # SSH 用户名
DEPLOY_KEY          # SSH 私钥
DASHSCOPE_API_KEY   # 阿里云 DashScope API Key
```

### 步骤 2：启用 GitHub Pages

1. 进入 Settings → Pages
2. Source 选择 `Deploy from a branch`
3. Branch 选择 `gh-pages`（自动创建）
4. 保存

## 🚀 部署流程

### 流程 1：开发分支推送（自动测试）

```bash
# 创建特性分支
git checkout -b feature/my-feature

# 提交代码
git commit -m "feat: add new feature"

# 推送
git push origin feature/my-feature
```

**自动触发的工作流：**
- ✅ 后端构建和测试
- ✅ 前端构建
- ✅ 代码质量检查
- ✅ 安全扫描

**查看结果：** GitHub → Actions 标签页

### 流程 2：合并到 main（构建 Docker 镜像）

```bash
# 创建 Pull Request
gh pr create --base main

# 通过 PR 审查后合并
git checkout main
git pull origin main
```

**自动触发的工作流：**
- ✅ 所有测试（同 Flow 1）
- ✅ Docker 镜像构建和推送
- ✅ 文档部署到 GitHub Pages

**构建的 Docker 镜像：**
```
ghcr.io/wuArun/learn:main
ghcr.io/wuArun/learn:latest
```

### 流程 3：发布版本（创建 Release）

```bash
# 创建标签
git tag -a v1.0.0 -m "Release v1.0.0"

# 推送标签
git push origin v1.0.0
```

**自动触发的工作流：**
- ✅ 所有测试和构建
- ✅ 自动创建 GitHub Release
- ✅ 上传构建制品

## 📦 Docker 镜像部署

### 拉取镜像

```bash
# 使用 GitHub Token 登录
echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u USERNAME --password-stdin

# 拉取镜像
docker pull ghcr.io/wuArun/learn:latest

# 运行容器
docker run -p 8080:8080 ghcr.io/wuArun/learn:latest
```

### 使用 Docker Compose

```yaml
version: '3.8'
services:
  agent-app:
    image: ghcr.io/wuArun/learn:latest
    ports:
      - "8080:8080"
    environment:
      - DASHSCOPE_API_KEY=${DASHSCOPE_API_KEY}
    restart: unless-stopped
```

## ☁️ 云平台部署

### 部署到 Heroku

```bash
# 1. 安装 Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# 2. 登录
heroku login

# 3. 创建应用
heroku create my-agent-app

# 4. 设置环境变量
heroku config:set DASHSCOPE_API_KEY=your-key

# 5. 部署
git push heroku main
```

### 部署到 Kubernetes

```bash
# 1. 创建命名空间
kubectl create namespace agent-app

# 2. 创建 ConfigMap
kubectl create configmap agent-config \
  --from-literal=DASHSCOPE_API_KEY=your-key \
  -n agent-app

# 3. 部署
kubectl apply -f k8s/deployment.yaml -n agent-app

# 4. 暴露服务
kubectl expose deployment agent-app \
  --type=LoadBalancer --port=8080 \
  -n agent-app
```

**Kubernetes 部署文件示例：**

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agent-app
  namespace: agent-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: agent-app
  template:
    metadata:
      labels:
        app: agent-app
    spec:
      containers:
      - name: agent-app
        image: ghcr.io/wuArun/learn:latest
        ports:
        - containerPort: 8080
        env:
        - name: DASHSCOPE_API_KEY
          valueFrom:
            configMapKeyRef:
              name: agent-config
              key: DASHSCOPE_API_KEY
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/agent/health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/agent/health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
```

### 部署到 AWS

```bash
# 使用 ECS
aws ecs create-service \
  --cluster agent-cluster \
  --service-name agent-service \
  --task-definition agent-app:1 \
  --desired-count 2

# 使用 Lambda（需要改造为无状态）
sam deploy --guided
```

## 📊 监控和日志

### GitHub Actions 日志

1. 进入仓库 → Actions 标签页
2. 选择工作流运行
3. 点击具体的任务查看日志

### 运行时日志

```bash
# Docker 容器日志
docker logs <container-id>

# Kubernetes 日志
kubectl logs <pod-name> -n agent-app

# 应用日志文件
tail -f logs/application.log
```

## 🐛 故障排除

### 问题 1：Docker 构建失败

```bash
# 检查 Dockerfile
docker build -t agent-app:test .

# 查看详细错误
docker build --no-cache -t agent-app:test .
```

### 问题 2：测试失败

1. 检查 Actions 日志
2. 本地运行相同命令：`mvn clean test`
3. 提交修复并重新推送

### 问题 3：部署失败

1. 检查环境变量配置
2. 验证 GitHub Token 权限
3. 检查容器资源限制

## 📈 CI/CD 工作流状态

在 README 中添加状态徽章：

```markdown
# Spring AI Alibaba Agent

[![CI/CD Pipeline](https://github.com/wuArun/learn/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/wuArun/learn/actions)
[![Docker Image](https://github.com/wuArun/learn/actions/workflows/docker.yml/badge.svg)](https://github.com/wuArun/learn/packages)
[![Documentation](https://github.com/wuArun/learn/actions/workflows/docs.yml/badge.svg)](https://wuarun.github.io/learn)
```

## 📚 最佳实践

### 1. 分支管理

```
main          → 生产环境
  ├── develop   → 测试环境
  └── feature/* → 功能开发
```

### 2. 提交规范

```bash
# 使用 Conventional Commits
git commit -m "feat: add agent feature"
git commit -m "fix: fix bug in agent"
git commit -m "docs: update readme"
git commit -m "test: add test cases"
```

### 3. Pull Request 模板

```markdown
## 描述
简要描述改动内容

## 相关 Issue
修复 #123

## 改动类型
- [ ] 功能新增
- [ ] Bug 修复
- [ ] 文档更新
- [ ] 代码重构

## 测试
描述如何测试改动

## 清单
- [ ] 代码已自测
- [ ] 注释已添加
- [ ] 文档已更新
```

### 4. 版本管理

使用 Semantic Versioning：
```
v1.2.3
│ │ └─ Patch (Bug fix)
│ └─── Minor (New feature)
└───── Major (Breaking change)
```

## 🔗 相关链接

- [GitHub Actions 文档](https://docs.github.com/actions)
- [GitHub Container Registry](https://docs.github.com/packages/guides/about-github-container-registry)
- [Docker Hub](https://hub.docker.com/)
- [SonarCloud](https://sonarcloud.io/)
- [Trivy 扫描器](https://github.com/aquasecurity/trivy)

## 📞 支持

如有问题：
1. 查看 Actions 日志
2. 查看本部署指南
3. 提交 Issue

---

**最后更新**: 2026-07-16
