---
title: prd-to-commit 技能总览
metadata:
  department: CATLND-BP&IT-DEVC2
  author: wurx02
  version: 6.0.0
  generated: 2026-07-16
---

# prd-to-commit 技能总览

> 本文档统一总结 `prd-to-commit` 主技能及其 8 个子技能，保持结构与口径一致，便于查阅与维护。

---

## 一、整体架构

### 1.1 流水线概览

`prd-to-commit` 是 **产品需求文档(PRD)到代码提交的端到端 8 步流水线**，按顺序串行执行，每步必须用户确认才能进入下一步。

```
┌──────────────────────────────────────────────────────────────────────┐
│                    prd-to-commit 8 步流水线                          │
└──────────────────────────────────────────────────────────────────────┘
        │
        ▼
Step 0  state-init          状态初始化（创建/恢复状态文件）
        │
        ▼
Step 1  prd-to-wbs          需求分析 → 输出 WBS
        │
        ▼
Step 2  wbs-to-trd          技术设计 → 输出 TRD
        │
        ▼
Step 3  ui-test              测试用例生成 → 输出 Case（JSON+Excel）
        │
        ▼
Step 4  add-to-future        代码生成与启动（前端调用 rosefinch-front-skills）
        │                   ┌──────────────────────┐
        │                   │ rosefinch-front-skills│ 前端 DICC 组件
        │                   └──────────────────────┘
        ▼
Step 5  ui-test              自动化测试（Playwright）
        │   ├─ PASS → 继续
        │   └─ FAIL → 回到 Step 4
        ▼
Step 6  code-review-expert   代码评审
        │   ├─ PASS → 继续
        │   └─ FAIL → 回到 Step 4
        ▼
Step 7  git commit           代码提交
```

### 1.2 子技能清单

| # | 子技能 | 流水线位置 | 作用 | 版本 |
|---|--------|----------|------|------|
| 1 | `prd-to-wbs` | Step 1 | PRD 分析，输出结构化需求列表(WBS) | 1.0.0 |
| 2 | `wbs-to-trd` | Step 2 | 基于 WBS 生成技术设计文档(TRD) | 1.0.0 |
| 3 | `ui-test` | Step 3 / Step 5 | 测试用例生成 + Playwright 自动化测试 | 1.1.0 |
| 4 | `add-to-future` | Step 4 | 需求转代码（后端 Java + 前端 React + DDL） | 1.0.0 |
| 5 | `rosefinch-front-skills` | Step 4 子调用 | 朱雀前端 DICC 组件规范与生成 | 1.0.0 |
| 6 | `code-review-expert` | Step 6 | 6 后端维度 + 6 前端子维度全面评审 | 2.0.0 |
| 7 | `code-to-prd` | prd-to-wbs 内部调用 | 代码反推 PRD（用于无历史 PRD 时生成） | 1.0.0 |
| 8 | `refresh-prd` | 独立工具 | 基于代码变更刷新 PRD 文档 | 1.0.0 |

### 1.3 子技能依赖关系

```
prd-to-commit (主)
 ├── prd-to-wbs ────► code-to-prd （无历史 PRD 时调用）
 ├── wbs-to-trd
 ├── ui-test
 ├── add-to-future ──► rosefinch-front-skills （前端代码生成时强制调用）
 ├── code-review-expert
 └── refresh-prd （独立工具，与 code-to-prd 互为补充）
```

---

## 二、主技能：prd-to-commit

| 属性 | 值 |
|------|-----|
| 名称 | prd-to-commit |
| 版本 | 6.0.0 |
| 作者 | wurx02 |
| 部门 | CATLND-BP&IT-DEVC2 |
| 触发关键词 | "prd输出代码"、"prd转代码"、"PRD转代码"、"prd to code" |

### 2.1 核心原则（最重要·无例外）

1. **用户确认**：每步完成后必须等待用户明确确认才能进入下一步，不确认 = 不继续
2. **状态文件**：每个会话生成唯一状态文件 `.sisyphus/prd-to-commit-state-{MODULE_NAME}.json`
3. **currentStep 初始化为 0**：首次初始化必须为 0，恢复时从文件读取
4. **严格步骤顺序**：0→1→2→3→4→5→6→7 严格递增，禁止跳步
5. **循环修正**：Step 5 失败或 Step 6 不通过 → 回到 Step 4
6. **质量保证**：每步都有校验环节
7. **文档对齐**：WBS、TRD、Case 三者必须保持一致
8. **恢复计划文件**：每次 Step 0 写入 `.sisyphus/plans/prd-to-commit-restart-{MODULE_NAME}.md`

### 2.2 流水线进度监控（Playwright）

- 监控页面：`.opencode/skills/prd-to-commit/pipeline-monitor.html`
- 每步确认环节必须使用 Playwright 打开/刷新监控页面
- 截取当前进度截图展示给用户

### 2.3 状态文件格式

```json
{
  "pipeline": "prd-to-commit",
  "sessionId": "<会话ID>",
  "module": "<模块名>",
  "currentStep": 0,
  "restartPlan": ".sisyphus/plans/prd-to-commit-restart-<模块名>.md",
  "steps": [
    { "step": 0, "name": "流水线状态初始化 (state-init)", "status": "confirmed", "outputFile": null },
    { "step": 1, "name": "需求分析 (prd-to-wbs)", "status": "blocked", "outputFile": null }
    // ... 其余步骤
  ]
}
```

**状态值含义**：
- `pending_confirmation` — 等待用户确认
- `confirmed` — 已确认，可进入下一步
- `blocked` — 前置步骤未确认
- `completed_without_confirmation` — 异常状态，需补确认

### 2.4 各步骤输出物

| 步骤 | 名称 | 子技能 | 输出物 |
|------|------|--------|--------|
| Step 0 | 状态初始化 | state-init | `.sisyphus/prd-to-commit-state-{MODULE}.json` |
| Step 1 | 需求分析 | prd-to-wbs | `docs/wbs/[模块]-需求列表.md` |
| Step 2 | 技术设计 | wbs-to-trd | `docs/change/TRD/TRD_[系统]_v[版本].md` |
| Step 3 | 测试用例 | ui-test | `tests/modules/[模块]/cases/*.json` + `.xlsx` |
| Step 4 | 代码生成 | add-to-future | 后端代码 + 前端代码 + DDL 脚本 |
| Step 5 | 自动化测试 | ui-test | 测试报告 HTML + Markdown + 截图 |
| Step 6 | 代码评审 | code-review-expert | `docs/review/02-[模块]-评审报告.md` |
| Step 7 | 代码提交 | git commit | Git commit |

