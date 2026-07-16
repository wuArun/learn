---
name: prd-to-commit
description: |
  产品需求文档(PRD)到代码提交的端到端8步流水线。当用户说"prd输出代码"、"prd转代码"、"PRD转代码"、"prd to code"时触发此技能。

  **最重要原则：每步都必须等待用户明确确认后才能进入下一步！不确认 = 不继续！没有任何例外！**

  8步流水线（按顺序执行）：
  0. **状态初始化** (`state-init`) → 初始化/恢复流水线状态文件，必须用户确认
  1. **需求分析** (`prd-to-wbs`) → 输出WBS，必须用户确认
  2. **技术设计** (`wbs-to-trd`) → 输出TRD，必须用户确认
  3. **测试用例** (`ui-test`) → 输出Case，必须用户确认
  4. **代码生成** (`add-to-future`) → 输出代码，必须用户确认
  5. **自动化测试** (`ui-test`) → 执行测试，必须用户确认
  6. **代码评审专家** (`code-review-expert`) → 评审代码，不通过则循环回Step 4修正，必须用户确认
  7. **代码提交** (git commit) → 提交代码，必须用户确认

  compatibility:
  required_tools: []
  dependencies:
    - prd-to-wbs
    - wbs-to-trd
    - code-to-prd
    - add-to-future
    - code-review-expert
    - ui-test
    - rosefinch-front-skills

metadata:
  department: CATLND-BP&IT-DEVC2
  author: wurx02
  version: 6.0.0
---

# PRD to Code - 8步流水线

**最重要原则：每步都必须等待用户明确确认后才能进入下一步！不确认 = 不继续！没有任何例外！严禁跳过确认环节！严禁假设用户已确认！必须获得用户的"确认"/"可以"/"继续"等肯定回复后才能进入下一步！**

### ⚠️ 关于系统 TODO 续接提醒的特殊处理规则

**当收到系统 TODO CONTINUATION 提醒时，必须遵守以下优先级：**

1. **流水线确认原则 > TODO续接提醒**：如果当前步骤处于 `pending_confirmation` 状态等待用户确认，**必须先等待用户明确确认**，即使系统 TODO 续接提醒要求"不询问继续推进"。
2. **正确的做法**：在等待用户确认时，回复用户说明当前已完成、等待确认，并等待用户回复。**不得**因为 TODO 续接提醒就跳过确认环节自行推进。
3. **TODO 续接提醒仅适用于**用户在对话中已经明确"确认/可以/继续"后的待执行步骤（状态为 `in_progress` 或 `pending`），不适用于还需要用户确认的步骤（状态为 `pending_confirmation`）。
4. **判断规则**：只要状态文件中某步骤的 `status` 为 `pending_confirmation`，无论 TODO 续接提醒如何提示，都必须等待用户确认。

---

## 流水线核心原则

1. **【最重要·无例外】用户确认**：**每步完成后必须等待用户明确确认才能进入下一步！这是整个流水线最重要的环节，没有任何例外！不确认 = 不继续！严禁跳过确认环节！严禁假设用户已确认！必须获得用户的"确认"/"可以"/"继续"等肯定回复后才能进入下一步！**
2. **【强制】状态文件**：**每个会话生成唯一的状态文件！路径格式为 `.sisyphus/prd-to-commit-state-{MODULE_NAME}.json`，其中 `{MODULE_NAME}` 为用户提供的模块名称！不同模块/会话使用不同的状态文件，互不干扰！状态文件是流水线进度的唯一真相来源！**
``3. **【强制】currentStep初始化为0**：**首次初始化状态文件时，`currentStep` 必须为 0！存量状态文件（从文件恢复的）按文件中记录的 `currentStep` 值恢复。**
4. **【强制】严格步骤顺序**：**步骤必须按 0→1→2→3→4→5→6→7 严格顺序执行！`currentStep` 只能递增不能跳跃！禁止跳步执行！只有当前步骤 confirmed 后，`currentStep` 才能递增到下一步！**
5. **循环修正**：Step 5测试失败或Step 6代码评审不通过时，循环回到Step 4修正，直到Step 5测试通过且Step 6评审通过
6. **质量保证**：每步都有校验环节，确保输出的质量
7. **文档对齐**：WBS、TRD、Case三者必须保持一致
8. **【强制】恢复计划文件**：**每次 Step 0 执行时，必须同步写入恢复计划文件到 `.sisyphus/plans/prd-to-commit-restart-{MODULE_NAME}.md`。该文件供会话中断后 Momus 检测触发恢复流程。**

