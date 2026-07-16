---
name: ui-test
description: 管理Playwright测试脚本的智能助手，支持脚本生成、修改、执行和报告生成
---


# Playwright测试管理Skill

## 元数据
- **名称**: ui-test
- **用途**: 帮助测试人员管理和生成Playwright测试脚本，根据需求和代码自动生成或修改脚本，执行测试并生成详细报告
- **适用场景**: 自动化测试、回归测试、CI/CD集成、测试报告分析

## 核心功能

### 1. 脚本管理
- 根据用户需求查找现有测试脚本
- 如果脚本不存在，自动生成新的测试脚本
- 根据需求修改现有脚本
- 维护脚本版本历史

### 2. 测试执行
- 使用Node.js执行Playwright测试脚本
- 支持单文件执行和批量执行
- 支持多种浏览器（Chromium、Firefox、WebKit）
- 支持headless和headed模式

### 3. 报告生成
- 生成HTML可视化报告
- 生成JSON结构化数据
- 生成JUnit XML报告（CI/CD集成）
- 提取测试执行的关键指标

### 4. 结果解析
- 解析测试通过/失败状态
- 提取错误信息和堆栈跟踪
- 获取执行时间和性能数据
- 收集截图和视频附件

### 5. API 监听与记录 🆕
- 自动捕获页面所有 API 请求和响应
- 记录请求方法、URL、请求体、响应状态
- 支持 JSON、Text、Binary 等多种响应类型
- 生成 API 调用统计报告（总数、成功率、失败数）
- 在 HTML/Markdown 报告中展示详细的 API 调用记录

**API 监听使用方法:**
```javascript
const ApiLogger = require('../../../../utils/api-logger');

// 初始化 API 日志记录器
const apiLogger = new ApiLogger();

// 在 Playwright page 上设置监听
apiLogger.setupPageListener(page);

// 测试完成后获取 API 调用记录
const apiCalls = apiLogger.formatForReport();
const apiStats = apiLogger.getStatistics();
console.log(`总调用数: ${apiStats.total}, 成功: ${apiStats.success}, 失败: ${apiStats.failed}`);

// 将 API 记录添加到报告
reportGenerator.addApiCalls(apiCalls);
```

## 强制要求：环境检查

**⚠️ 重要：在执行任何测试操作之前，必须先确保 Playwright 环境已正确安装。**

### 检查步骤

1. 检查项目根目录下是否存在 `node_modules` 目录
   - 若不存在，执行 `npm install` 安装依赖
2. 检查 Playwright 浏览器是否已安装
   - 若未安装，执行 `npx playwright install --with-deps chromium`
   - 如无管理员权限，先执行 `npx playwright install chromium`
3. 可使用自动检查脚本：`node utils/env-checker.js`
   - 加 `--install` 参数自动安装缺失依赖：`node utils/env-checker.js --install`

### 环境要求

- Node.js >= 16
- npm >= 8
- Playwright >= 1.40
- Chromium 浏览器（通过 Playwright 安装）

**如果环境检查失败，必须先解决环境问题，不可跳过此步骤继续执行测试。**

---

## 强制要求：前置扫描

**⚠️ 重要：测试执行前必须完成以下扫描**

在生成测试用例之前，系统会自动执行以下扫描操作，无需人工干预：

### 1. PRD文档扫描
- 自动检索 `docs/prd/` 目录下的所有需求文档
- 解析PRD中的业务流程、接口定义、字段规范
- 提取测试场景和验收标准

### 2. 后端代码扫描
- 自动检索相关Controller、Service、VO代码
- 提取API接口路径、请求/响应参数
- 分析业务逻辑和约束条件

### 3. 前端代码扫描
- 自动检索相关页面组件代码
- 提取页面元素、交互逻辑
- 识别关键DOM结构和选择器
- 提取所有可交互元素(以下仅为部分示例)：
      ✅ 输入框（id/name/label/placeholder/type）
      ✅ 按钮（id/name/文本内容/onClick 事件）
      ✅ 表单（action/提交按钮/验证逻辑）
      ✅ 下拉框/复选框（选项值/默认状态）
      ✅ 弹窗/提示文本（id/文本内容）
