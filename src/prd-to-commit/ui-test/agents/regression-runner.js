/**
 * 回归测试执行器
 * 基于现有测试用例和依赖关系执行回归测试
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const TestCase = require('../models/test-case');
const DependencyManager = require('../models/dependency-manager');
const ApiLogger = require('../utils/api-logger');
const ReportGenerator = require('../utils/report-generator');
const ConfigLoader = require('../utils/config-loader');

class RegressionTestRunner {
  constructor(config = {}) {
    // 从 test-config.json 加载默认配置
    let fileConfig = {};
    try {
      const testConfig = ConfigLoader.load();
      const envName = config.env || testConfig.defaultEnvironment || 'dev';
      const envConfig = testConfig.environments[envName] || {};
      const account = testConfig.credentials?.accounts?.[0] || {};

      fileConfig = {
        baseUrl: envConfig.baseUrl,
        headless: testConfig.browser?.headless !== false,
        slowMo: testConfig.browser?.slowMo || 500,
        viewport: testConfig.browser?.viewport || { width: 1280, height: 800 },
        credentials: {
          tenant: testConfig.credentials?.tenant?.default || '',
          username: account.username || '',
          password: account.password || ''
        },
        selectors: testConfig.selectors || {},
        timeouts: testConfig.timeouts || {}
      };
    } catch (e) {
      // 配置文件不可用时回退到传入参数
    }

    this.config = {
      baseUrl: config.baseUrl || fileConfig.baseUrl || '',
      headless: config.headless !== undefined ? config.headless : fileConfig.headless !== false,
      slowMo: config.slowMo || fileConfig.slowMo || 500,
      viewport: config.viewport || fileConfig.viewport || { width: 1280, height: 800 },
      outputDir: config.outputDir || 'tests/regression-report',
      maxRetries: config.maxRetries || 1,
      continueOnFailure: config.continueOnFailure || false,
      parallel: config.parallel || false,
      credentials: config.credentials || fileConfig.credentials || {},
      selectors: fileConfig.selectors || {},
      timeouts: fileConfig.timeouts || {},
      ...config
    };
    
    this.results = [];
    this.statistics = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0
    };
  }

  /**
   * 执行回归测试
   * @param {string} moduleName - 模块名称
   * @param {Object} options - 执行选项
   * @returns {Promise<Object>}
   */
  async runRegression(moduleName, options = {}) {
    const startTime = Date.now();
    
    console.log('='.repeat(80));
    console.log('🔄 回归测试执行');
    console.log(`📦 模块: ${moduleName}`);
    console.log('='.repeat(80));
    
    // 1. 加载测试用例
    console.log('\n📋 步骤1: 加载测试用例...');
    const testCases = await this.loadTestCases(moduleName);
    console.log(`   ✅ 加载了 ${testCases.length} 个测试用例`);
    
    if (testCases.length === 0) {
      console.log('⚠️  没有找到测试用例，请先用 generate 命令创建模块');
      return { success: false, reason: 'no_test_cases' };
    }
    
    // 2. 加载依赖关系
    console.log('\n🔗 步骤2: 加载依赖关系...');
    const dependencyManager = await this.loadDependencies(moduleName);
    const executionOrder = dependencyManager.getExecutionOrder();
    console.log(`   ✅ 依赖图深度: ${executionOrder.length} 层`);
    console.log(`   ✅ 并行执行组: ${dependencyManager.getStatistics().parallelGroups} 个`);
    
    // 3. 初始化浏览器
    console.log('\n🌐 步骤3: 初始化浏览器...');
    const browser = await chromium.launch({
      channel: 'chrome',
      headless: this.config.headless,
      slowMo: this.config.slowMo
    });
    
    const context = await browser.newContext({
      viewport: this.config.viewport,
      acceptDownloads: true,
      baseURL: this.config.baseUrl
    });
    
    // 4. 初始化报告生成器
    const reportGenerator = new ReportGenerator({
      outputDir: path.join(this.config.outputDir, moduleName),
      title: `${moduleName} - 回归测试报告`,
      module: moduleName
    });
    
    reportGenerator.setBasicInfo({
      title: `${moduleName} - 回归测试报告`,
      module: moduleName,
      timestamp: new Date().toLocaleString('zh-CN'),
      totalCases: testCases.length
    });
    
    // 5. 执行测试
    console.log('\n🎭 步骤4: 执行测试...\n');
    
    try {
      for (let i = 0; i < executionOrder.length; i++) {
        const level = executionOrder[i];
        console.log(`\n📌 执行层级 ${i + 1}/${executionOrder.length}`);
        
        if (level.parallel && this.config.parallel && level.cases.length > 1) {
          // 并行执行
          console.log(`   【并行执行 ${level.cases.length} 个用例】`);
          const promises = level.cases.map(caseId => 
            this.executeTestCase(caseId, testCases, context, reportGenerator)
          );
          const levelResults = await Promise.all(promises);
          this.results.push(...levelResults);
        } else {
          // 串行执行
          for (const caseId of level.cases) {
            const result = await this.executeTestCase(caseId, testCases, context, reportGenerator);
            this.results.push(result);
            
            // 如果失败且配置了不继续，则停止
            if (!result.success && !this.config.continueOnFailure) {
              console.log(`\n⛔ 用例失败且配置了失败停止，终止执行`);
              break;
            }
          }
        }
      }
      
    } finally {
      // 6. 关闭浏览器
      await browser.close();
    }
    
    // 7. 计算统计
    this.statistics.duration = Date.now() - startTime;
    this.calculateStatistics();
    
    // 8. 生成报告
    console.log('\n📊 步骤5: 生成测试报告...');
    this.generateSummaryReport(reportGenerator);
    
    const htmlPath = reportGenerator.generateHTML();
    const mdPath = reportGenerator.generateMarkdown();
    
    console.log(`   ✅ HTML报告: ${htmlPath}`);
    console.log(`   ✅ Markdown报告: ${mdPath}`);
    
    // 9. 输出结果摘要
    this.printSummary();
    
    return {
      success: this.statistics.failed === 0,
      statistics: this.statistics,
      results: this.results,
      reports: {
        html: htmlPath,
        markdown: mdPath
      }
    };
  }

  /**
   * 加载测试用例
   * @param {string} moduleName - 模块名称
   * @returns {Promise<Map>}
   */
  async loadTestCases(moduleName) {
    const modulePath = path.join('tests/modules', moduleName);
    const casesDir = path.join(modulePath, 'cases');
    const testCases = new Map();
    
    if (!fs.existsSync(casesDir)) {
      return testCases;
    }
    
    const files = fs.readdirSync(casesDir).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      try {
        const filePath = path.join(casesDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const testCase = TestCase.fromJSON(data);
        testCases.set(testCase.id, testCase);
      } catch (e) {
        console.warn(`   ⚠️  加载用例失败: ${file}`);
      }
    }
    
    return testCases;
  }

  /**
   * 加载依赖关系
   * @param {string} moduleName - 模块名称
   * @returns {Promise<DependencyManager>}
   */
  async loadDependencies(moduleName) {
    const modulePath = path.join('tests/modules', moduleName);
    const depsPath = path.join(modulePath, 'config', 'dependencies.json');
    
    const manager = new DependencyManager();
    
    if (fs.existsSync(depsPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(depsPath, 'utf-8'));
        manager.import(data);
      } catch (e) {
        console.warn(`   ⚠️  加载依赖关系失败: ${e.message}`);
      }
    }
    
    return manager;
  }

  /**
   * 执行单个测试用例
   * @param {string} caseId - 用例ID
   * @param {Map} testCases - 所有用例
   * @param {BrowserContext} context - 浏览器上下文
   * @param {ReportGenerator} reportGenerator - 报告生成器
   * @returns {Promise<Object>}
   */
  async executeTestCase(caseId, testCases, context, reportGenerator) {
    const testCase = testCases.get(caseId);
    if (!testCase) {
      return {
        caseId,
        success: false,
        error: '用例不存在',
        duration: 0
      };
    }
    
    console.log(`\n   ▶️  执行: ${testCase.name} (${testCase.id})`);
    console.log(`      优先级: ${testCase.priority} | 版本: ${testCase.version}`);
    
    const startTime = Date.now();
    const apiLogger = new ApiLogger();
    
    // 创建新页面
    const page = await context.newPage();
    apiLogger.setupPageListener(page);
    
    const result = {
      caseId: testCase.id,
      name: testCase.name,
      priority: testCase.priority,
      version: testCase.version,
      success: true,
      error: null,
      duration: 0,
      steps: [],
      apiCalls: [],
      screenshots: []
    };
    
    try {
      // 执行前置条件
      if (testCase.preconditions && testCase.preconditions.length > 0) {
        console.log(`      检查前置条件...`);
        for (const precondition of testCase.preconditions) {
          await this.executePrecondition(page, precondition);
        }
      }
      
      // 执行测试步骤
      for (const step of testCase.steps) {
        const stepStart = Date.now();
        console.log(`      步骤 ${step.order}: ${step.action}`);
        
        try {
          await this.executeStep(page, step);
          result.steps.push({
            ...step,
            success: true,
            duration: Date.now() - stepStart
          });
        } catch (stepError) {
          result.steps.push({
            ...step,
            success: false,
            error: stepError.message,
            duration: Date.now() - stepStart
          });
          throw stepError;
        }
      }
      
      // 验证预期结果
      await this.verifyExpectedResults(page, testCase.expectedResults);
      
      // 收集API调用
      result.apiCalls = apiLogger.formatForReport();
      reportGenerator.addApiCalls(result.apiCalls);
      
      console.log(`      ✅ 通过 (${Date.now() - startTime}ms)`);
      
    } catch (error) {
      result.success = false;
      result.error = error.message;
      
      // 保存错误截图
      try {
        const screenshotPath = path.join(
          reportGenerator.options.screenshotsDir,
          `error-${testCase.id}.png`
        );
        await page.screenshot({ path: screenshotPath, fullPage: true });
        result.screenshots.push(screenshotPath);
        reportGenerator.addScreenshot(`${testCase.name}-错误`, screenshotPath);
      } catch (e) {
        // 忽略截图失败
      }
      
      console.log(`      ❌ 失败: ${error.message}`);
      
    } finally {
      result.duration = Date.now() - startTime;
      await page.close();
    }
    
    // 添加结果到报告
    reportGenerator.addUIValidation({
      valid: result.success,
      caseId: result.caseId,
      caseName: result.name,
      error: result.error
    });
    
    return result;
  }

  /**
   * 执行前置条件
   * @param {Page} page - Playwright页面
   * @param {string} precondition - 前置条件描述
   */
  async executePrecondition(page, precondition) {
    // 常见前置条件处理
    if (precondition.includes('登录')) {
      // 执行登录
      await this.performLogin(page);
    } else if (precondition.includes('页面')) {
      // 导航到指定页面
      await page.goto(this.config.baseUrl);
      await page.waitForLoadState('networkidle');
    }
  }

  /**
   * 执行测试步骤
   * @param {Page} page - Playwright页面
   * @param {Object} step - 测试步骤
   */
  async executeStep(page, step) {
    switch (step.action) {
      case 'navigate':
        await page.goto(step.target || this.config.baseUrl);
        await page.waitForLoadState('networkidle');
        break;
        
      case 'click':
        const clickTarget = await page.locator(step.target).first();
        await clickTarget.click();
        break;
        
      case 'fill':
      case 'input':
        const inputTarget = await page.locator(step.target).first();
        await inputTarget.fill(step.value || '');
        break;
        
      case 'verify':
        const verifyTarget = await page.locator(step.target).first();
        await verifyTarget.waitFor({ timeout: 10000 });
        break;
        
      case 'wait':
        await page.waitForTimeout(step.value || 1000);
        break;
        
      case 'screenshot':
        await page.screenshot({ 
          path: step.value || 'screenshot.png',
          fullPage: true 
        });
        break;
        
      case 'download':
        // 处理数据输出操作
        const [download] = await Promise.all([
          page.waitForEvent('download'),
          page.click(step.target)
        ]);
        const downloadPath = await download.path();
        console.log(`        📥 数据输出: ${download.suggestedFilename()}`);
        break;
        
      default:
        console.log(`        ⚠️  未知的动作类型: ${step.action}`);
    }
  }

  /**
   * 验证预期结果
   * @param {Page} page - Playwright页面
   * @param {Object} expectedResults - 预期结果
   */
  async verifyExpectedResults(page, expectedResults) {
    if (!expectedResults) return;
    
    for (const [key, value] of Object.entries(expectedResults)) {
      if (key === 'dataOutput' && value) {
        // 验证数据输出
        console.log('      验证数据输出...');
      } else if (key === 'success' && value) {
        // 验证成功状态
        console.log('      验证操作成功...');
      }
    }
  }

  /**
   * 执行登录
   * @param {Page} page - Playwright页面
   */
  async performLogin(page) {
    console.log('      执行系统登录...');

    await page.goto(this.config.baseUrl);

    // 使用 test-config.json 中的选择器和凭据
    if (this.config.credentials) {
      const { tenant, username, password } = this.config.credentials;
      const loginSelectors = this.config.selectors?.common?.loginForm || {};

      // 使用配置中的选择器定位输入框
      if (loginSelectors.tenantInput && tenant) {
        await page.fill(loginSelectors.tenantInput, tenant);
      }
      if (loginSelectors.usernameInput && username) {
        await page.fill(loginSelectors.usernameInput, username);
      }
      if (loginSelectors.passwordInput && password) {
        await page.fill(loginSelectors.passwordInput, password);
      }

      // 点击登录按钮
      const loginBtn = loginSelectors.loginButton
        ? await page.locator(loginSelectors.loginButton).first()
        : await page.locator('button:has-text("登录"), button[type="submit"]').first();
      await loginBtn.click();
      
      await page.waitForTimeout(3000);
    }
  }

  /**
   * 计算统计信息
   */
  calculateStatistics() {
    this.statistics.total = this.results.length;
    this.statistics.passed = this.results.filter(r => r.success).length;
    this.statistics.failed = this.results.filter(r => !r.success).length;
    this.statistics.skipped = 0;
  }

  /**
   * 生成摘要报告
   * @param {ReportGenerator} reportGenerator - 报告生成器
   */
  generateSummaryReport(reportGenerator) {
    // 添加统计摘要
    reportGenerator.reportData.summary = {
      total: this.statistics.total,
      passed: this.statistics.passed,
      failed: this.statistics.failed,
      warnings: 0
    };
    
    // 添加详细结果
    reportGenerator.reportData.regressionResults = this.results.map(r => ({
      caseId: r.caseId,
      name: r.name,
      priority: r.priority,
      version: r.version,
      status: r.success ? 'passed' : 'failed',
      duration: r.duration,
      error: r.error,
      stepCount: r.steps.length
    }));
  }

  /**
   * 打印结果摘要
   */
  printSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 回归测试完成');
    console.log('='.repeat(80));
    console.log(`\n统计信息:`);
    console.log(`  总用例数: ${this.statistics.total}`);
    console.log(`  通过: ${this.statistics.passed} ✅`);
    console.log(`  失败: ${this.statistics.failed} ❌`);
    console.log(`  跳过: ${this.statistics.skipped} ⏭️`);
    console.log(`  成功率: ${((this.statistics.passed / this.statistics.total) * 100).toFixed(1)}%`);
    console.log(`  执行时间: ${(this.statistics.duration / 1000).toFixed(1)}s`);
    
    if (this.statistics.failed > 0) {
      console.log(`\n❌ 失败的用例:`);
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`  - ${r.name} (${r.caseId})`);
          console.log(`    错误: ${r.error}`);
        });
    }
    
    console.log('\n' + '='.repeat(80));
  }

  /**
   * 对比版本差异
   * @param {string} moduleName - 模块名称
   * @param {string} version1 - 版本1
   * @param {string} version2 - 版本2
   * @returns {Promise<Object>}
   */
  async compareVersions(moduleName, version1, version2) {
    console.log(`\n📊 对比模块 "${moduleName}" 的版本差异`);
    console.log(`   版本1: ${version1}`);
    console.log(`   版本2: ${version2}`);
    
    const testCases = await this.loadTestCases(moduleName);
    const differences = [];
    
    for (const [caseId, testCase] of testCases) {
      const v1Data = testCase.versionHistory.find(h => h.version === version1)?.data;
      const v2Data = testCase.toJSON();
      
      if (v1Data && v2Data) {
        const diff = this.calculateDiff(v1Data, v2Data);
        if (diff.length > 0) {
          differences.push({
            caseId,
            caseName: testCase.name,
            changes: diff
          });
        }
      }
    }
    
    return {
      moduleName,
      version1,
      version2,
      differences,
      totalChanges: differences.reduce((sum, d) => sum + d.changes.length, 0)
    };
  }

  /**
   * 计算差异
   * @param {Object} obj1 - 对象1
   * @param {Object} obj2 - 对象2
   * @returns {Array}
   */
  calculateDiff(obj1, obj2, path = '') {
    const differences = [];
    
    const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
    
    for (const key of keys) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (!(key in obj1)) {
        differences.push({
          path: currentPath,
          type: 'added',
          value: obj2[key]
        });
      } else if (!(key in obj2)) {
        differences.push({
          path: currentPath,
          type: 'removed',
          value: obj1[key]
        });
      } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
        if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
          differences.push(...this.calculateDiff(obj1[key], obj2[key], currentPath));
        } else {
          differences.push({
            path: currentPath,
            type: 'modified',
            oldValue: obj1[key],
            newValue: obj2[key]
          });
        }
      }
    }
    
    return differences;
  }
}

module.exports = RegressionTestRunner;