### 2.5 重要约束

1. `currentStep` 初始化为 0，每次运行前必须重置
2. 严格 0→7 顺序执行，禁止跳步
3. 状态文件驱动，唯一真相来源
4. 确认优先，不确认 = 不继续
5. 表名真实性：必须提取真实 `@TableName`，禁止推断
6. Rosefinch 组件识别并重点标注，禁止虚构
7. 代码符合阿里 JAVA 开发规范
8. WBS-TRD-Case 三方对齐
9. Step 5/6 不通过必须循环回 Step 4

---

## 三、子技能：prd-to-wbs（Step 1 需求分析）

| 属性 | 值 |
|------|-----|
| 名称 | prd-to-wbs |
| 版本 | 1.0.0 |
| 作者 | wurx02 |
| 流水线位置 | Step 1 |
| 依赖 | code-to-prd（无历史 PRD 时调用） |
| 输入 | `docs/prd/` 下的 PRD 文档 |
| 输出 | `docs/wbs/[模块]-需求列表.md` |

### 3.1 作用

智能 PRD 文档分析工作流，自动检测历史 PRD 并对比，支持 Markdown 和 Word 格式。提取核心需求并分解为功能模块，对比多个 PRD 文档找出差异。

### 3.2 三种场景处理

- **场景 A 有历史 PRD**：直接建立索引，进入三方对比（历史 + 代码 + 新 PRD）
- **场景 B 无历史 PRD 但有代码**：询问用户是否调用 `code-to-prd` 自动生成历史 PRD
  - 用户同意 → 调用 code-to-prd 生成 → 重新索引
  - 用户拒绝 → 仅分析新 PRD
- **场景 C 无历史 PRD 且无代码**：告知用户，询问是否仅分析新 PRD

### 3.3 工作流程

1. 理解任务并获取输入（支持 .pptx/.docx/.xlsx/.md/.txt）
2. 加载现有文档索引（`scripts/index_docs.py`）
3. 分析 PRD，提取需求（`scripts/extract_requirements.py`）
4. 处理模块归属（`scripts/match_module.py`，相似度匹配，一次性询问待定项）
5. 生成需求列表到 `docs/wbs/`（`scripts/generate_doc.py`）
6. （可选）输出格式转换 Word（`scripts/md_to_docx.py`）

### 3.4 输出规范

- 路径：`docs/wbs/[模块名]-需求列表.md`
- 内容：新增需求表格、变更/冲突需求表格、待办/备注
- 需求 ID 格式：`[模块缩写]-REQ-[三位数字]`

### 3.5 辅助脚本

| 脚本 | 功能 |
|------|------|
| `read_prd_file.py` | 读取各种格式 PRD 文件 |
| `index_docs.py` | 扫描文档目录建立模块索引 |
| `extract_requirements.py` | NLP 提取需求 |
| `match_module.py` | 匹配需求到模块 |
| `generate_doc.py` | 生成需求文档 |
| `md_to_docx.py` | Markdown 转 Word |

---

## 四、子技能：wbs-to-trd（Step 2 技术设计）

| 属性 | 值 |
|------|-----|
| 名称 | wbs-to-trd |
| 版本 | 1.0.0 |
| 作者 | wurx02 |
| 流水线位置 | Step 2 |
| 依赖 | prd-to-wbs（上游） |
| 输入 | `docs/wbs/` 下的 WBS 文档 |
| 输出 | `docs/change/TRD/TRD_[系统]_v[版本].md` |

### 4.1 作用

基于结构化的 WBS 需求列表，结合项目现有代码和技术栈，生成完整的技术设计文档（TRD）。

### 4.2 TRD 必含章节

1. 文档信息（版本、日期、作者、WBS/PRD 链接）
2. 技术选型（后端、前端、中间件、Rosefinch 组件【重点】）
3. 架构设计（系统架构图、分层架构、模块划分、部署架构）
4. 数据集成图（系统间数据流图）
5. 数据模型（概念模型 ER 图、逻辑模型、物理模型、数据字典）
6. 前后端交互时序图
7. 接口定义（接口清单、详细定义、流程图）
8. 异常处理方案（分类、错误码、降级熔断）
9. 影响范围评估（系统影响、依赖变更、回滚方案）
10. WBS 需求覆盖度报告（附录）

### 4.3 图表规范

所有架构图、时序图、流程图、ER 图必须使用 **ASCII 艺术字符** 绘制。

### 4.4 WBS 覆盖度校验（必须执行）

逐条对比 WBS 与 TRD，标记覆盖状态：
- ✅ 已覆盖
- ⚠️ 部分覆盖
- ❌ 未覆盖

必须补充完善 TRD 直到所有需求 100% 已覆盖。

### 4.5 重要约束

- 表名必须使用真实 `@TableName` 注解值，禁止推断
- 审计字段必须包含 BaseEntity 规范的 5 个字段
- 主键使用雪花算法（`IdType.ASSIGN_ID`），禁止自增
- 入参出参禁止 `Map<String, Object>`，必须使用具体 DTO
- 复杂对象必须使用 `@RequestBody` 接收
- DTO 命名：`XxxRequestDTO`/`XxxResultDTO` 或 `XxxReqVo`/`XxxRespVo`

### 4.6 质量标准

完整性、一致性、可行性、可扩展性、安全性、可追溯性、真实性。

---

## 五、子技能：ui-test（Step 3 + Step 5 测试）

| 属性 | 值 |
|------|-----|
| 名称 | ui-test |
| 版本 | 1.1.0 |
| 作者 | wangyf31 |
| 流水线位置 | Step 3（用例生成）+ Step 5（自动化测试） |
| 输入（Step 3） | TRD + WBS + 前后端代码 |
| 输入（Step 5） | Step 3 生成的测试用例 |
| 输出（Step 3） | `tests/modules/[模块]/cases/*.json` + `.xlsx` |
| 输出（Step 5） | 测试报告 HTML + Markdown + 截图 |

### 5.1 作用

管理 Playwright 测试脚本的智能助手，支持脚本生成、修改、执行和报告生成，自动捕获 API 请求/响应。

### 5.2 强制要求

#### 5.2.1 环境检查（不可跳过）

- 检查 `node_modules` 是否存在，不存在则 `npm install`
- 检查 Playwright 浏览器是否安装，未安装则 `npx playwright install --with-deps chromium`
- 自动检查：`node utils/env-checker.js --install`

#### 5.2.2 前置扫描（必须执行）