- 识别组件核心交互逻辑(以下仅为部分示例)：
  ✅ 输入 → 提交 → 结果反馈（如登录、搜索）
  ✅ 点击 → 显示/隐藏（如弹窗、下拉菜单）
  ✅ 输入验证（必填、格式、长度）
- 梳理组件的用户操作链路

### 4. 读取公共配置（强制）

**⚠️ 所有测试执行必须基于 `config/test-config.json` 中的环境信息，禁止硬编码或猜测任何配置值。**

配置文件路径：`D:\WangYF31\project\ui-test\config\test-config.json`

#### 优先从配置文件读取项目信息：

| 配置项 | 配置文件路径 | 用途 |
|--------|-------------|------|
| 测试环境 URL | `environments.dev.baseUrl` | Playwright 访问的目标地址 |
| API 地址 | `environments.dev.apiBaseUrl` | API 请求的基础地址 |
| 默认环境 | `defaultEnvironment` | 决定使用哪个环境配置 |
| 登录租户 | `credentials.tenant.default` | 登录时填写的租户 |
| 登录用户名 | `credentials.accounts[0].username` | 登录时填写的用户名 |
| 登录密码 | `credentials.accounts[0].password` | 登录时填写的密码 |
| 租户输入框选择器 | `selectors.common.loginForm.tenantInput` | 定位租户输入框 |
| 用户名输入框选择器 | `selectors.common.loginForm.usernameInput` | 定位用户名输入框 |
| 密码输入框选择器 | `selectors.common.loginForm.passwordInput` | 定位密码输入框 |
| 登录按钮选择器 | `selectors.common.loginForm.loginButton` | 定位登录按钮 |
| 页面超时 | `timeouts.navigation` | 页面导航超时时间 |
| 元素超时 | `timeouts.element` | 元素等待超时时间 |
| 浏览器视窗 | `browser.viewport` | 浏览器窗口大小 |
| 无头模式 | `browser.headless` | 是否无头运行 |

#### 在 Playwright 脚本中的使用方式：

```javascript
// 所有脚本必须在开头加载配置
const ConfigLoader = require('../../../utils/config-loader');
const config = ConfigLoader.load();

// 使用配置中的环境信息
const baseUrl = config.environments[config.defaultEnvironment].baseUrl;
const { tenant, username, password } = {
  tenant: config.credentials.tenant.default,
  username: config.credentials.accounts[0].username,
  password: config.credentials.accounts[0].password
};

// 使用配置中的选择器
const loginSelectors = config.selectors.common.loginForm;
// tenantInput: "#tenantCode"
// usernameInput: "#loginName"
// passwordInput: "#password"
// loginButton: "button[type='submit']"

// 使用配置中的超时
const navigationTimeout = config.timeouts.navigation;
const elementTimeout = config.timeouts.element;

// 使用配置中的浏览器设置
const viewport = config.browser.viewport;
const headless = config.browser.headless;
```

#### 在 Playwright programmatic API 中的使用方式：

```javascript
const { chromium } = require('playwright');
const ConfigLoader = require('../../../utils/config-loader');
const config = ConfigLoader.load();

const envConfig = config.environments[config.defaultEnvironment];

const browser = await chromium.launch({ headless: config.browser.headless });
const context = await browser.newContext({
  viewport: config.browser.viewport,
  baseURL: envConfig.baseUrl
});
const page = await context.newPage();

// 登录时使用配置中的选择器和凭据
const loginSelectors = config.selectors.common.loginForm;
await page.fill(loginSelectors.tenantInput, config.credentials.tenant.default);
await page.fill(loginSelectors.usernameInput, config.credentials.accounts[0].username);
await page.fill(loginSelectors.passwordInput, config.credentials.accounts[0].password);
await page.click(loginSelectors.loginButton);
```