---

## 流水线进度监控（Playwright）

**目标**：通过Playwright打开/刷新监控页面，实时查看流水线进度。

### 监控页面位置

监控页面HTML文件：`.opencode/skills/prd-to-commit/pipeline-monitor.html`

### 监控机制

**每步确认环节**都必须使用Playwright打开或刷新监控页面，让用户可以直观地查看当前流水线进度。

### Playwright操作规范

#### 首次打开监控页面（Step 0确认后）

在Step 0状态初始化确认后，使用Playwright打开监控页面：

```
1. 启动本地HTTP服务器（在项目根目录下执行）：
   python -m http.server 8765
   或
   npx serve -l 8765 .

2. 使用Playwright打开监控页面：
   URL: http://localhost:8765/.opencode/skills/prd-to-commit/pipeline-monitor.html

3. 如果使用file://协议直接打开（无需HTTP服务器）：
   使用Playwright将状态数据注入页面：
   - 读取所有 .sisyphus/prd-to-commit-state-*.json 文件
   - 将数据序列化为JSON数组
   - 通过 page.evaluate() 调用 window.updatePipelineStates(statesJson) 注入数据
```

#### 每步确认时刷新监控页面

在每步完成后、等待用户确认时，**必须**执行以下操作：

1. **更新状态文件**：将当前步骤的 `status` 设为 `pending_confirmation`，更新状态文件
2. **刷新监控页面**：
   - 如果监控页面已打开（HTTP服务器模式）：使用 Playwright 的 `page.reload()` 刷新页面
   - 如果使用注入模式：重新读取所有 `.sisyphus/prd-to-commit-state-*.json` 文件，调用 `page.evaluate('window.updatePipelineStates(...)')` 更新数据
3. **截图确认**：使用 `page.screenshot()` 截取当前进度截图，展示给用户

#### 用户确认后更新监控页面

当用户确认某步骤后：

1. **更新状态文件**：将该步骤 `status` 设为 `confirmed`，下一步 `status` 设为 `pending_confirmation`
2. **刷新监控页面**：刷新页面或重新注入数据
3. **继续执行下一步**

### 具体Playwright操作指令

**在每步的【必须确认】用户确认环节中，执行以下Playwright操作**：

```javascript
// Step 0 确认后 - 首次打开监控页面
// 1. 启动HTTP服务器（如果尚未启动）
// 2. 打开页面
const page = await browser.newPage();
await page.goto('http://localhost:8765/.opencode/skills/prd-to-commit/pipeline-monitor.html');

// 或者使用文件协议 + 注入模式
const page = await browser.newPage();
await page.goto('file:///{PROJECT_PATH}/.opencode/skills/prd-to-commit/pipeline-monitor.html');
// 读取状态文件并注入
const statesJson = JSON.stringify(pipelineStates);
await page.evaluate(`window.updatePipelineStates('${statesJson.replace(/'/g, "\\'")}')`);

