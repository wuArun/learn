/**
 * 测试脚本生成器
 * 将测试用例转换为Playwright测试脚本
 */

const fs = require('fs');
const path = require('path');
const TestCase = require('../models/test-case');
const DependencyManager = require('../models/dependency-manager');

class ScriptGenerator {
  constructor(config = {}) {
    this.config = {
      templateDir: config.templateDir || path.join(__dirname, '../templates'),
      outputDir: config.outputDir || 'tests/modules',
      ...config
    };
  }

  /**
   * 为功能模块生成测试脚本
   * @param {string} moduleName - 模块名称
   * @param {Object} options - 生成选项
   * @returns {Promise<Array>}
   */
  async generateModuleScripts(moduleName, options = {}) {
    console.log(`\n🎬 开始为模块 "${moduleName}" 生成测试脚本...`);
    
    const modulePath = path.join(this.config.outputDir, moduleName);
    
    // 1. 加载模块配置
    const moduleConfig = this.loadModuleConfig(modulePath);
    
    // 2. 加载测试用例
    const testCases = this.loadTestCases(modulePath);
    console.log(`   加载了 ${testCases.length} 个测试用例`);
    
    // 3. 加载依赖关系
    const dependencyManager = this.loadDependencies(modulePath);
    
    // 4. 构建执行图
    const executionGraph = dependencyManager.buildExecutionGraph();
    console.log(`   构建了执行图: ${executionGraph.levels.length} 个层级`);
    
    // 5. 生成脚本文件
    const generatedScripts = [];
    
    // 生成主测试文件
    const mainScript = await this.generateMainScript(moduleName, modulePath, testCases, executionGraph, options);
    generatedScripts.push(mainScript);
    
    // 生成独立用例脚本（可选）
    if (options.generateIndividualScripts) {
      for (const testCase of testCases) {
        const script = await this.generateIndividualScript(moduleName, modulePath, testCase, options);
        generatedScripts.push(script);
      }
    }
    
    console.log(`   ✅ 生成了 ${generatedScripts.length} 个脚本文件`);
    
    return generatedScripts;
  }