1. PRD 文档扫描（`docs/prd/`）
2. 后端代码扫描（Controller/Service/VO）
3. 前端代码扫描（页面组件、DOM 结构、交互逻辑）
4. **读取公共配置**（强制）：`config/test-config.json`
   - 测试环境 URL、API 地址、登录凭据、选择器、超时
   - 绝对禁止硬编码 URL/用户名/密码/选择器

#### 5.2.3 用户确认环节（不可跳过）

生成测试用例后必须暂停，向用户展示用例摘要并询问确认，**绝对不能在用户未确认的情况下自动执行测试**。

### 5.3 测试用例规范

#### 双格式存储

| 格式 | 路径 | 用途 |
|------|------|------|
| Excel | `tests/modules/模块/cases/模块-测试用例.xlsx` | 人工审阅 |
| JSON | `tests/modules/模块/cases/*.json` | Playwright 执行 |

#### Excel 表头（17 列）

用例编号、测试模块、测试子项、优先级（P0/P1/P2）、测试维度（功能/兼容/性能/安全）、测试方向（正向/反向/边界）、前置条件、测试步骤（pipe 格式）、API 端点、依赖用例、输入数据、预期结果、实际结果、测试结论、版本、作者、状态。

#### 测试步骤 pipe 格式

`序号|action|target|selector|value|expected`

action 类型：navigate、click、input、select、clear、verify、waitForDownload、verifyFile、uploadFile、waitFor

#### 用例设计维度

| 维度 | dimension | 说明 |
|------|-----------|------|
| 功能 | functional | 核心业务逻辑 |
| 兼容 | compatibility | 不同环境/数据 |
| 性能 | performance | 响应时间、资源占用 |
| 安全 | security | 权限、注入、越权 |

每个功能模块至少覆盖：正向（每个核心操作 1 个）、反向（每个核心操作 1-2 个）、边界（关键字段 1 个）。

#### 用例 ID 命名

`TC-{模块缩写3-4字母}-{3位序号}`，如 `TC-SCP-001`

### 5.4 API 监听与记录

通过 `utils/api-logger.js` 自动捕获页面所有 API 请求/响应，记录方法、URL、请求体、响应状态，生成 API 调用统计报告。

### 5.5 目录结构

```
tests/modules/功能模块/
├── cases/           # 测试用例 *.json + *.xlsx
├── scripts/         # Playwright 脚本 *.spec.js
└── docs/
    ├── report/      # 测试报告 *.html, *.md
    ├── screenshots/ # 截图 *.png
    └── downloads/   # 下载文件 *.xlsx, *.pdf
```

### 5.6 报告命名

- HTML：`[模块]测试报告[时间].html`
- Markdown：`[模块]测试报告[时间].md`
- 截图：`[序号]-[描述].png`

### 5.7 报告内容

1. 测试概览（模块、PRD、生成时间、通过率）
2. 测试统计（总数、通过、失败、警告）
3. API 调用记录（详细记录 + 统计）
4. API 校验结果
5. 文件下载校验
6. UI 校验结果
7. 测试截图

---

## 六、子技能：add-to-future（Step 4 代码生成）

| 属性 | 值 |
|------|-----|
| 名称 | add-to-future |
| 版本 | 1.0.0 |
| 作者 | wurx02 |
| 流水线位置 | Step 4 |
| 依赖 | rosefinch-front-skills（前端代码生成强制调用） |
| 输入 | `docs/wbs/` + `docs/change/TRD/` + `tests/modules/.../cases/` |
| 输出 | 后端代码 + 前端代码 + DDL 脚本 |

### 6.1 作用

资深全栈开发工程师角色，将 PRD/WBS 转化为优雅、可维护、高性能的代码。工作流程分三阶段：需求澄清与分析 → 技术方案设计 → 代码实现与交付。

### 6.2 核心原则

1. 需求驱动，不做过度的设计
2. 可读性优先，关键逻辑有注释
3. 健壮性，考虑边界和错误处理
4. 技术选型适配（默认 JAVA 17+SpringBoot+mybatisPlus+flowable 7.1.0，React+TypeScript）
5. 优先使用 Rosefinch 功能
6. **【强制】前端代码必须使用 rosefinch-front-skills 子技能生成**

### 6.3 Rosefinch 使用规范

**优先顺序**：
1. 第一优先级：`com.catl.rosefinch` 包下的现有功能
2. 第二优先级：Spring 生态标准方案
3. 最后选择：自行实现或第三方库

**常用 Rosefinch 功能**：
- 响应封装：`com.catl.rosefinch.core.common.base.Results`
- 安全上下文：`com.catl.rosefinch.core.oauth.SecurityContextHelper`
- 操作审计：`com.catl.rosefinch.monitor.op.annotation.OperatorAudit`
- 消息通知：`com.catl.rosefinch.message.MessageClient`
- 值集工具：`com.catl.rosefinch.core.lov.LovUtil`
- 缓存管理：`com.catl.rosefinch.core.app.AppCache`
- Excel 处理：`com.catl.rosefinch.excel.config.ExcelFactory`

**禁止虚构**：`RosefinchWorkflowService`、`RosefinchFileService`、`@RosefinchPermission` 等不存在的服务类/注解。

### 6.4 后端技术栈

- Java 17 + Spring Boot 3.x + Maven（多模块）
- Rosefinch 0.3.1.2.GA（CATL 内部框架）
- OceanBase + MyBatis Plus 3.5.5 + Dynamic Datasource
- Flowable 7.1.0（工作流）
- Spring Cloud Alibaba + Nacos
- Checkstyle 3.3.1 + Lombok + MapStruct

### 6.5 DDD 分层架构

```
catl-api        → REST API 层（Controller）
catl-app        → 应用服务层（Service）
catl-domain     → 领域层（Entity/VO/Enum）
catl-infra-*    → 基础设施层（DAL, Config, Common）
```

### 6.6 API 设计与编码规范（必须遵守）

#### 接口入参
- 复杂对象必须使用 DTO，禁止 `Map<String, Object>`
- `@RequestBody` 接收复杂对象，`@RequestParam` 仅用于简单参数
- `@Valid` 校验 + JSR-303 注解

#### 接口出参
- 必须使用具体 DTO 类，禁止 `Map<String, Object>`
- DTO 要求：`@Data` + `@Schema` + `Serializable` + `serialVersionUID`
- 命名：`XxxRequestDTO`/`XxxResultDTO` 或 `XxxReqVo`/`XxxRespVo`