**绝对禁止：**
- 在脚本中硬编码 URL（如 `https://apqp-dev.catl.com`）
- 在脚本中硬编码用户名/密码
- 在脚本中硬编码选择器（如 `#tenantCode`）
- 使用非配置文件中的环境地址进行测试


### 5. 测试用例规范

#### 用例双格式存储

测试用例同时存储为两种格式，支持双向同步：

| 格式 | 文件位置 | 用途 |
|------|---------|------|
| **Excel** | `tests/modules/功能模块/cases/功能模块-测试用例.xlsx` | 人工审阅、评审、执行记录 |
| **JSON** | `tests/modules/功能模块/cases/*.json` | 机器执行，Playwright 脚本读取 |

**双向同步命令：**
```bash
# JSON → Excel（生成/更新 Excel 文件）
node utils/excel-case-generator.js <模块名称>

# Excel → JSON（从 Excel 同步回 JSON 用例文件）
node utils/excel-case-generator.js <模块名称> --sync

# Excel → JSON + 删除 Excel 中已不存在的旧 JSON
node utils/excel-case-generator.js <模块名称> --sync --force
```

#### Excel 表头定义（17列）

| 列名 | 说明 | 填写规范 |
|------|------|---------|
| **用例编号** | 唯一身份ID | 如 TC-SCP-001，按模块缩写+数字编号 |
| **测试模块** | 功能所属大板块 | 如 配置管理-供应商联系人 |
| **测试子项** | 模块下的具体功能点 | 如 列表查询、新增、手机号校验 |
| **优先级** | P0(高)/P1(中)/P2(低) | P0=冒烟测试必过，P1=核心功能，P2=边缘场景 |
| **测试维度** | 功能/兼容/性能/安全 | 从四个维度覆盖测试场景 |
| **测试方向** | 正向/反向/边界 | 正向=正常流程，反向=异常输入，边界=极值 |
| **前置条件** | 执行前必须满足的状态 | 每行一条，如"数据库中存在供应商编码为SUP001的记录" |
| **测试步骤** | 可操作的具体执行动作 | **pipe格式**：`序号|action|target|selector|value|expected`，每步一行（见下方说明） |
| **API端点** | 涉及的API接口 | 格式：`方法 URL 描述`，多个换行分隔，如 `POST /v1/add 新增联系人` |
| **依赖用例** | 前置依赖的用例ID | 逗号分隔，如 `TC-SCP-001,TC-SCP-002` |
| **输入数据** | 步骤中使用的具体数值 | 格式：`字段名：值`，每行一条 |
| **预期结果** | 可观察的、具体的系统反馈 | 每行一条，必须写可观测现象，禁止写"功能正常" |
| **实际结果** | 执行后真实发生的情况 | 执行时手工填写 |
| **测试结论** | 该用例是否通过 | 执行时勾选：通过/失败/阻塞 |
| **版本** | 用例版本号 | 如 1.0.0 |
| **作者** | 用例作者 | 如 Auto-Test |
| **状态** | 用例状态 | ready/draft/deprecated |

#### 测试步骤 pipe 格式说明

每行步骤格式：`序号|action|target|selector|value|expected`

| 字段 | 说明 | 示例 |
|------|------|------|
| 序号 | 步骤顺序号 | 1, 2, 3... |
| action | 动作类型 | navigate, click, input, select, clear, verify, waitForDownload, verifyFile, uploadFile, waitFor |
| target | 操作目标（人可读描述） | 新增按钮, 联系人姓名输入框 |
| selector | CSS选择器（机器可执行） | button:has-text('新增'), input[name='name'] |
| value | 输入值（仅input/select需要） | 张三, 13800138000 |
| expected | 该步骤的预期结果 | 弹出新增弹窗 |

