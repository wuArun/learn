# 提交前检查清单

## 代码提交检查

- [ ] 代码已在本地测试
- [ ] 遵循代码规范（Java、TypeScript）
- [ ] 添加了必要的注释和文档
- [ ] 单元测试已添加或更新
- [ ] 没有硬编码的密钥或敏感信息
- [ ] 依赖已更新到最新版本
- [ ] 性能影响已评估

## 提交信息规范

遵循 Conventional Commits：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型：
- `feat` - 新功能
- `fix` - Bug 修复
- `docs` - 文档更新
- `style` - 格式改动（不影响代码逻辑）
- `refactor` - 代码重构
- `test` - 测试相关
- `chore` - 构建、依赖更新等

### 示例：

```
feat(agent): 添加天气查询 Agent

- 实现天气数据获取逻辑
- 添加天气 Agent 类型
- 更新前端支持

Closes #123
```

## GitHub Actions 检查

- [ ] CI/CD 流水线通过
- [ ] 单元测试 100% 通过
- [ ] 代码覆盖率 > 80%
- [ ] 没有安全漏洞
- [ ] 代码质量达到标准

## Pull Request 检查

- [ ] PR 标题清晰明了
- [ ] PR 描述完整详细
- [ ] 关联了相关 Issue
- [ ] 添加了标签（feature、bug、docs等）
- [ ] 至少 1 个审核者同意

## 发布前检查

- [ ] 版本号已更新（pom.xml、package.json）
- [ ] CHANGELOG.md 已更新
- [ ] README 已更新
- [ ] 文档已更新
- [ ] 标签已创建（git tag）

## 部署检查

- [ ] 环境配置已准备
- [ ] 数据库迁移已测试
- [ ] 备份已创建
- [ ] 监控告警已配置
- [ ] 回滚计划已制定