#### 邮件发送
- 使用已注入的 `emailMessageSender`（`MessageSender<EmailMessageDTO>`）
- 禁止直接使用 `EmailSender`
- 使用 `EmailMessageDTO` 构造函数

#### 禁止循环调用外部接口/中间件
- 禁止在 for/forEach 循环中调用数据库、Feign、Redis、MQ
- 必须批量获取 → 转 Map → 循环中 Map 匹配

#### Mapper 禁止注解 SQL
- 禁止 `@Select/@Update/@Insert/@Delete`
- 所有 SQL 必须写在 `XxxMapper.xml` 中

### 6.7 数据库 DDL 规范

- 实体类必须继承 `BaseEntity`（`com.catlbattery.domain.entity.BaseEntity`）
- `@TableName` 指定真实表名
- 主键 `@TableId(type = IdType.ASSIGN_ID)` 雪花算法，禁止自增
- BaseEntity 审计字段（5 个必须）：
  - `creation_date` DATETIME DEFAULT CURRENT_TIMESTAMP
  - `created_by` VARCHAR(64)
  - `last_updated_by` VARCHAR(64)
  - `last_update_date` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  - `delete_flag` TINYINT(1) DEFAULT '0'
- DDL 保存位置：`change/migrate/ddl/`
- 命名：`V[版本号]__[描述].sql`
- 使用 `IF NOT EXISTS` 防止重复执行

### 6.8 前端代码生成（强制使用 rosefinch-front-skills）

详见第七章。

### 6.9 单元测试生成

- 使用 JUnit 5 + Mockito
- 测试脚本位于 `scripts/`（PowerShell）
- 主入口：`run.ps1`
- 测试位置：`src/test/java/` + 包路径 + `类名Test.java`
- 命名：`test方法名_场景_预期结果`
- Controller 测试：`@WebMvcTest` + `MockMvc`
- Service 测试：`@ExtendWith(MockitoExtension.class)` + `@Mock` + `@InjectMocks`

### 6.10 前后端接口一致性校验

生成前后端代码后必须执行：
- URL 路径检查（与 Controller `@RequestMapping` 匹配）
- HTTP 方法检查
- 请求参数检查
- 响应格式检查
- URL 前缀检查（如 `catl-apqp/v1`）

### 6.11 项目标准模板

`templates/` 目录下：
- `controller-template.java`
- `service-interface-template.java`
- `service-impl-template.java`
- `mapper-interface-template.java`
- `mapper-xml-template.xml`
- `entity-template.java`
- `README.md`（占位符说明）

---

## 七、子技能：rosefinch-front-skills（前端组件）

| 属性 | 值 |
|------|-----|
| 名称 | rosefinch-front-skills |
| 版本 | 1.0.0 |
| 流水线位置 | Step 4 子调用（被 add-to-future 强制调用） |
| 技术栈 | React 18 + TypeScript + MobX 6 + Ant Design 5 |
| 依赖 | react, react-dom, antd, @emotion/react, ahooks, mobx, mobx-react-lite, dayjs, lodash, numeral |

### 7.1 作用

朱雀微服务平台前端组件完整技能集合，提供企业级应用开发所需的完整组件解决方案。从用户请求中提取功能关键词，自动匹配 DICC 组件，强制触发对应的 references 检查机制。

### 7.2 强制前置协议

任何前端功能实现前必须执行：
1. 关键词识别（匹配"功能域"列）
2. 强制读取对应 references 文件
3. 禁止使用第三方 UI 库、禁止基于网络搜索实现、禁止使用已有知识假设

### 7.3 功能域与 References 映射表

| 功能域 | 关键词 | 必须读取的 References | 核心组件 | 严禁第三方 |
|--------|--------|----------------------|---------|-----------|
| 基础 UI 组件 | 主题、样式、图标、品牌、布局、国际化 | `theme-wrapper.md` | ThemeWrapper, CatlIcon | Material-UI、Chakra UI、Element UI |
| 表单类组件 | 表单、输入框、按钮、选择器、开关、上传、复选框 | `dicc-form.md` | DiccForm, DiccInput, DiccSelect, DiccSwitch, DiccButton, DiccUpload, DiccCheckbox | Formik、React Hook Form、Antd 原生 |
| 数据展示组件 | 表格、列表、描述、图片、CRUD、分页 | `compose-table.md` | ComposeTable, DiccDescriptions, DiccImage | React Table、AG Grid、Antd 原生 |
| 导航布局组件 | 抽屉、侧边栏、布局、导航、面板 | `dicc-layout-drawer.md` | DiccLayoutDrawer | React Router、React Navigation |
| 日期时间组件 | 日期、时间、选择器、范围选择 | `dicc-date-picker.md` | DiccDatePicker | React Datepicker、Day.js 原生 |
| 交互反馈组件 | 提示、警告、抽屉、工具提示、反馈、弹窗 | `dicc-alert.md` | DiccAlert, DiccDrawer, DiccTooltip | React Toastify、SweetAlert2 |
| 选择器组件 | 选择、列表值、滚动、远程数据、级联、多选 | `lov-view-select.md` | LovViewSelect, ScrollSelect | React Select、Antd 原生 |
| 路由配置组件 | 路由、导航、页面、路径、菜单、面包屑、权限控制 | `routers.md` | 路由配置管理 | React Router 原生、Next.js 路由 |
| API 服务层组件 | API、接口、HTTP、请求、数据获取、RESTful | `services.md` | HTTP 客户端、API 管理 | fetch API、第三方 HTTP 库 |

### 7.4 前端代码生成流程

```
1. 识别前端需求关键词
   ↓
2. 查找匹配的功能域
   ↓
3. 读取对应的 references 文件（.opencode/skills/prd-to-commit/rosefinch-front-skills/references/）
   ↓
4. 使用 DICC 组件生成前端代码
   ↓
5. 验证组件使用正确性（对照 references 规范）
```

### 7.5 前端技术栈要求

- React 18 + TypeScript + MobX 6
- 使用 DICC 组件库（DiccForm、ComposeTable、DiccDatePicker 等）
- 使用 `@dicc/service` 进行 HTTP 请求
- 使用 `@dicc/utils` 工具库
- 状态管理使用 MobX + mobx-react-lite
- **严禁使用 Ant Design 原生组件**替代 DICC 组件

### 7.6 组件/库使用优先级