**示例：**
```
1|navigate|供应商联系人菜单|||页面加载完成，列表区域可见
2|click|新增按钮|button:has-text('新增')||弹出新增供应商联系人弹窗
3|input|联系人姓名|input[name='contactPersonName']|张三|输入框显示文本'张三'
4|click|保存按钮|button:has-text('保存')||弹窗关闭，弹出成功提示
```

> selector 和 value 为空时留空即可，pipe 分隔符 `|` 不可省略

#### 用例 JSON 结构（标准字段）

```json
{
  "id": "TC-{模块缩写}-{序号}",
  "name": "{操作对象}-{测试场景}",
  "module": "所属功能模块",
  "priority": "P0|P1|P2",
  "dimension": "functional|compatibility|performance|security",
  "direction": "positive|negative|boundary",
  "status": "ready",
  "version": "1.0.0",
  "author": "Auto-Test",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z",

  "preconditions": [
    "具体的前置条件1（如：数据库中存在供应商编码为SUP001的记录）",
    "具体的前置条件2（如：当前用户拥有供应商联系人管理权限）"
  ],

  "steps": [
    {
      "order": 1,
      "action": "navigate|click|input|select|clear|verify|waitForDownload|verifyFile|uploadFile|waitFor",
      "target": "操作的页面元素描述（人可读）",
      "selector": "CSS选择器（机器可执行）",
      "value": "输入值（仅input/select/action需要）",
      "expected": "该步骤完成后的可观察现象（必须具体可验证）"
    }
  ],

  "expectedResults": [
    "最终预期结果1（具体可观察现象，如：列表中出现姓名为'张三'的记录）",
    "最终预期结果2（如：右上角弹出'保存成功'提示）"
  ],

  "testData": {
    "字段名": "测试值（步骤中通过引用使用，避免硬编码）"
  },

  "apiEndpoints": [
    {
      "method": "POST",
      "url": "/v1/supplier-contact-persons/add",
      "description": "新增供应商联系人"
    }
  ],

  "dependencies": ["TC-SCP-001"]
}
```

#### 字段撰写规则

**preconditions（前置条件）**：必须写具体、可验证的前提状态，不能用"用户已登录"这种泛泛描述
- ✅ `数据库中存在供应商编码为SUP2026001的记录`
- ✅ `当前用户拥有"供应商联系人管理"菜单权限`
- ❌ `用户已登录系统`（太泛）

**steps[].expected（步骤预期结果）**：必须写可观察的具体现象，不能写操作本身
- ✅ `弹出"新增供应商联系人"弹窗，弹窗标题显示"新增"`
- ✅ `列表中第一行姓名列显示"张三"，手机号列显示"13800138000"`
- ❌ `页面加载成功`（模糊）
- ❌ `可输入手机号`（描述的是能力而非结果）

**expectedResults（用例最终预期结果）**：从功能/兼容/性能/安全四个维度考虑，每条必须可观察可验证
- ✅ `列表中出现联系人姓名为"张三"的行，手机号列显示"13800138000"`
- ✅ `右上角弹出绿色成功提示，文字包含"保存成功"`
- ❌ `操作成功`（模糊）

**testData（测试数据）**：集中管理输入数据，步骤中的 value 应与 testData 对应，方便维护

#### 用例设计维度

生成测试用例时必须从以下四个维度考虑，并标注 `dimension` 和 `direction` 字段：

| 维度 | dimension | 说明 | 示例方向 |
|------|-----------|------|----------|
| **功能** | `functional` | 核心业务逻辑是否正确 | 正向：CRUD正常流程；反向：必填项为空、格式校验 |
| **兼容** | `compatibility` | 不同环境/数据下是否正常 | 正向：大数据量列表渲染；反向：特殊字符输入 |
| **性能** | `performance` | 响应时间、资源占用 | 边界：1万条数据导出耗时；正向：列表分页加载速度 |
| **安全** | `security` | 权限、注入、越权 | 反向：无权限用户访问；反向：XSS脚本注入输入框 |