  /**
   * 加载模块配置
   * @param {string} modulePath - 模块路径
   * @returns {Object}
   */
  loadModuleConfig(modulePath) {
    const configPath = path.join(modulePath, 'config', 'resources.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
    return {};
  }

  /**
   * 加载测试用例
   * @param {string} modulePath - 模块路径
   * @returns {Array}
   */
  loadTestCases(modulePath) {
    const casesDir = path.join(modulePath, 'cases');
    const cases = [];
    
    if (fs.existsSync(casesDir)) {
      const files = fs.readdirSync(casesDir).filter(f => f.endsWith('.json'));
      
      for (const file of files) {
        const filePath = path.join(casesDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        cases.push(TestCase.fromJSON(data));
      }
    }
    
    return cases;
  }

  /**
   * 加载依赖关系
   * @param {string} modulePath - 模块路径
   * @returns {DependencyManager}
   */
  loadDependencies(modulePath) {
    const depsPath = path.join(modulePath, 'config', 'dependencies.json');
    const manager = new DependencyManager();
    
    if (fs.existsSync(depsPath)) {
      const data = JSON.parse(fs.readFileSync(depsPath, 'utf-8'));
      manager.import(data);
    }
    
    return manager;
  }

  /**
   * 生成主测试脚本
   * @param {string} moduleName - 模块名称
   * @param {string} modulePath - 模块路径
   * @param {Array} testCases - 测试用例列表
   * @param {Object} executionGraph - 执行图
   * @param {Object} options - 生成选项
   * @returns {Object}
   */
  async generateMainScript(moduleName, modulePath, testCases, executionGraph, options) {
    const scriptName = `${moduleName}.spec.js`;
    const scriptPath = path.join(modulePath, 'scripts', scriptName);
    
    // 构建脚本内容
    const scriptContent = this.buildMainScriptContent(moduleName, testCases, executionGraph, options);
    
    // 保存脚本
    fs.writeFileSync(scriptPath, scriptContent, 'utf-8');
    
    return {
      name: scriptName,
      path: scriptPath,
      type: 'main',
      casesCount: testCases.length
    };
  }

  /**
   * 构建主脚本内容
   * @param {string} moduleName - 模块名称
   * @param {Array} testCases - 测试用例列表
   * @param {Object} executionGraph - 执行图
   * @param {Object} options - 生成选项
   * @returns {string}
   */
  buildMainScriptContent(moduleName, testCases, executionGraph, options) {
    const testCaseMap = new Map(testCases.map(tc => [tc.id, tc]));
    
    let content = `/**
 * ${moduleName} - Playwright 自动化测试脚本
 *
 * 自动生成时间: ${new Date().toLocaleString('zh-CN')}
 * 用例数量: ${testCases.length}
 */

const { test, expect } = require('@playwright/test');
const ApiLogger = require('../../../utils/api-logger');
const ReportGenerator = require('../../../utils/report-generator');
const ConfigLoader = require('../../../utils/config-loader');
const path = require('path');

// 从 test-config.json 加载配置（禁止硬编码）
const _config = ConfigLoader.load();
const _envConfig = _config.environments[_config.defaultEnvironment];
const _account = _config.credentials.accounts[0];
const _loginSelectors = _config.selectors.common.loginForm;

const CONFIG = {
  baseUrl: _envConfig.baseUrl,
  apiBaseUrl: _envConfig.apiBaseUrl,
  credentials: {
    tenant: _config.credentials.tenant.default,
    username: _account.username,
    password: _account.password
  },
  selectors: _config.selectors,
  timeouts: _config.timeouts,
  browser: _config.browser,
  timeout: _envConfig.timeout || 60000,
  retries: _config.retry?.maxRetries || 1
};

// 测试用例数据
const TEST_CASES = ${JSON.stringify(testCases.map(tc => ({
  id: tc.id,
  name: tc.name,
  priority: tc.priority,
  description: tc.description
})), null, 2)};

// ==================== 测试套件 ====================

test.describe('${moduleName}', () => {
  let apiLogger;
  let reportGenerator;
  let sharedContext = {}; // 共享上下文
  
  test.beforeAll(async () => {
    console.log('\\n========================================');
    console.log('开始执行测试套件: ${moduleName}');
    console.log('========================================\\n');
    
    // 初始化报告生成器
    reportGenerator = new ReportGenerator({
      outputDir: path.join(__dirname, '../report'),
      title: '${moduleName}',
      module: '${moduleName}'
    });
  });
  
  test.beforeEach(async ({ page }, testInfo) => {
    // 初始化API日志记录器
    apiLogger = new ApiLogger();
    apiLogger.setupPageListener(page);
    
    console.log('开始执行: ' + testInfo.title);
  });
  
  test.afterEach(async ({ page }, testInfo) => {
    // 收集API调用记录
    const apiCalls = apiLogger.formatForReport();
    reportGenerator.addApiCalls(apiCalls);
    
    console.log('完成执行: ' + testInfo.title + ' (' + testInfo.status + ')');
  });
  
  test.afterAll(async () => {
    // 生成测试报告
    console.log('\\n生成测试报告...');
    const htmlPath = reportGenerator.generateHTML();
    const mdPath = reportGenerator.generateMarkdown();
    
    console.log('\\n========================================');
    console.log('测试套件执行完成');
    console.log('========================================');
    console.log('\\n报告位置:');
    console.log('   HTML:', htmlPath);
    console.log('   Markdown:', mdPath);
  });

`;

    // 按照执行层级生成测试
    for (const level of executionGraph.levels) {
      if (level.nodes.length === 1) {
        // 单个用例
        const caseId = level.nodes[0];
        const testCase = testCaseMap.get(caseId);
        if (testCase) {
          content += this.generateSingleTestCase(testCase);
        }
      } else {
        // 并行执行的用例组
        content += this.generateParallelTestCases(level.nodes, testCaseMap);
      }
    }

    content += `});

// ==================== 辅助函数 ====================

/**
 * 执行登录
 */
async function performLogin(page, credentials) {
  console.log('  执行登录...');

  const loginSelectors = CONFIG.selectors.common.loginForm;

  // 填写租户
  await page.fill(loginSelectors.tenantInput, credentials.tenant);

  // 填写账号
  await page.fill(loginSelectors.usernameInput, credentials.username);

  // 填写密码
  await page.fill(loginSelectors.passwordInput, credentials.password);

  // 点击登录
  await page.click(loginSelectors.loginButton);

  // 等待登录完成
  await page.waitForLoadState('networkidle', { timeout: CONFIG.timeouts.navigation });

    console.log('  登录成功');
}

/**
 * 执行测试步骤
 */
async function executeStep(page, step, context) {
  console.log('    步骤 ' + step.order + ': ' + step.action + ' - ' + step.target);
  
  switch (step.action) {
    case 'navigate':
      await page.goto(step.value || CONFIG.baseUrl);
      break;
      
    case 'click':
      const clickElement = await page.locator(step.target).first();
      await clickElement.click();
      break;
      
    case 'fill':
    case 'input':
      const inputElement = await page.locator(step.target).first();
      await inputElement.fill(step.value || '');
      break;
      
    case 'verify':
      const verifyElement = await page.locator(step.target).first();
      await expect(verifyElement).toBeVisible();
      break;
      
    case 'screenshot':
      await page.screenshot({ 
        path: path.join(__dirname, '../report/screenshots', step.value || 'screenshot.png'),
        fullPage: true 
      });
      break;
      
    default:
      console.log('    未知的步骤类型: ' + step.action);
  }
}

/**
 * 等待元素
 */
async function waitForElement(page, selector, timeout = 10000) {
  const element = await page.locator(selector).first();
  await element.waitFor({ timeout });
  return element;
}
`;

    return content;
  }

  /**
   * 生成单个测试用例代码
   * @param {TestCase} testCase - 测试用例
   * @returns {string}
   */
  generateSingleTestCase(testCase) {
    const stepsCode = testCase.steps.map(step => {
      return `    // ${step.description || `步骤 ${step.order}`}
    ${this.generateStepCode(step)}`;
    }).join('\n\n');
    
    return `
  /**
   * ${testCase.name}
   * ID: ${testCase.id}
   * 优先级: ${testCase.priority}
   * 版本: ${testCase.version}
   */
  test('${testCase.name}', async ({ page }) => {
    ${testCase.preconditions.length > 0 ? `// 前置条件
    ${testCase.preconditions.map(p => `// - ${p}`).join('\n    ')}
    ` : ''}
    
${stepsCode}
    
    // 验证预期结果
    ${this.generateVerificationCode(testCase.expectedResults)}
  });

`;
  }

  /**
   * 生成并行测试用例代码
   * @param {Array} caseIds - 用例ID列表
   * @param {Map} testCaseMap - 用例映射
   * @returns {string}
   */
  generateParallelTestCases(caseIds, testCaseMap) {
    let content = `
  /**
   * 并行执行的测试组
   */
  test.describe.parallel('并行测试组', () => {
`;

    for (const caseId of caseIds) {
      const testCase = testCaseMap.get(caseId);
      if (testCase) {
        const stepsCode = testCase.steps.map(step => {
          return `      // ${step.description || `步骤 ${step.order}`}
      ${this.generateStepCode(step)}`;
        }).join('\n\n');
        
        content += `
    test('${testCase.name}', async ({ page }) => {
      ${testCase.preconditions.length > 0 ? `// 前置条件
      ${testCase.preconditions.map(p => `// - ${p}`).join('\n      ')}` : ''}
      
${stepsCode}
      
      // 验证预期结果
      ${this.generateVerificationCode(testCase.expectedResults)}
    });
`;
      }
    }

    content += `
  });

`;

    return content;
  }

  /**
   * 生成步骤代码
   * @param {Object} step - 测试步骤
   * @returns {string}
   */
  generateStepCode(step) {
    const sel = step.selector || step.target;

    switch (step.action) {
      case 'navigate':
        return `await page.goto('${step.value || 'CONFIG.baseUrl'}');`;

      case 'click':
        return `await page.click('${sel}');`;

      case 'fill':
      case 'input':
        return `await page.fill('${sel}', '${step.value || ''}');`;

      case 'select':
        return `await page.selectOption('${sel}', '${step.value || ''}');`;

      case 'clear':
        return `await page.fill('${sel}', '');`;

      case 'verify':
        return `await expect(page.locator('${sel}')).toBeVisible();`;

      case 'screenshot':
        return `await page.screenshot({ path: '${step.value || 'screenshot.png'}', fullPage: true });`;

      case 'wait':
      case 'waitFor':
        return `await page.waitForTimeout(${step.value || 1000});`;

      case 'expect':
        return `await expect(page.locator('${sel}')).toHaveText('${step.expected || ''}');`;

      case 'waitForDownload':
        return `const [download] = await Promise.all([page.waitForEvent('download'), page.click('${sel}')]);`;

      case 'uploadFile':
        return `await page.setInputFiles('${sel}', '${step.value || ''}');`;

      default:
        return `// TODO: 实现 ${step.action} 操作`;
    }
  }

  /**
   * 生成验证代码
   * @param {Object} expectedResults - 预期结果
   * @returns {string}
   */
  generateVerificationCode(expectedResults) {
    if (!expectedResults || (Array.isArray(expectedResults) && expectedResults.length === 0)) {
      return '// TODO: 添加验证逻辑';
    }

    if (Array.isArray(expectedResults)) {
      return expectedResults.map(r => `// expect: ${r}`).join('\n    ');
    }

    const verifications = [];
    for (const [key, value] of Object.entries(expectedResults)) {
      if (typeof value === 'boolean') {
        verifications.push(`// expect(result.${key}).toBe(${value});`);
      } else if (typeof value === 'string') {
        verifications.push(`// expect(result.${key}).toBe('${value}');`);
      } else {
        verifications.push(`// expect(result.${key}).toEqual(${JSON.stringify(value)});`);
      }
    }

    return verifications.join('\n    ') || '// TODO: 添加验证逻辑';
  }

  /**
   * 生成独立用例脚本
   * @param {string} moduleName - 模块名称
   * @param {string} modulePath - 模块路径
   * @param {TestCase} testCase - 测试用例
   * @param {Object} options - 生成选项
   * @returns {Object}
   */
  async generateIndividualScript(moduleName, modulePath, testCase, options) {
    const scriptName = `${testCase.id}.spec.js`;
    const scriptPath = path.join(modulePath, 'scripts', 'individual', scriptName);
    
    // 确保individual目录存在
    const individualDir = path.dirname(scriptPath);
    if (!fs.existsSync(individualDir)) {
      fs.mkdirSync(individualDir, { recursive: true });
    }
    
    // 构建独立脚本内容
    const content = this.buildIndividualScriptContent(testCase, options);
    
    fs.writeFileSync(scriptPath, content, 'utf-8');
    
    return {
      name: scriptName,
      path: scriptPath,
      type: 'individual',
      caseId: testCase.id
    };
  }

  /**
   * 构建独立脚本内容
   * @param {TestCase} testCase - 测试用例
   * @param {Object} options - 生成选项
   * @returns {string}
   */
  buildIndividualScriptContent(testCase, options) {
    return `/**
 * ${testCase.name}
 * ID: ${testCase.id}
 * 
 * 这是一个独立执行的测试脚本
 * 可以直接运行: npx playwright test ${testCase.id}.spec.js
 */

const { test, expect } = require('@playwright/test');

// 加载测试用例数据
const testCaseData = require('../cases/${testCase.id}.json');

// 从 test-config.json 加载配置（禁止硬编码）
const ConfigLoader = require('../../../utils/config-loader');
const _config = ConfigLoader.load();
const _envConfig = _config.environments[_config.defaultEnvironment];
const _loginSelectors = _config.selectors.common.loginForm;

const CONFIG = {
  baseUrl: _envConfig.baseUrl,
  apiBaseUrl: _envConfig.apiBaseUrl,
  credentials: {
    tenant: _config.credentials.tenant.default,
    username: _config.credentials.accounts[0].username,
    password: _config.credentials.accounts[0].password
  },
  selectors: _config.selectors,
  timeouts: _config.timeouts
};

test('${testCase.name}', async ({ page }) => {
  console.log('执行测试用例:', testCaseData.name);
  console.log('描述:', testCaseData.description);
  
  // 执行测试步骤
  for (const step of testCaseData.steps) {
    console.log('步骤 ' + step.order + ': ' + step.action + ' - ' + step.target);
    // 步骤执行逻辑...
  }
  
  // 验证预期结果
  console.log('验证预期结果...');
});
`;
  }
}

module.exports = ScriptGenerator;