1. 第一优先级：内部库（CATL/DICC）— `catl-components`、`@dicc/utils`、`@dicc/service`、`@dicc/icons`、`@dicc/scan`
2. 第二优先级：通用组件库 — `antd`、`@ant-design/icons`
3. 第三优先级：专用库 — `echarts`、`@xyflow/react`、`@dnd-kit/core`
4. 第四优先级：状态管理 — `zustand`、`mobx`
5. 最后选择：自行实现

### 7.7 API 服务层组件特性

- 多协议 HTTP 客户端：支持 Rosefinch、Hzero 两种
- 统一错误处理：自动错误提示和拦截
- 业务域 API 组织：按功能模块划分
- 微服务集成：支持 Rosefinch 和 Hzero
- 低代码支持：低代码平台专用 API 封装
- 认证集成：自动 Bearer Token 注入

---

## 八、子技能：code-review-expert（Step 6 代码评审）

| 属性 | 值 |
|------|-----|
| 名称 | code-review-expert |
| 版本 | 2.0.0 |
| 作者 | wurx02 |
| 流水线位置 | Step 6 |
| 输入 | Step 4 生成的变更文件清单 + TRD + WBS |
| 输出 | `docs/review/02-[模块]-评审报告.md` |

### 8.1 作用

资深代码评审专家角色，精通后端 Java 17 + Spring Boot 3.x + MyBatis Plus + Flowable，前端 React 18 + TypeScript + MobX 6 + Rosefinch。**不是在挑刺，而是在守护代码库的健康。**

### 8.2 流水线集成

| 方面 | 说明 |
|------|------|
| 变更获取 | 上游（Step 4）提供变更文件清单 |
| 模块分类 | 跳过（上游已分类） |
| 输出文档 | 仅评审报告.md |
| 循环机制 | 不通过则回到 Step 4 |
| 参考文档 | TRD + WBS（上游提供） |

### 8.3 评审维度（6 后端 + 6 前端）

| 维度 | 说明 | 关注点 |
|------|------|--------|
| 代码规范 | 项目编码规范 | 命名、导入、格式 |
| 潜在 Bug | 运行时错误 | 空指针、越界、并发、边界 |
| 性能问题 | 系统性能 | N+1、全表扫描、循环内 DB |
| 安全风险 | 安全漏洞 | SQL 注入、XSS、敏感信息、权限 |
| 最佳实践 | 业界推荐 | 设计模式、异常、资源、事务 |
| 设计问题 | 架构缺陷 | 职责单一、耦合、扩展性、DDD |

### 8.4 严重程度分级

| 级别 | 标识 | 说明 |
|------|------|------|
| 高严重 | :red_circle: | 必须修复，可能导致生产事故 |
| 中严重 | :yellow_circle: | 强烈建议修复 |
| 低严重 | :green_circle: | 建议优化 |

### 8.5 引用文件说明

**后端审查**：
1. 先读取 `references/backend-codereview.md`（后端主引用）
2. 再读取 `references/java-coding-standards.md`（Java 编码规范）
3. 再读取 `references/java-coding-examples.md`（BAD/GOOD 代码对比示例）
4. 按需读取 `references/java-coding-background.md`、`references/java-coding-templates.md`、`references/java-code-examples.md`

**前端审查**：
1. 先读取 `references/frontend-codereview.md`（前端主引用）
2. 按文件类型读取子文件：
   - `.ts` → `ts-rules.md`
   - `.tsx`/`.jsx` → `ts-rules.md` + `react-rules.md`
   - `.js` → `js-rules.md`
   - `.css`/`.scss`/`.less` → `css-rules.md`
   - `.html` → `html-rules.md` + `common-rules.md`
   - `.vue` → `vue-rules.md`
   - `.md` → `doc-rules.md`
   - 任何前端文件 → `common-rules.md`

### 8.6 关键检查点

#### 后端自动化检查
- Star import（`import xxx.*`）
- `System.out.println`
- `Map<String, Object>` 入参/出参
- `@Select/@Update/@Insert/@Delete` 注解 SQL
- 空 catch 块 → **CRITICAL**
- 捕获 `Throwable` → **CRITICAL**
- 可变静态字段 → **CRITICAL**

#### 后端手动检查
- 命名规范（PascalCase 类、camelCase 方法、UPPER_SNAKE_CASE 常量）
- 行 ≤ 200 字符，方法 ≤ 200 行，文件 ≤ 2000 行
- 参数 ≤ 7，嵌套 if ≤ 3，嵌套 for ≤ 2

#### 后端关键风险
- 循环中数据库/Feign/Redis/MQ 操作 → **禁止**
- 写操作缺少 `@Transactional` → **CRITICAL**
- `@Transactional` 标注在 private 方法 → **CRITICAL**
- 缺少 `rollbackFor = Exception.class` → **HIGH**
- 大事务内包含网络/RPC → **CRITICAL**
- MQ 监听器缺少 try-catch → **CRITICAL**
- Redis Key 缺少 TTL → **CRITICAL**
- 跨服务调用缺少超时 → **CRITICAL**
- 日志输出密码/手机号/身份证/token → **CRITICAL**
- 硬编码密钥/密码 → **CRITICAL**
- `SimpleDateFormat` 多线程共享 → **CRITICAL**

#### 前端关键检查
- 禁止使用 `any` 类型 → **高严重**
- 删除 `console` 语句 → **高严重**
- 禁止 `dangerouslySetInnerHTML` → **高严重**
- 禁止 `innerHTML` 直接渲染 → **高严重**
- 禁止硬编码密钥/密码/token → **高严重**
- 禁止拼音与英文混合命名 → **高严重**
- 使用 2 个空格缩进（CSS/JSX）
- 单行代码不超过 100 字符

### 8.7 评审报告格式

```markdown
# 代码评审报告

## 一、评审概况
- 评审范围：[N]个文件（后端 N 个 | 前端 N 个 | SQL N 个）
- 问题统计汇总（表格：严重级别 × 后端/前端/合计）

## 二、:red_circle: 高严重问题（需立即修复）
### 问题 #N
- 文件：xxx.java:xx
- 维度：潜在Bug / 安全风险 / 性能问题
- 问题描述
- 代码片段
- 修复建议

## 三、:yellow_circle: 中严重问题
## 四、:green_circle: 低严重问题
## 五、总体评价
- 优点
- 需要改进
```

### 8.8 重要约束

1. **引用文件优先**：审查前必须先读取 `references/*.md`
2. **工具优先**：能用 AST-grep/LSP/checkstyle/grep 自动检测的禁止仅靠肉眼
3. **报告输出**：每次评审必须生成 `评审报告.md` 到 `docs/review/`
4. **不修改代码**：评审专家是只读角色，只记录到报告
5. **3 级严重程度**：每个问题必须标注
6. **循环机制**：不通过 → 回 Step 4 → Step 5 → Step 6 重新评审

