/**
 * 功能模块生成器
 * 基于提示词和检索到的资源生成功能模块文件夹结构
 */

const fs = require('fs');
const path = require('path');
const TestCase = require('../models/test-case');
const DependencyManager = require('../models/dependency-manager');
const ResourceFinder = require('./resource-finder');
const CodeAnalyzer = require('../utils/code-analyzer');

class ModuleGenerator {
  constructor(config = {}) {
    this.config = {
      outputDir: config.outputDir || 'tests/modules',
      ...config
    };
    
    this.resourceFinder = new ResourceFinder(config.resourceFinder);
    this.codeAnalyzer = new CodeAnalyzer();
  }

  /**
   * 生成功能模块
   * @param {string} prompt - 功能提示词
   * @param {Object} options - 生成选项
   * @returns {Promise<Object>}
   */
  async generateModule(prompt, options = {}) {
    console.log('='.repeat(60));
    console.log('🚀 开始生成功能模块');
    console.log(`📝 功能描述: ${prompt}`);
    console.log('='.repeat(60));
    
    const moduleName = this.sanitizeModuleName(prompt);
    const modulePath = path.join(this.config.outputDir, moduleName);
    
    // 1. 检索资源
    console.log('\n📡 步骤1: 检索相关资源...');
    const resources = await this.resourceFinder.findResources(prompt);
    
    if (resources.confidence < 0.3) {
      console.warn('⚠️  资源检索置信度较低，可能需要手动指定资源');
    }
    
    // 2. 创建模块文件夹结构
    console.log('\n📁 步骤2: 创建模块文件夹结构...');
    const structure = await this.createModuleStructure(modulePath, moduleName);
    console.log(`   ✅ 模块路径: ${modulePath}`);
    
    // 3. 生成测试用例
    console.log('\n📝 步骤3: 生成测试用例...');
    const testCases = await this.generateTestCases(prompt, resources, structure, options);
    console.log(`   ✅ 生成了 ${testCases.length} 个测试用例`);
    
    // 4. 分析依赖关系
    console.log('\n🔗 步骤4: 分析用例依赖关系...');
    const dependencies = await this.analyzeDependencies(testCases, resources);
    console.log(`   ✅ 分析了 ${dependencies.dependencies.size} 个依赖关系`);
    
    // 5. 保存所有文件
    console.log('\n💾 步骤5: 保存模块文件...');
    await this.saveModuleFiles(modulePath, moduleName, {
      resources,
      testCases,
      dependencies,
      structure
    });
    
    // 6. 生成报告
    console.log('\n📊 步骤6: 生成模块信息...');
    const moduleInfo = this.generateModuleInfo(moduleName, prompt, testCases, dependencies);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ 功能模块生成完成！');
    console.log('='.repeat(60));
    console.log(`\n📂 模块位置: ${modulePath}`);
    console.log(`📋 用例数量: ${testCases.length}`);
    console.log(`🔗 依赖关系: ${dependencies.dependencies.size}`);
    
    return {
      moduleName,
      modulePath,
      resources,
      testCases,
      dependencies,
      structure
    };
  }

  /**
   * 创建模块文件夹结构
   * @param {string} modulePath - 模块路径
   * @param {string} moduleName - 模块名称
   * @returns {Object}
   */
  async createModuleStructure(modulePath, moduleName) {
    const structure = {
      root: modulePath,
      cases: path.join(modulePath, 'cases'),
      scripts: path.join(modulePath, 'scripts'),
      docs: path.join(modulePath, 'docs'),
      docsReport: path.join(modulePath, 'docs', 'report'),
      docsScreenshots: path.join(modulePath, 'docs', 'screenshots'),
      docsDownloads: path.join(modulePath, 'docs', 'downloads')
    };
    
    // 创建文件夹
    for (const [key, dir] of Object.entries(structure)) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
    
    return structure;
  }

  /**
   * 生成测试用例
   * @param {string} prompt - 功能提示词
   * @param {Object} resources - 检索到的资源
   * @param {Object} structure - 文件夹结构
   * @param {Object} options - 生成选项
   * @returns {Array}
   */
  async generateTestCases(prompt, resources, structure, options = {}) {
    const testCases = [];
    
    // 基于PRD和代码生成用例
    const caseTemplates = this.generateCaseTemplates(prompt, resources);
    
    for (const template of caseTemplates) {
      const testCase = new TestCase({
        name: template.name,
        description: template.description,
        module: path.basename(structure.root),
        priority: template.priority,
        dimension: template.dimension || 'functional',
        direction: template.direction || 'positive',
        prdReference: resources.prdFiles[0]?.path || '',
        codeReferences: [
          ...resources.backendCode.slice(0, 3).map(c => c.path),
          ...resources.frontendCode.slice(0, 2).map(c => c.path)
        ],
        author: options.author || 'auto-test',
        tags: template.tags
      });

      // 添加测试步骤
      for (const step of template.steps) {
        testCase.addStep(step);
      }

      // 设置前置条件
      testCase.preconditions = template.preconditions || [];

      // 设置预期结果（数组格式）
      testCase.expectedResults = template.expectedResults || [];

      // 设置测试数据
      testCase.testData = template.testData || {};

      // 设置API端点
      testCase.apiEndpoints = template.apiEndpoints || [];

      // 设置依赖
      testCase.dependencies = template.dependencies || [];
      
      testCases.push(testCase);
    }
    
    return testCases;
  }