// 每步完成后 - 刷新监控页面
await page.reload();
// 或注入模式
await page.evaluate(`window.updatePipelineStates('${newStatesJson}')`);
// 截图展示
const screenshot = await page.screenshot();
```

**【强制】每步确认环节的Playwright操作流程**：
1. 更新 `.sisyphus/prd-to-commit-state-{MODULE_NAME}.json` 状态文件
2. 刷新/更新监控页面
3. 截取当前进度截图
4. 向用户展示确认信息 + 进度截图

---

## Step 0：流水线状态初始化 (state-init)

**目标**：为当前模块创建唯一的状态文件。每个模块/会话使用独立的状态文件，互不干扰。

**【强制】每次运行流水线前必须执行此步骤！**

**执行流程**：
1. 获取用户提供的模块名称（MODULE_NAME）
2. 拼接状态文件路径：`.sisyphus/prd-to-commit-state-{MODULE_NAME}.json`
3. 检查该路径的状态文件是否存在
4. **如果文件不存在**：
   a. 读取模板文件：`.opencode/skills/prd-to-commit/prd-to-commit-state-template.json`
   b. 将模板文件复制到 `.sisyphus/prd-to-commit-state-{MODULE_NAME}.json`
   c. 替换模板中的 `{{SESSION_ID}}` 为当前会话ID
   d. 替换模板中的 `{{MODULE_NAME}}` 为用户提供的模块名称
   e. 确保 `currentStep` 为 0
   f. 向用户展示初始化后的状态文件内容
5. **如果文件已存在**：
   a. 读取现有状态文件，解析 `currentStep` 和 `steps[].status`
   b. 定位断点：从 `currentStep` 开始向前找第一个状态不是 `confirmed` 的步骤
   c. 向用户展示断点信息（当前步骤、状态、产出文件路径）
   d. 提供选项：
      - **继续流水线** — 保持状态文件不变，恢复到断点步骤
      - **重头开始** — 重新初始化状态文件，`currentStep` 重置为 0
   e. 根据用户选择执行
6. **【强制】生成恢复计划文件**：
   a. 读取模板：`.sisyphus/plans/prd-to-commit-restart-template.md`
   b. 替换 `{{MODULE_NAME}}` 为当前模块名
   c. 写入 `.sisyphus/plans/prd-to-commit-restart-{MODULE_NAME}.md`
   d. 此文件供会话中断后 Momus 检测触发恢复流程
7. 更新状态文件到 `.sisyphus/prd-to-commit-state-{MODULE_NAME}.json`
8. 提示用户当前状态，等待用户确认

**输出物**：
- `.sisyphus/prd-to-commit-state-{MODULE_NAME}.json` — 当前模块的流水线状态文件（每个模块独立一份）

**【必须确认】用户确认环节**：
> 流水线状态已初始化/恢复。
> 模块名称：[模块名]
> 当前步骤：Step [N] - [步骤名称]
> 各步骤状态：
> | 步骤 | 名称 | 状态 |
> |------|------|------|
> | Step 0 | 状态初始化 | [状态] |
> | Step 1 | 需求分析 | [状态] |
> | ... | ... | ... |
>
> 恢复计划文件：`.sisyphus/plans/prd-to-commit-restart-[模块名].md`（会话中断后可从此文件恢复）
>
> 确认流水线状态，是否可以进入下一步？

**【必须】Playwright监控操作**：首次使用Playwright打开监控页面（详见"流水线进度监控"章节），截取当前进度截图展示给用户。

- [Y] 用户确认 → 进入 Step 1
- [N] 用户要求调整 → 修改状态文件后重新展示
- **未获用户明确确认，绝对不得进入Step 1！必须等待用户主动回复确认！**

**状态文件格式说明**：
```json
{
  "pipeline": "prd-to-commit",
  "sessionId": "<会话ID>",
  "module": "<模块名>",
  "currentStep": 0,
  "restartPlan": ".sisyphus/plans/prd-to-commit-restart-<模块名>.md",
  "steps": [
    {
      "step": 0,
      "name": "流水线状态初始化 (state-init)",
      "status": "confirmed",
      "outputFile": null
    },
    {
      "step": 1,
      "name": "需求分析 (prd-to-wbs)",
      "status": "blocked",
      "outputFile": null
    }
    // ... 其余步骤
  ],
  "rule": "首次初始化时currentStep必须为0。恢复时从文件中读取currentStep值。每步status必须为confirmed才能进入下一步。currentStep只能按0→1→2→...→7顺序递增，禁止跳步。pending_confirmation需等待用户明确确认后改为confirmed。blocked步骤在前面步骤confirmed前不可执行。恢复时读取restartPlan文件进行会话恢复。"
}
```

**状态值含义**：
- `pending_confirmation` — 步骤已完成输出，等待用户确认
- `confirmed` — 用户已确认，可以进入下一步
- `blocked` — 前置步骤未确认，不可执行
- `completed_without_confirmation` — 已执行但未经用户确认（异常状态，需补确认）

**每步完成后的状态更新规则**：
1. 步骤执行完成 → 将该步骤状态设为 `pending_confirmation`
2. 用户确认 → 将该步骤状态设为 `confirmed`，下一步状态从 `blocked` 改为 `pending_confirmation`
3. 用户拒绝 → 保持 `pending_confirmation`，修改输出后重新展示

---

## Step 1：需求分析 (prd-to-wbs)

**目标**：读取 `docs/prd/` 中的PRD文档，进行需求分析，确认修改范围和与原有模块的关系，输出WBS需求列表。

**执行流程**：
1. 读取子技能文档：`.claude/skills/prd-to-code/prd-to-wbs/SKILL.md`
2. 扫描 `docs/prd/` 目录下的PRD文档
3. 如无历史PRD但有代码，询问是否自动生成历史PRD
4. 分析PRD内容，提取结构化需求
5. 确认修改范围和与原有模块的关系
6. 匹配需求到现有模块（或新建模块）
7. 生成需求列表文档到 `docs/wbs/` 目录

**输出物**：
- `docs/wbs/[模块名]-需求列表.md` — 结构化的需求列表

**【必须确认】用户确认环节**：
> WBS需求列表已生成，包含 [N] 条需求。
> 修改范围：[涉及模块列表]
> 与原有模块关系：[影响分析]
>
> WBS是否满足您的需求？是否需要修改？

**【必须】Playwright监控操作**：更新状态文件后，刷新监控页面，截取当前进度截图展示给用户。

- [Y] 用户确认 → 进入 Step 2
- [N] 用户要求修改 → 修改WBS后重新展示，重复确认直到用户满意
- **未获用户明确确认，绝对不得进入Step 2！必须等待用户主动回复确认！**

---

## Step 2：技术设计 (wbs-to-trd)

**目标**：基于WBS需求列表，生成完整的技术设计文档(TRD)，并校验TRD是否覆盖了WBS的所有需求。

**执行流程**：
1. 读取子技能文档：`.claude/skills/prd-to-code/wbs-to-trd/SKILL.md`
2. 读取 `docs/wbs/` 下的需求列表文档
3. 读取项目技术栈信息（pom.xml、package.json等）
4. 生成完整的TRD文档（技术选型、架构设计、数据模型、接口定义等）
5. **【必须】WBS覆盖度校验**：逐条对比WBS需求与TRD方案，确保100%覆盖
6. 如有未覆盖需求，补充TRD对应章节

**输出物**：
- `docs/change/TRD/TRD_[系统名称]_v[版本号].md` — 完整的技术设计文档
- WBS需求覆盖度报告（嵌入TRD附录）

**【必须确认】用户确认环节**：
> TRD技术设计文档已生成，WBS需求覆盖度 100%。
> 技术选型：[技术栈摘要]
> 接口数量：[N]个
> 数据模型变更：[N]个表
>
> TRD是否满足您的需求？是否需要修改？

**【必须】Playwright监控操作**：更新状态文件后，刷新监控页面，截取当前进度截图展示给用户。

- [Y] 用户确认 → 进入 Step 3
- [N] 用户要求修改 → 修改TRD后重新校验覆盖度，重复确认直到用户满意
- **未获用户明确确认，绝对不得进入Step 3！必须等待用户主动回复确认！**

---

## Step 3：测试用例生成 (ui-test)

**目标**：基于TRD和WBS，生成结构化的测试用例，并校验用例是否覆盖了TRD和WBS的所有需求点。

**执行流程**：
1. 读取子技能文档：`.claude/skills/prd-to-code/ui-test/SKILL.md`
2. 执行前置扫描（PRD文档、后端代码、前端代码、公共配置）
3. 基于 TRD + WBS 生成测试用例（JSON + Excel 双格式）
4. **【必须】TRD/WBS覆盖度校验**：
   - 对比测试用例与TRD中的接口定义，确保每个接口都有对应测试
   - 对比测试用例与WBS中的需求条目，确保每个需求都有对应测试
   - 对比测试用例与TRD中的异常处理方案，确保异常场景有测试覆盖
5. 如有未覆盖的需求或接口，补充测试用例

**输出物**：
- `tests/modules/[功能模块]/cases/*.json` — JSON格式测试用例
- `tests/modules/[功能模块]/cases/[模块名]-测试用例.xlsx` — Excel格式测试用例

**【必须确认】用户确认环节**：
> 测试用例已生成，共 [N] 条用例。
> 正向用例：[N] 条 | 反向用例：[N] 条 | 边界用例：[N] 条
> WBS需求覆盖：100% | TRD接口覆盖：100%
>
> 测试用例是否满足您的需求？是否需要修改？

**【必须】Playwright监控操作**：更新状态文件后，刷新监控页面，截取当前进度截图展示给用户。

- [Y] 用户确认 → 进入 Step 4
- [N] 用户要求修改 → 修改用例后重新校验覆盖度，重复确认直到用户满意
- **未获用户明确确认，绝对不得进入Step 4！必须等待用户主动回复确认！**

---

## Step 4：代码生成与启动 (add-to-future)

**目标**：基于TRD、WBS和Case，生成执行计划和完整的代码，然后启动前后端进行联调。

**执行流程**：
1. 读取子技能文档：`.claude/skills/prd-to-code/add-to-future/SKILL.md`
2. 读取以下输入文档：
   - `docs/change/TRD/` 下的TRD文档 — 技术方案
   - `docs/wbs/` 下的WBS文档 — 需求列表
   - `tests/modules/[功能模块]/cases/` 下的Case — 测试用例
3. 输出执行计划，包含：
   - 代码文件清单（后端+前端）
   - DDL脚本清单（如涉及数据库变更）
   - 实现顺序和依赖关系
4. 生成代码（后端Java + 前端React + DDL脚本）
5. **【强制】前端代码生成必须使用 rosefinch-front-skills 子技能**：
   a. 读取子技能文档：`.opencode/skills/prd-to-commit/rosefinch-front-skills/SKILL.md`
   b. 根据前端功能需求提取关键词（如表单、表格、日期选择器、抽屉等）
   c. 匹配 rosefinch-front-skills 中的功能域与 References 映射表
   d. **必须读取对应的 references 文件**获取组件API规范（如 `references/dicc-form.md`、`references/compose-table.md` 等）
   e. 使用 rosefinch-front-skills 中规定的 DICC 组件生成前端代码，严禁使用第三方UI库（如 Antd原生、Material-UI等）
   f. 前端代码必须基于 React 18 + TypeScript + MobX 6 技术栈
6. 执行API前后端一致性校验
7. **启动前后端联调**：
   - 前端启动：`/frontend` 目录下执行启动命令
   - 后端启动：`/backend` 目录下执行启动命令
   - 如果启动成功 → 等待用户确认
   - **如果启动失败** → 告知用户：
     > [WARNING] 前后端启动失败，请手动启动后再继续。
     > 前端路径：/frontend
     > 后端路径：/backend
     > 错误信息：[具体错误]
     >
     > 启动成功后请回复"已启动"，我将继续执行测试。

**输出物**：
- 后端代码（Controller、Service、Mapper、Entity等）
- 前端代码（页面组件、Service、API调用等）
- DDL脚本（`change/migrate/ddl/` 目录下）
- 执行计划文档

**【必须确认】用户确认环节**（代码生成与启动完成后）：
> 代码已生成并完成前后端启动。
> 后端文件：[文件列表摘要]
> 前端文件：[文件列表摘要]
> DDL脚本：[脚本列表]
> API前后端一致性校验：[通过/未通过]
>
> 代码生成结果是否可以进入自动化测试阶段？

**【必须】Playwright监控操作**：更新状态文件后，刷新监控页面，截取当前进度截图展示给用户。

- [Y] 用户确认 → 进入 Step 5
- [N] 用户要求修改 → 修改代码后重新确认，重复直到用户满意
- **未获用户明确确认，绝对不得进入Step 5！必须等待用户主动回复确认！**

**注意**：如果前后端启动失败，需用户手动介入修复后回复"已启动"，再进行确认环节。

---

## Step 5：自动化测试 (ui-test)

**目标**：读取Step 3生成的测试用例，使用Playwright执行自动化测试。如果测试失败，循环回到Step 4修正代码。

**执行流程**：
1. 读取子技能文档：`.claude/skills/prd-to-code/ui-test/SKILL.md`
2. 读取 `tests/modules/[功能模块]/cases/` 下的测试用例
3. 生成Playwright测试脚本
4. 执行自动化测试
5. 生成测试报告

**测试结果处理**：

- [PASS] **全部通过**：
  > 自动化测试全部通过！
  > 测试报告：tests/modules/[功能模块]/docs/report/[报告文件]
  > 通过：[N] | 失败：0
  >
  > 是否可以进行 Step 6（代码评审专家）？

- [FAIL] **存在失败**：
  > [WARNING] 自动化测试存在失败用例。
  > 通过：[N] | 失败：[N]
  > 失败用例详情：
  > - [用例ID]: [失败原因]
  >
  > 将回到 Step 4 修正代码...

  **循环流程**：回到 Step 4，根据失败用例修正代码 → 重新启动 → 回到 Step 5 重新测试，直到全部通过。

**输出物**：
- 测试报告（HTML + Markdown格式）
- 测试截图
- API调用记录

**【必须确认】用户确认环节**（测试全部通过后）：

**【必须】Playwright监控操作**：更新状态文件后，刷新监控页面，截取当前进度截图展示给用户。

- [Y] 用户确认 → 进入 Step 6
- [N] 用户要求修改 → 根据反馈处理
- **未获用户明确确认，绝对不得进入Step 6！必须等待用户主动回复确认！**

---

## Step 6：代码评审专家 (code-review-expert)

**目标**：对 Step 4 生成的代码进行全面评审，确保代码质量、符合项目规范、无潜在缺陷。如果评审发现问题，循环回到 Step 4 修正。

**执行流程**：
1. 读取子技能文档：`.opencode/skills/prd-to-commit/code-review-expert/SKILL.md`
2. 读取以下参考文档：
   - `docs/change/TRD/` 下的TRD文档 — 技术方案标准
   - `docs/wbs/` 下的WBS文档 — 需求列表标准
3. 获取 Step 4 生成的变更文件清单（Java、XML、TypeScript、SQL等）
4. 逐文件进行全面评审，覆盖以下维度：
   - 代码规范检查（阿里JAVA规约、命名规范、禁止Map入参等）
   - 架构符合性检查（DDD分层、依赖方向）
   - 安全性检查（SQL注入、XSS、权限校验）
   - 健壮性检查（异常处理、边界条件、批量操作规范）
   - 性能检查（N+1问题、循环性能）
   - 业务一致性检查（与TRD/WBS对齐、前后端API一致）
5. 按照子技能规范逐文件评审，生成评审报告（`docs/review/*-评审报告.md`）

**评审结果处理**：

- [PASS] **评审通过**：
  > 代码评审全部通过！
  > 评审文件数：[N]个
  > 问题总数：0
  >
  > 是否可以进行 Step 7（代码提交）？

- [FAIL] **评审不通过**：
  > [WARNING] 代码评审发现问题。
  > 评审文件数：[N]个
  > 问题统计：:red_circle:高严重 [N] | :yellow_circle:中严重 [N] | :green_circle:低严重 [N]
  > 评审报告：[评审报告路径]
  >
  > 将回到 Step 4 修正代码...

  **循环流程**：回到 Step 4，根据评审报告中的问题清单修正代码 → 重新启动 → 回到 Step 5 重新测试 → 回到 Step 6 重新评审，直到全部通过。

**输出物**：
- `docs/review/*-评审报告.md` — 代码评审报告

**【必须确认】用户确认环节**（评审通过后）：

**【必须】Playwright监控操作**：更新状态文件后，刷新监控页面，截取当前进度截图展示给用户。

- [Y] 用户确认 → 进入 Step 7
- [N] 用户要求修改 → 根据反馈处理
- **未获用户明确确认，绝对不得进入Step 7！必须等待用户主动回复确认！**

---

## Step 7：代码提交 (git commit)

**目标**：总结此次所有变更，生成有意义的commit message，执行git commit。

**执行流程**：
1. 汇总所有变更内容：
   - WBS需求列表（`docs/wbs/`）
   - TRD技术设计文档（`docs/change/TRD/`）
   - 测试用例（`tests/modules/`）
   - 后端代码变更
   - 前端代码变更
   - DDL脚本
   - 代码评审报告
2. 生成commit message，格式：
   ```
   feat: [功能模块] - [简要描述]

   - 需求列表: docs/wbs/[WBS文件名]
   - 技术设计: docs/change/TRD/[TRD文件名]

   变更内容:
   - [新增/修改] [具体变更1]
   - [新增/修改] [具体变更2]
   - ...

   测试结果:
   - 通过: N | 失败: 0
   - 测试报告: tests/modules/[模块名]/docs/report/[报告文件]
   ```
3. 执行 `git add` 添加所有变更文件
4. 执行 `git commit` 提交
5. 展示commit结果给用户

**输出物**：
- Git commit（包含所有变更）

**【必须确认】用户确认环节**：
> 即将提交以下变更：
> - 需求列表：[WBS文件]
> - 技术设计：[TRD文件]
> - 测试用例：[Case文件]
> - 后端代码：[变更文件数]个文件
> - 前端代码：[变更文件数]个文件
> - DDL脚本：[脚本文件]
> - 代码评审报告：docs/review/*-评审报告.md
>
> Commit message:
> ```
> feat: [功能模块] - [简要描述]
> ...
> ```
>
> 确认提交以上代码？

**【必须】Playwright监控操作**：更新状态文件后，刷新监控页面，截取最终进度截图展示给用户。

- [Y] 用户确认 → 执行 git commit
- [N] 用户要求修改 → 调整commit内容后重新确认
- **未获用户明确确认，绝对不得执行git commit！必须等待用户主动回复确认！**

---

## 重要约束

1. **currentStep初始化为0**：每次初始化状态文件时，`currentStep` 必须为 0！即使状态文件已存在也必须重新从模板初始化，`currentStep` 重置为 0，所有步骤状态重置！禁止从中间步骤恢复，必须从头开始执行！
2. **严格步骤顺序**：步骤必须按 0→1→2→3→4→5→6→7 严格顺序执行！`currentStep` 只能递增不能跳跃！只有当前步骤 `confirmed` 后，`currentStep` 才能递增到下一步！禁止跳步！
3. **状态文件驱动**：每个会话生成唯一的状态文件，路径格式为 `.sisyphus/prd-to-commit-state-{MODULE_NAME}.json`！不同模块使用不同状态文件，互不干扰！每次运行流水线前必须检查对应模块的状态文件是否存在，不存在则从 `.opencode/skills/prd-to-commit/prd-to-commit-state-template.json` 模板初始化。状态文件是流水线进度的唯一真相来源，每步完成后必须更新状态文件
4. **确认优先**：每步必须等待用户明确确认，不确认 = 不继续，没有任何例外
5. **表名真实性**：必须提取真实的 `@TableName` 表名，禁止推断/虚构
6. **Rosefinch组件识别**：必须识别并重点标注Rosefinch技术组件
7. **禁止虚构**：禁止虚构Rosefinch服务类或注解，必须基于实际代码
8. **代码规范**：生成的代码必须符合阿里JAVA开发规范
9. **WBS-TRD-Case对齐**：三份文档必须相互覆盖，不允许有需求遗漏
10. **循环修正**：Step 5测试失败或Step 6代码评审不通过时，必须循环回到Step 4修正，只有Step 5测试通过且Step 6评审通过后才能进入Step 7