---

## 九、子技能：code-to-prd（代码转 PRD）

| 属性 | 值 |
|------|-----|
| 名称 | code-to-prd |
| 版本 | 1.0.0 |
| 作者 | wurx02 |
| 流水线位置 | prd-to-wbs 内部调用（无历史 PRD 时） |
| 输入 | 项目代码库 |
| 输出 | `docs/prd/` 下的 PRD 文档集 |

### 9.1 作用

分析代码库并生成企业级标准 PRD 文档。智能代码分析、标准文档生成、多维度覆盖、可追溯性。

### 9.2 输出文档结构

```
docs/prd/
├── 00-产品概览.md              # 产品整体概述、术语定义、流程清单
├── [序号]-[流程名称].md        # 业务流程文档（核心、支撑、辅助流程）
├── [序号]-角色权限.md          # 角色定义和权限矩阵
└── [序号]-附录.md              # 接口清单、数据字典、错误码
```

**编号规则**：
- `00-`：产品概览（必须，固定）
- `01-99`：业务流程（核心 01-09，支撑/辅助继续编号）
- `[序号]-`：角色权限（非必须）
- `[序号]-`：附录（非必须）

### 9.3 工作流程（四阶段）

#### 第一阶段：项目分析
1.1 扫描项目结构（识别技术栈、目录结构、配置文件、入口文件）
1.2 分析代码结构（实体层、接口层、业务层、数据层、流程层）
1.3 提取业务信息（术语、角色、状态流转、业务规则、数据关系）
  - **提取真实表名**：从 `@TableName` 注解提取，禁止推断/虚构
1.4 提取业务中使用的技术类型
  - 优先检查 `references` 目录的 rosefinch 依赖
  - 在所有 PRD 文档中将 rosefinch 技术**加粗**或【重点】标注
  - 禁止虚构 Rosefinch 服务类/注解
1.5 文档长度评估（>200 行 / >8000 字符 / >10 流程步骤 / >20 接口 → 自动拆分）

#### 第二阶段：信息整理
| 维度 | 收集内容 | 来源 |
|------|---------|------|
| 产品定位 | 是什么、解决什么、目标用户 | README、配置、注释 |
| 功能模块 | 功能模块 | 目录结构、Controller |
| 业务流程 | 关键流程步骤 | Service 层、状态机 |
| 数据模型 | 核心实体和关系 | Entity/Model 类 |
| 用户角色 | 角色和权限 | 权限注解、角色常量 |
| 接口规范 | API 列表 | Controller/路由 |
| 非功能需求 | 性能、安全、部署 | 配置、中间件 |

#### 第三阶段：PRD 文档生成
- 3.1 产品概览（9 章节：背景、目标、术语、范围、架构、流程清单、技术架构、角色清单、文档清单）
- 3.2 业务流程（8 章节：概述、流程图、步骤、业务规则、异常处理、数据模型、接口清单、技术列表）
- 3.3 角色权限（5 章节：技术基础、角色定义、权限矩阵、数据权限、角色关系）
- 3.4 附录（6 章节：技术架构补充、接口清单、数据字典、错误码、流程清单、Rosefinch 组件清单）

#### 第四阶段：导出文档（可选）
- 文档数量校验
- 内容完整性校验
- 缺失内容处理（标注【待补充：原因】）
- 超长文档处理（自动拆分）
- 格式转换：PDF（`scripts/md_to_pdf.py`）或 Word（`scripts/md_to_word.py`），输出到桌面

### 9.4 内容规范

1. 表格优先（属性定义、规则说明、接口清单）
2. ASCII 图表（流程图、架构图、关系图）
3. 术语一致
4. 详细完整（每个流程步骤含输入、输出、逻辑、规则、异常）
5. 状态完整（无死状态）

### 9.5 API 流程图分离规范

当生成 API 接口流程图时，必须遵循分离规范：

```
docs/prd/api/
├── README.md                    # API 文档总览
├── API-01-流程模块.md            # API 接口定义（简洁版）
└── flowcharts/                  # 流程图专用文件夹
    ├── README.md                # 流程图索引
    └── API-01-001-分页查询流程实例.md   # 详细流程图
```

在 API 文档中使用引用：`📊 **详见**：[流程图名](./flowcharts/xxx.md)`

### 9.6 质量检查清单

- [ ] 所有术语都有定义
- [ ] 流程步骤编号连续
- [ ] 状态流转完整（无死状态）
- [ ] 角色权限覆盖所有功能
- [ ] 接口清单与代码一致
- [ ] 数据字典完整
- [ ] 错误码定义齐全
- [ ] 文档间引用正确
- [ ] **Rosefinch 技术组件已识别并重点标注（所有文档）**
- [ ] **表名使用真实 @TableName 值（所有文档）**
- [ ] **没有虚构 Rosefinch 服务类或注解**

### 9.7 执行步骤

1. 探索代码库
2. 记录发现
3. 生成 PRD（必须先产品概览，再业务流程，必须包含接口列表，必须完整性校验）
4. 询问接口详情补充
5. 根据需要生成 API 流程图
6. 生成 Word（可选）
7. 完成输出

---

## 十、子技能：refresh-prd（刷新 PRD）

| 属性 | 值 |
|------|-----|
| 名称 | refresh-prd |
| 版本 | 1.0.0 |
| 作者 | wurx02 |
| 流水线位置 | 独立工具（与 code-to-prd 互为补充） |
| 输入 | 代码库变更（Git Diff / Git Log） |
| 输出 | 更新后的 `docs/prd/` 文档 |

### 10.1 作用

基于现有代码库的变更，及时更新 PRD 文档，确保时效性和准确性。是 code-to-prd 的补充，专注于 PRD 文档的维护和更新。

### 10.2 核心能力

1. **变更识别**：自动识别代码库变更
   - Git Diff 方式（默认）：比较代码差异
   - Git Log 方式：基于提交记录（commit hash 或数量）
2. **文档同步**：将代码变更同步到 PRD
3. **版本管理**：维护 PRD 版本控制
4. **一致性保证**：确保 PRD 与代码实现一致

### 10.3 刷新流程（三阶段）

#### 第一阶段：变更分析
1.1 代码变更扫描（Git Diff、文件变更）
1.2 影响范围评估（业务流程、实体、接口、角色权限、数据模型）