  /**
   * 生成用例模板
   * @param {string} prompt - 功能提示词
   * @param {Object} resources - 检索到的资源
   * @returns {Array}
   */
  generateCaseTemplates(prompt, resources) {
    const templates = [];
    const moduleName = this.sanitizeModuleName(prompt);
    
    // 分析前端代码，生成具体步骤
    let specificSteps = null;
    if (resources.frontendCode && resources.frontendCode.length > 0) {
      console.log('\n🔍 分析前端代码，提取具体操作步骤...');
      const stepGeneration = this.codeAnalyzer.generateSpecificSteps(prompt, resources.frontendCode);
      specificSteps = stepGeneration.steps;
      
      if (stepGeneration.elements) {
        this.codeAnalyzer.printAnalysis(stepGeneration.elements);
      }
      
      if (stepGeneration.hasSpecificSelectors) {
        console.log('   ✅ 成功从前端代码提取具体选择器');
      }
    }
    
    // 1. 基础功能用例（P0）- 正向测试
    templates.push({
      name: `${moduleName}_基础功能测试`,
      description: `验证${prompt}的基本功能`,
      priority: 'P0',
      dimension: 'functional',
      direction: 'positive',
      tags: ['基础功能', '冒烟测试'],
      preconditions: [
        '当前用户拥有该功能的操作权限',
        '功能菜单可见且可点击'
      ],
      steps: specificSteps && specificSteps.length > 0 ? specificSteps : [
        { order: 1, action: 'navigate', target: '功能页面', selector: '', expected: '页面加载完成，功能区域可见' },
        { order: 2, action: 'verify', target: '页面核心元素', selector: '', expected: '关键元素（标题、按钮、表格）均正常显示' },
        { order: 3, action: 'input', target: '表单输入项', selector: '', value: '测试数据', expected: '输入框正常接受输入' },
        { order: 4, action: 'click', target: '提交/保存按钮', selector: '', expected: '右上角弹出绿色成功提示' }
      ],
      expectedResults: [
        '页面加载完成，核心功能区域正常显示',
        '执行核心操作后弹出成功提示'
      ],
      testData: {},
      apiEndpoints: [],
      dependencies: []
    });

    // 2. 边界值测试用例（P1）- 边界测试
    templates.push({
      name: `${moduleName}_边界值测试`,
      description: `验证${prompt}的边界条件处理`,
      priority: 'P1',
      dimension: 'functional',
      direction: 'boundary',
      tags: ['边界值', '异常处理'],
      preconditions: [
        '功能页面已打开',
        '表单处于可编辑状态'
      ],
      steps: [
        { order: 1, action: 'input', target: '输入框', selector: '', value: '最大长度值', expected: '输入框正常接受输入，未截断' },
        { order: 2, action: 'click', target: '提交按钮', selector: '', expected: '系统正确处理边界值，不崩溃不报错' }
      ],
      expectedResults: [
        '输入最大长度值后提交，系统正确处理不报错',
        '输入特殊字符后提交，系统给出明确校验提示'
      ],
      testData: {},
      apiEndpoints: [],
      dependencies: []
    });

    // 3. 异常场景用例（P1）- 反向测试
    templates.push({
      name: `${moduleName}_异常场景测试`,
      description: `验证${prompt}的异常处理能力`,
      priority: 'P1',
      dimension: 'functional',
      direction: 'negative',
      tags: ['异常场景', '错误处理'],
      preconditions: [
        '功能页面已打开',
        '必填字段处于未填写状态'
      ],
      steps: [
        { order: 1, action: 'click', target: '提交按钮', selector: '', expected: '表单不提交，必填字段下方显示红色错误提示' },
        { order: 2, action: 'verify', target: '错误提示信息', selector: '', expected: '显示具体的必填项提示文字' }
      ],
      expectedResults: [
        '必填字段为空时提交，表单不提交并显示红色校验错误提示',
        '错误提示文字具体、友好，指出哪些字段未填写'
      ],
      testData: {},
      apiEndpoints: [],
      dependencies: []
    });

    // 4. 数据导出用例（如果有导出功能）
    if (prompt.includes('导出') || resources.prdFiles.some(p => p.name.includes('导出'))) {
      templates.push({
        name: `${moduleName}_数据导出测试`,
        description: `验证${prompt}的数据导出功能`,
        priority: 'P1',
        dimension: 'functional',
        direction: 'positive',
        tags: ['导出', '文件下载'],
        preconditions: [
          '功能页面已打开',
          '列表中存在至少1条可导出数据'
        ],
        steps: [
          { order: 1, action: 'click', target: '导出按钮', selector: '', expected: '触发文件下载' },
          { order: 2, action: 'waitForDownload', target: '下载文件', selector: '', expected: '文件下载完成' },
          { order: 3, action: 'verifyFile', target: '下载文件', selector: '', expected: '文件格式为xlsx，包含正确的列头和数据' }
        ],
        expectedResults: [
          '点击导出按钮后文件开始下载',
          '下载的文件格式正确（xlsx），列头与列表一致，数据完整'
        ],
        testData: {},
        apiEndpoints: [],
        dependencies: []
      });
    }

    // 5. 权限测试用例（P1）- 安全维度
    templates.push({
      name: `${moduleName}_权限控制测试`,
      description: `验证${prompt}的权限控制`,
      priority: 'P1',
      dimension: 'security',
      direction: 'negative',
      tags: ['权限', '安全'],
      preconditions: [
        '使用无该功能权限的用户账号登录系统'
      ],
      steps: [
        { order: 1, action: 'navigate', target: '功能页面', selector: '', expected: '页面不可访问或菜单项不显示' }
      ],
      expectedResults: [
        '无权限用户无法看到该功能的菜单入口或访问页面时提示无权限'
      ],
      testData: {},
      apiEndpoints: [],
      dependencies: []
    });

    // 6. API接口测试用例（P0）
    if (resources.backendCode.length > 0) {
      templates.push({
        name: `${moduleName}_API接口测试`,
        description: `验证${prompt}的API接口`,
        priority: 'P0',
        dimension: 'functional',
        direction: 'positive',
        tags: ['API', '接口测试'],
        preconditions: [
          'API服务可正常访问',
          '已获取有效的认证令牌'
        ],
        steps: [
          { order: 1, action: 'verify', target: 'API端点', selector: '', expected: '接口返回状态码200' },
          { order: 2, action: 'verify', target: '响应数据结构', selector: '', expected: '返回数据包含预期字段，结构正确' }
        ],
        expectedResults: [
          'API接口返回状态码200，响应时间在可接受范围内',
          '响应数据结构与接口文档一致，包含所有必要字段'
        ],
        testData: {},
        apiEndpoints: [],
        dependencies: []
      });
    }
    
    return templates;
  }