每个功能模块至少覆盖：

| 方向 | direction | 最低用例数 | 说明 |
|------|-----------|-----------|------|
| **正向** | `positive` | 每个核心操作1个 | 正常流程端到端通过 |
| **反向** | `negative` | 每个核心操作1-2个 | 异常输入、权限不足、必填校验 |
| **边界** | `boundary` | 关键字段1个 | 最大长度、空值、特殊字符 |

#### 用例命名规范

- ID格式：`TC-{模块缩写3-4字母}-{3位序号}`，如 `TC-SCP-001`
- 名称格式：`{操作对象}-{测试场景}`，如 `供应商联系人-新增正常流程`、`供应商联系人-手机号格式校验`



## 强制要求：用户确认环节

**⛔ MUST STOP HERE -- 绝对不能跳过此步骤 ⛔**

在生成测试用例之后、执行任何 Playwright 脚本之前，你必须：

### 确认流程

1. **展示测试用例摘要**：向用户清晰地展示所有生成的测试用例，包括：
   - 用例 ID、名称、优先级
   - 测试步骤概要
   - 预期结果

2. **明确询问用户**："以上测试用例是否符合您的需求？是否需要修改？是否可以开始测试？"

3. **根据用户回复决定后续操作**：
   - **用户确认（yes/确认/没问题/符合需求）**：继续生成 Playwright 脚本并执行测试
   - **用户要求修改**：根据用户反馈修改测试用例 JSON 文件，修改后再次展示用例并询问确认
   - **用户拒绝/不满意**：停止流程，不生成脚本，不执行测试

### 重要规则

- **绝对不能在用户未确认的情况下自动执行测试**
- 即使用户在之前的对话中表示过"直接执行"，也必须在展示用例后再次确认
- 每次修改用例后都需要重新确认
- 此规则适用于所有流程：新建模块、更新模块、回归测试

---

## 使用说明

当用户提出测试需求时，遵循以下流程：

1. **环境检查**：检查 Playwright 环境是否就绪（见"强制要求：环境检查"）
2. **分析需求**：理解用户需要测试的功能或场景
3. **前置扫描**：扫描 PRD 文档、后端代码、前端代码、读取公共配置
4. **检查/生成测试用例**：根据扫描结果检查现有用例或生成新用例（tests/modules/功能模块/cases）
5. **【强制确认】展示测试用例并询问用户确认** ← 必须暂停，详见"强制要求：用户确认环节"
6. **检查/生成脚本**：在 tests/modules/功能模块/scripts/ 目录下生成或更新 Playwright 脚本（仅在用户确认后）
7. **执行测试**：运行 Playwright 测试并收集结果（仅在用户确认后）
8. **生成报告**：必须要创建详细的测试报告并将截图放在报告中，把报告放在 tests/modules/功能模块/docs/report
9. **返回结果**：向用户展示测试结果和报告

### 功能模块目录结构规范

```
tests/modules/功能模块名称/
├── cases/                    # 测试用例目录 (*.json)
├── scripts/                  # 测试脚本目录 (*.spec.js)
└── docs/
    ├── report/               # 测试报告目录 (*.html, *.md)
    ├── screenshots/          # 测试截图目录 (*.png)
    └── downloads/            # 下载文件目录 (*.xlsx, *.pdf等)
```

### 文件存放规范
- **测试用例**: `tests/modules/功能模块/cases/*.json`
- **测试脚本**: `tests/modules/功能模块/scripts/*.spec.js`
- **测试报告**: `tests/modules/功能模块/docs/report/`
- **测试截图**: `tests/modules/功能模块/docs/screenshots/`
- **下载文件**: `tests/modules/功能模块/docs/downloads/`

### 报告命名格式
- HTML报告: `[功能模块]测试报告[时间].html`
  - 示例: `供应商联系人测试报告2026-03-23T10-55-26.html`