#### 第二阶段：文档更新
2.1 内容更新（业务流程、接口清单、数据字典、角色权限、错误码、技术栈）
2.2 版本控制（版本号、更新内容、变更原因、修订历史）

#### 第三阶段：验证与输出
3.1 内容验证（与代码实现一致、流程逻辑正确、数据模型完整）
3.2 输出文档（更新后的 PRD、保持结构完整、提供更新说明）

### 10.4 文档命名与结构

```
docs/prd/
├── 00-产品概览.md
├── [序号]-[流程名称].md
├── [序号]-角色权限.md
└── [序号]-附录.md
```

| 文档类型 | 命名格式 | 示例 |
|---------|---------|------|
| 产品概览 | `00-产品概览.md` | 00-产品概览.md |
| 核心业务 | `[序号]-[流程名].md` | 01-物料开发流程.md |
| 角色权限 | `[序号]-角色权限.md` | 10-角色权限.md |
| 附录 | `[序号]-附录.md` | 11-附录.md |

### 10.5 更新原则

1. 完整性：必须完整覆盖所有变更点
2. 准确性：与代码实现完全一致
3. 一致性：格式和术语保持一致
4. 可追溯性：记录变更来源和说明
5. 真实性：
   - 表名必须使用 `@TableName` 真实值
   - Rosefinch 组件必须实际存在于 import 中
   - 禁止虚构任何服务类、注解或表名

### 10.6 刷新操作步骤

1. 变更识别（`git diff HEAD~1 HEAD`）
2. 影响分析（功能模块、业务流程、文档位置）
3. 文档更新（流程文档、接口清单、数据字典、角色权限）
4. 版本管理（版本号、更新日志、最后更新时间）
5. 验证输出（准确性、一致性、质量检查清单）
6. 质量检查（必须执行）：
   - 6.1 文档数量校验
   - 6.2 内容完整性校验
   - 6.3 真实性校验（表名、Rosefinch 组件）
   - 6.4 缺失内容处理

### 10.7 技术栈标注规范

- 所有 Rosefinch 组件必须以**加粗**或【重点】标记
- `00-产品概览.md` 必须单独列出 Rosefinch 技术组件小节
- 各业务流程文档的"使用到的技术列表"中优先列出 rosefinch 组件
- 附录文档列出 rosefinch 组件完整清单

### 10.8 真实性约束（重要）

- **表名真实性**：必须从 `@TableName` 注解提取，禁止推断/虚构
- **Rosefinch 组件真实性**：必须检查实际 import 语句，禁止虚构服务类或注解
- **接口真实性**：必须基于实际代码中的 Controller/路由定义
- **字段真实性**：必须基于实际实体类字段

### 10.9 流程文档更新模板

包含：更新说明（版本、日期、内容、影响范围、变更来源）、流程概述、流程步骤更新（新增/修改/删除）、数据模型更新（新增/修改/删除表）、接口清单更新、技术列表更新、待补充事项。

---

## 十一、统一规范与约束

### 11.1 文档目录约定

| 目录 | 用途 | 写入者 |
|------|------|--------|
| `docs/prd/` | 历史 PRD 文档 | code-to-prd / refresh-prd |
| `docs/wbs/` | 结构化需求列表 | prd-to-wbs |
| `docs/change/TRD/` | 技术设计文档 | wbs-to-trd |
| `docs/review/` | 代码评审报告 | code-review-expert |
| `tests/modules/[模块]/cases/` | 测试用例（JSON + Excel） | ui-test |
| `tests/modules/[模块]/scripts/` | Playwright 脚本 | ui-test |
| `tests/modules/[模块]/docs/report/` | 测试报告 | ui-test |
| `change/migrate/ddl/` | DDL 脚本 | add-to-future |
| `.sisyphus/` | 流水线状态文件 + 恢复计划 | prd-to-commit |
| `templates/` | 项目标准模板（Controller/Service/Mapper/Entity） | add-to-future 参考 |

### 11.2 跨技能统一约束

| 约束 | 适用技能 | 说明 |
|------|---------|------|
| 表名真实性 | code-to-prd、refresh-prd、wbs-to-trd、add-to-future | 必须从 `@TableName` 注解提取，禁止推断/虚构 |
| Rosefinch 组件真实性 | code-to-prd、refresh-prd、wbs-to-trd、add-to-future、code-review-expert | 必须检查实际 import 语句，禁止虚构服务类/注解 |
| 禁止 Map 入参出参 | wbs-to-trd、add-to-future、code-review-expert | 必须使用具体 DTO 对象 |
| 禁止循环调用外部接口 | add-to-future、code-review-expert | 批量获取 → 转 Map → 循环匹配 |
| Mapper 禁止注解 SQL | add-to-future、code-review-expert | SQL 必须写在 XML 中 |
| BaseEntity 审计字段 | add-to-future、wbs-to-trd | 5 个审计字段必须包含 |
| 主键雪花算法 | add-to-future、wbs-to-trd | `IdType.ASSIGN_ID`，禁止自增 |
| 前端必须使用 DICC 组件 | add-to-future、rosefinch-front-skills | 严禁第三方 UI 库替代 |
| 用户确认 | prd-to-commit（所有步骤） | 不确认 = 不继续 |
| WBS-TRD-Case 对齐 | prd-to-commit | 三方必须相互覆盖 |

### 11.3 后端技术栈统一

- Java 17 + Spring Boot 3.x + Maven（多模块）
- Rosefinch 0.3.1.2.GA（CATL 内部框架）
- OceanBase + MyBatis Plus 3.5.5 + Dynamic Datasource
- Flowable 7.1.0（工作流）
- Spring Cloud Alibaba + Nacos
- DDD 分层：catl-api / catl-app / catl-domain / catl-infra-*

### 11.4 前端技术栈统一