  /**
   * 分析用例依赖关系
   * @param {Array} testCases - 测试用例列表
   * @param {Object} resources - 检索到的资源
   * @returns {DependencyManager}
   */
  async analyzeDependencies(testCases, resources) {
    const manager = new DependencyManager();
    
    // 基础用例不依赖其他用例
    // 其他用例依赖基础用例
    const baseCase = testCases.find(tc => tc.name.includes('基础功能'));
    
    if (baseCase) {
      for (const testCase of testCases) {
        if (testCase.id !== baseCase.id) {
          // 所有其他用例都依赖基础用例
          manager.addDependency(testCase.id, baseCase.id, { type: 'before' });
          testCase.addDependency(baseCase.id, 'before');
        }
      }
    }
    
    // 导出用例依赖数据查询用例
    const exportCase = testCases.find(tc => tc.name.includes('导出'));
    const apiCase = testCases.find(tc => tc.name.includes('API'));
    
    if (exportCase && apiCase) {
      manager.addDependency(exportCase.id, apiCase.id, { type: 'before' });
      exportCase.addDependency(apiCase.id, 'before');
    }
    
    return manager;
  }

  /**
   * 保存模块文件
   * @param {string} modulePath - 模块路径
   * @param {string} moduleName - 模块名称
   * @param {Object} data - 模块数据
   */
  async saveModuleFiles(modulePath, moduleName, data) {
    const { resources, testCases, dependencies, structure } = data;
    
    // 1. 保存资源配置
    fs.writeFileSync(
      path.join(structure.config, 'resources.json'),
      JSON.stringify(resources, null, 2),
      'utf-8'
    );
    
    // 2. 保存用例依赖关系
    fs.writeFileSync(
      path.join(structure.config, 'dependencies.json'),
      JSON.stringify(dependencies.export(), null, 2),
      'utf-8'
    );
    
    // 3. 保存测试用例
    for (const testCase of testCases) {
      const caseFileName = `${testCase.id}.json`;
      fs.writeFileSync(
        path.join(structure.cases, caseFileName),
        JSON.stringify(testCase.toJSON(), null, 2),
        'utf-8'
      );
    }
    
    // 4. 保存用例清单
    const caseList = testCases.map(tc => ({
      id: tc.id,
      name: tc.name,
      priority: tc.priority,
      status: tc.status,
      version: tc.version,
      file: `${tc.id}.json`
    }));
    
    fs.writeFileSync(
      path.join(structure.config, 'case-list.json'),
      JSON.stringify(caseList, null, 2),
      'utf-8'
    );
    
    // 5. 保存测试数据模板
    const testDataTemplate = {
      testData: {
        valid: {},
        invalid: {},
        boundary: {}
      },
      environment: {
        baseUrl: '',
        credentials: {}
      }
    };
    
    fs.writeFileSync(
      path.join(structure.data, 'test-data.template.json'),
      JSON.stringify(testDataTemplate, null, 2),
      'utf-8'
    );
    
    // 6. 保存README
    const readme = this.generateReadme(moduleName, testCases, dependencies);
    fs.writeFileSync(
      path.join(structure.docs, 'README.md'),
      readme,
      'utf-8'
    );
  }