- Markdown报告: `[功能模块]测试报告[时间].md`
  - 示例: `供应商联系人测试报告2026-03-23T10-55-26.md`
- 截图文件: `[序号]-[描述].png`
  - 示例: `01-login-page.png`, `07-save-success.png`

### 报告内容组成
测试报告应包含以下内容：
1. **测试概览** - 模块名称、PRD文档、生成时间、通过率
2. **测试统计** - 总测试项、通过数、失败数、警告数
3. **API调用记录** 📡 - 所有API请求的详细记录
   - 请求方法、URL、请求体
   - 响应状态码、响应体（支持折叠查看）
   - API调用统计（总数、成功、失败）
4. **API校验结果** - API测试验证详情
5. **文件下载校验** - 导出文件验证（如Excel导出）
6. **UI校验结果** - 页面元素验证
7. **测试截图** - 关键步骤的页面截图（引用自 screenshots 目录）

## 脚本管理规则

### 脚本位置规范
- 测试脚本统一存放于 `tests/modules/功能模块名称/scripts/` 目录
- 脚本命名格式：`[功能模块].spec.js`
- 示例：`login.spec.js`、`checkout.spec.js`、`api-test.spec.js`

### 脚本生成规则
当需要生成新脚本时：
1. 使用 `agents/script-generator.js` 从 JSON 用例自动生成 Playwright 脚本
2. 脚本自动包含 ConfigLoader（从 test-config.json 读取环境配置）、ApiLogger（API 监听）、截图捕获
3. 根据用例步骤中的 action/target/selector/value 自动生成对应的 Playwright 操作代码

### 脚本修改规则
当需要修改现有脚本时：
1. 先读取现有脚本内容
2. 分析需要修改的部分
3. 保持原有结构，仅修改相关测试逻辑
4. 更新测试描述和预期结果

## 执行与报告流程

**系统自动执行：**

```
================================================================================
🚀 ui-test
📝 功能描述: 物料开发导出功能
================================================================================

【步骤0】环境检查（强制）...

⚙️ 步骤0.1: 检查 Playwright 环境...
   ✅ node_modules: 存在
   ✅ playwright: 已安装
   ✅ 浏览器: 已安装

   （如环境缺失，执行 node utils/env-checker.js --install 自动安装）

【步骤1】前置扫描（强制）...

📄 步骤1.1: 扫描PRD文档...
   ✅ 检索路径: docs/prd/
   ✅ 找到匹配文档: 1 个
      - 物料开发流程PRD.md

💻 步骤1.2: 扫描后端代码...
   ✅ 检索路径: backend/
   ✅ 找到相关代码: 3 个
      - MaterialController.java
      - MaterialService.java
      - MaterialExportVO.java

🖥️ 步骤1.3: 扫描前端代码...
   ✅ 检索路径: frontend/
   ✅ 找到相关代码: 2 个
      - MaterialExportPage.tsx
      - materialExportService.ts

⚙️ 步骤1.4: 读取公共配置（强制，从 config/test-config.json）...
   ✅ 配置文件: config/test-config.json
   ✅ 环境: dev
   ✅ Base URL: https://apqp-dev.catl.com/
   ✅ 登录账号: 1 个 (60298492)
   ✅ 登录选择器: 已配置 (tenantInput, usernameInput, passwordInput, loginButton)
   ✅ 超时配置: 已配置 (navigation: 60000ms, element: 5000ms)

📁 步骤2: 创建模块目录结构...
   ✅ 模块路径: tests/modules/物料开发导出功能

📝 步骤3: 生成测试用例...
   ✅ 生成了 4 个测试用例
      1. 物料开发导出_基础功能测试 (TC-MN1IBPDZ-C17V0) - P0
      2. 物料开发导出_数据导出测试 (TC-MN1IBPE0-H4RYS) - P1
      3. 物料开发导出_导出格式验证 (TC-MN1IBPE0-RZ84V) - P1
      4. 物料开发导出_边界值测试 (TC-MN1IBPE0-XXX) - P0

⛔ ========== 用户确认环节（必须暂停）==========

请向用户展示以上测试用例，并询问：
  "以上测试用例是否符合您的需求？是否需要修改？是否可以开始测试？"

⚠️ 绝对不能跳过此确认步骤直接执行后续操作！

⛔ ================================================

🔗 步骤5: 分析用例依赖关系并调整...
   ✅ 执行层级: 2 层
   ✅ 依赖关系: 4 个

🔄 步骤6: 生成/更新Playwright脚本...
   ✅ 主脚本: tests/modules/物料开发导出功能/scripts/material-flow-export.spec.js
   ✅ 独立脚本: 4 个

💾 步骤7: 执行脚本生成报告...
   ✅ 报告放入: tests/modules/功能模块名称/docs/report/
   ✅ 截图放入: tests/modules/功能模块名称/docs/screenshots/
   ✅ 下载文件放入: tests/modules/功能模块名称/docs/downloads/
   ✅ 包含截图，API监听情况，文件下载情况

================================================================================
✅ 测试完成！
================================================================================

📂 模块位置: tests/modules/物料开发导出功能
📋 用例数量: 4
📄 用例位置: tests/modules/物料开发导出功能/cases/
🔗 执行层级: 2

⚠️ 【用户操作】请确认测试用例是否满足需求，确认后方可执行测试
```