- React 18 + TypeScript + MobX 6 + Ant Design 5
- CATL 内部 DICC 前端架构
- 组件优先级：内部库（catl-components、@dicc/*） → 通用库（antd） → 专用库 → 状态管理 → 自行实现
- 严禁使用 Ant Design 原生组件替代 DICC 组件

### 11.5 代码规范统一

- 阿里 JAVA 开发规范
- 禁止 `System.out.println`，必须使用 `@Slf4j`
- 禁止 `@Autowired` 字段注入，推荐构造函数注入
- 所有 public 方法必须 Javadoc
- 前端：2 个空格缩进，单行 ≤ 100 字符
- 前端：禁止 `any` 类型、禁止 `console`、禁止 `dangerouslySetInnerHTML`、禁止拼音命名

### 11.6 流水线循环机制

```
Step 4 代码生成
   │
   ▼
Step 5 自动化测试 ── FAIL ──► 回 Step 4
   │
   PASS
   │
   ▼
Step 6 代码评审 ── FAIL ──► 回 Step 4
   │                       │
   │                       ▼
   │                    Step 5 重新测试
   │                       │
   PASS                    ▼
   │                    Step 6 重新评审
   ▼
Step 7 代码提交
```

---

## 十二、参考文件索引

### 12.1 主技能文件

| 文件 | 用途 |
|------|------|
| `SKILL.md` | 主技能定义 |
| `prd-to-commit-state-template.json` | 状态文件模板 |
| `pipeline-monitor.html` | 流水线监控页面 |

### 12.2 add-to-future 资源

| 目录/文件 | 用途 |
|----------|------|
| `add-to-future/references/` | Rosefinch 参考文档、代码规范、API 设计指南、DICC 组件指南 |
| `add-to-future/scripts/` | 单元测试生成 PowerShell 脚本（run.ps1 等） |
| `add-to-future/templates/` | 项目标准模板（Controller/Service/Mapper/Entity） |

### 12.3 code-review-expert 资源

| 文件 | 用途 |
|------|------|
| `code-review-expert/references/backend-codereview.md` | 后端主引用 |
| `code-review-expert/references/java-coding-standards.md` | Java 编码规范 |
| `code-review-expert/references/java-coding-examples.md` | BAD/GOOD 代码对比 |
| `code-review-expert/references/java-coding-background.md` | 事务策略、卫语句 |
| `code-review-expert/references/java-coding-templates.md` | 检查报告模板 |
| `code-review-expert/references/java-code-examples.md` | Java 基础检查示例 |
| `code-review-expert/references/frontend-codereview.md` | 前端主引用 |
| `code-review-expert/references/common-rules.md` | 通用前端规范 |
| `code-review-expert/references/ts-rules.md` | TypeScript 规范 |
| `code-review-expert/references/js-rules.md` | JavaScript 规范 |
| `code-review-expert/references/react-rules.md` | React 规范 |
| `code-review-expert/references/html-rules.md` | HTML/JSX 规范 |
| `code-review-expert/references/css-rules.md` | CSS 规范 |
| `code-review-expert/references/vue-rules.md` | Vue 规范 |
| `code-review-expert/references/doc-rules.md` | 文档规范 |
| `code-review-expert/references/review-mode-flow.md` | 审查模式流程 |

### 12.4 rosefinch-front-skills 资源

| 文件 | 用途 |
|------|------|
| `rosefinch-front-skills/references/theme-wrapper.md` | 基础 UI 组件 |
| `rosefinch-front-skills/references/dicc-form.md` | 表单类组件 |
| `rosefinch-front-skills/references/compose-table.md` | 数据展示组件 |
| `rosefinch-front-skills/references/dicc-layout-drawer.md` | 导航布局组件 |
| `rosefinch-front-skills/references/dicc-date-picker.md` | 日期时间组件 |
| `rosefinch-front-skills/references/dicc-alert.md` | 交互反馈组件 |
| `rosefinch-front-skills/references/lov-view-select.md` | 选择器组件 |
| `rosefinch-front-skills/references/routers.md` | 路由配置组件 |
| `rosefinch-front-skills/references/services.md` | API 服务层组件 |

### 12.5 ui-test 资源

| 目录/文件 | 用途 |
|----------|------|
| `ui-test/cli.js` | 命令行入口 |
| `ui-test/playwright.config.js` | Playwright 配置 |
| `ui-test/config/test-config.json` | 公共配置（登录、环境、选择器） |
| `ui-test/utils/` | 工具脚本（api-logger、code-analyzer、config-loader、env-checker、excel-case-generator、prd-parser、report-generator） |
| `ui-test/agents/` | 智能代理（module-generator、module-updater、script-generator、recording-assistant、regression-runner、resource-finder） |
| `ui-test/models/` | 数据模型（test-case、dependency-manager） |

### 12.6 prd-to-wbs / code-to-prd 资源

| 目录/文件 | 用途 |
|----------|------|
| `prd-to-wbs/scripts/` | 辅助脚本（read_prd_file.py、index_docs.py、extract_requirements.py、match_module.py、generate_doc.py、md_to_docx.py） |
| `code-to-prd/scripts/` | 转换脚本（md_to_pdf.py、md_to_word.py） |
| `code-to-prd/references/` | 代码规范参考文档 |
| `code-to-prd/evals/` | 评估相关 |

---

## 十三、版本信息

| 技能 | 版本 |
|------|------|
| prd-to-commit（主） | 6.0.0 |
| add-to-future | 1.0.0 |
| code-review-expert | 2.0.0 |
| code-to-prd | 1.0.0 |
| prd-to-wbs | 1.0.0 |
| refresh-prd | 1.0.0 |
| rosefinch-front-skills | 1.0.0 |
| ui-test | 1.1.0 |
| wbs-to-trd | 1.0.0 |

---

## 十四、使用指南速查

### 14.1 触发完整流水线

用户说："prd 输出代码"、"prd 转代码"、"prd to code"

→ 触发 prd-to-commit，从 Step 0 开始

### 14.2 单独使用子技能

| 用户意图 | 触发技能 |
|---------|---------|
| 分析 PRD、生成需求列表 | prd-to-wbs |
| 生成技术设计、架构设计 | wbs-to-trd |
| 生成测试用例、自动化测试 | ui-test |
| 需求转代码、生成代码 | add-to-future |
| 前端组件开发 | rosefinch-front-skills |
| 代码评审 | code-review-expert |
| 代码转 PRD | code-to-prd |
| 更新 PRD、同步代码变更 | refresh-prd |

### 14.3 关键路径

```
PRD 文档 → prd-to-wbs → WBS（docs/wbs/）
                              ↓
                       wbs-to-trd → TRD（docs/change/TRD/）
                              ↓
                       ui-test（Step 3）→ 测试用例（tests/modules/.../cases/）
                              ↓
                       add-to-future → 代码（后端 + 前端 + DDL）
                              ↓
                       ui-test（Step 5）→ 测试报告
                              ↓
                       code-review-expert → 评审报告（docs/review/）
                              ↓
                       git commit
```

---

**文档说明**：本文档为 prd-to-commit 主技能及其 8 个子技能的统一总结，结构与口径保持一致，便于查阅与维护。如需查看某个技能的完整细节，请参阅对应的 `SKILL.md` 文件。