  /**
   * 生成模块信息
   * @param {string} moduleName - 模块名称
   * @param {string} prompt - 功能提示词
   * @param {Array} testCases - 测试用例列表
   * @param {DependencyManager} dependencies - 依赖管理器
   * @returns {Object}
   */
  generateModuleInfo(moduleName, prompt, testCases, dependencies) {
    const stats = dependencies.getStatistics();
    
    return {
      name: moduleName,
      description: prompt,
      createdAt: new Date().toISOString(),
      statistics: {
        totalCases: testCases.length,
        byPriority: {
          P0: testCases.filter(tc => tc.priority === 'P0').length,
          P1: testCases.filter(tc => tc.priority === 'P1').length,
          P2: testCases.filter(tc => tc.priority === 'P2').length
        },
        dependencies: stats
      },
      executionOrder: dependencies.getExecutionOrder()
    };
  }

  /**
   * 生成README文档
   * @param {string} moduleName - 模块名称
   * @param {Array} testCases - 测试用例列表
   * @param {DependencyManager} dependencies - 依赖管理器
   * @returns {string}
   */
  generateReadme(moduleName, testCases, dependencies) {
    const executionOrder = dependencies.getExecutionOrder();
    
    return `# ${moduleName}

## 模块概述

自动生成于 ${new Date().toLocaleString('zh-CN')}

## 测试用例清单

| ID | 名称 | 优先级 | 状态 | 版本 |
|----|------|--------|------|------|
${testCases.map(tc => `| ${tc.id} | ${tc.name} | ${tc.priority} | ${tc.status} | ${tc.version} |`).join('\n')}

## 执行顺序

\`\`\`
${executionOrder.map((step, i) => `${i + 1}. ${step.parallel ? '【并行】' : ''}${step.cases.join(', ')}`).join('\n')}
\`\`\`

## 文件夹结构

\`\`\`
cases/              # 测试用例文件 (*.json)
scripts/            # 生成的测试脚本 (*.spec.js)
docs/
  report/           # 测试报告 (*.html, *.md)
  screenshots/      # 测试截图 (*.png)
  downloads/        # 下载文件 (*.xlsx, *.pdf等)
\`\`\`

## 使用方法

### 1. 查看用例详情
\`\`\`bash
# 查看具体用例
cat cases/TC-xxx.json
\`\`\`

### 2. 执行测试
\`\`\`bash
# 执行模块测试
npx playwright test scripts/

# 使用CLI执行
node cli.js run -m ${moduleName}
\`\`\`

### 3. 生成Playwright脚本
\`\`\`bash
# 生成所有用例的脚本
node ../agents/script-generator.js --module=${moduleName}
\`\`\`

## 注意事项

1. 测试数据在各用例JSON文件的 testData 字段中配置
2. 执行前请确保测试环境可访问
3. P0级别用例失败会阻止后续用例执行
`;
  }

  /**
   * 清理模块名称
   * @param {string} name - 原始名称
   * @returns {string}
   */
  sanitizeModuleName(name) {
    return name
      .replace(/[^\w\u4e00-\u9fa5]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
      .substring(0, 50);
  }
}

module.exports = ModuleGenerator;