### 测试执行命令
```bash
# 使用 Playwright 执行单个测试文件
npx playwright test tests/modules/功能模块/scripts/xxx.spec.js

# 使用 CLI 回归测试
node cli.js regression -m <模块名称>

# 使用 CLI 运行指定模块
node cli.js run -m <模块名称>
```

## 项目目录结构

**基于实际文件结构：**

```
.opencode/skills/ui-test/
├── SKILL.md                          # 技能文档（本文件）
├── cli.js                            # 命令行入口
├── playwright.config.js              # Playwright配置文件
├── config/                           # 全局配置
│   └── test-config.json              # 【必需】公共配置文件（登录信息等）
├── utils/                            # 【工具脚本目录】
│   ├── api-logger.js                 # API日志记录器
│   ├── code-analyzer.js              # 代码分析器
│   ├── config-loader.js              # 配置加载器
│   ├── env-checker.js                # Playwright环境检测与安装工具
│   ├── excel-case-generator.js       # Excel↔JSON用例双向同步工具
│   ├── prd-parser.js                 # PRD解析器
│   └── report-generator.js           # 报告生成器
├── agents/                           # 【智能代理目录】
│   ├── module-generator.js           # 模块生成器（主入口）
│   ├── module-updater.js             # 模块更新器
│   ├── script-generator.js           # 脚本生成器
│   ├── recording-assistant.js        # 录制辅助
│   ├── regression-runner.js          # 回归测试执行器
│   └── resource-finder.js            # 资源检索器
├── models/                           # 【数据模型目录】
│   ├── test-case.js                  # 测试用例模型
│   └── dependency-manager.js         # 依赖管理器
├── tests/modules/                    # 【测试模块目录】
│   └── {功能模块名称}/               # 模块名称（如：配置管理-供应商联系人）
│       ├── cases/                    # 【测试用例目录】*.json + *.xlsx
│       │   ├── TC-XXX-xxx.json
│       │   └── {模块名}-测试用例.xlsx
│       ├── scripts/                  # 【测试脚本目录】*.spec.js
│       └── docs/                     # 【文档目录】
│           ├── report/               # 【HTML报告输出目录】*.html, *.md
│           ├── screenshots/          # 【测试截图目录】*.png
│           └── downloads/            # 【下载文件目录】*.xlsx, *.pdf等
└── package.json                      # 项目依赖配置

metadata:
  department: CATLND-BP&IT-DEVC2
  author: wangyf31
  version: 1.1.0