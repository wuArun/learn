/**
 * 功能模块更新器
 * 智能检测代码变更，基于现有模块进行增量更新
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ModuleGenerator = require('./module-generator');
const ResourceFinder = require('./resource-finder');
const TestCase = require('../models/test-case');
const DependencyManager = require('../models/dependency-manager');

class ModuleUpdater {
  constructor(config = {}) {
    this.config = {
      outputDir: config.outputDir || 'tests/modules',
      ...config
    };
    
    this.resourceFinder = new ResourceFinder(config.resourceFinder);
    this.moduleGenerator = new ModuleGenerator(config);
  }

  /**
   * 智能生成或更新模块
   * @param {string} prompt - 功能提示词
   * @param {Object} options - 选项
   * @returns {Promise<Object>}
   */
  async generateOrUpdate(prompt, options = {}) {
    const moduleName = this.sanitizeModuleName(prompt);
    const modulePath = path.join(this.config.outputDir, moduleName);
    
    console.log('='.repeat(80));
    console.log('🚀 智能模块管理器');
    console.log(`📝 功能描述: ${prompt}`);
    console.log('='.repeat(80));
    
    // 1. 检查模块是否已存在
    const existingModule = await this.checkExistingModule(modulePath);
    
    if (existingModule.exists) {
      console.log(`\n📦 发现现有模块: ${moduleName}`);
      console.log(`   创建时间: ${existingModule.createdAt}`);
      console.log(`   用例数量: ${existingModule.caseCount}`);
      
      // 执行增量更新流程
      return await this.incrementalUpdate(modulePath, moduleName, prompt, existingModule, options);
    } else {
      console.log(`\n📦 模块不存在，创建新模块: ${moduleName}`);
      // 创建新模块
      return await this.moduleGenerator.generateModule(prompt, options);
    }
  }

  /**
   * 检查现有模块
   * @param {string} modulePath - 模块路径
   * @returns {Object}
   */
  async checkExistingModule(modulePath) {
    const result = {
      exists: false,
      createdAt: null,
      caseCount: 0,
      cases: [],
      resources: null,
      resourceHash: null
    };
    
    if (!fs.existsSync(modulePath)) {
      return result;
    }
    
    result.exists = true;
    
    // 读取用例列表
    const casesDir = path.join(modulePath, 'cases');
    if (fs.existsSync(casesDir)) {
      const caseFiles = fs.readdirSync(casesDir).filter(f => f.endsWith('.json'));
      result.caseCount = caseFiles.length;
      
      for (const file of caseFiles) {
        const caseData = JSON.parse(fs.readFileSync(path.join(casesDir, file), 'utf-8'));
        result.cases.push({
          id: caseData.id,
          name: caseData.name,
          version: caseData.version,
          updatedAt: caseData.updatedAt
        });
      }
    }
    
    // 读取历史资源配置
    const resourcesPath = path.join(modulePath, 'config', 'resources.json');
    if (fs.existsSync(resourcesPath)) {
      result.resources = JSON.parse(fs.readFileSync(resourcesPath, 'utf-8'));
      result.createdAt = result.resources.timestamp;
      result.resourceHash = this.calculateResourceHash(result.resources);
    }
    
    // 读取模块摘要
    const summaryPath = path.join(modulePath, 'module-summary.json');
    if (fs.existsSync(summaryPath)) {
      result.summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
    }
    
    return result;
  }

  /**
   * 增量更新模块
   * @param {string} modulePath - 模块路径
   * @param {string} moduleName - 模块名称
   * @param {string} prompt - 功能提示词
   * @param {Object} existingModule - 现有模块信息
   * @param {Object} options - 选项
   * @returns {Promise<Object>}
   */
  async incrementalUpdate(modulePath, moduleName, prompt, existingModule, options) {
    console.log('\n' + '='.repeat(80));
    console.log('🔄 开始增量更新流程');
    console.log('='.repeat(80));
    
    // 1. 重新检索资源
    console.log('\n📡 步骤1: 重新检索相关资源...');
    const newResources = await this.resourceFinder.findResources(prompt);
    
    // 2. 检测代码变更
    console.log('\n🔍 步骤2: 检测代码变更...');
    const changes = await this.detectChanges(existingModule.resources, newResources);
    
    if (changes.hasChanges) {
      console.log('   ⚠️  检测到代码变更!');
      console.log(`      - PRD文档: ${changes.prdChanges.length} 个变更`);
      console.log(`      - 后端代码: ${changes.backendChanges.length} 个变更`);
      console.log(`      - 前端代码: ${changes.frontendChanges.length} 个变更`);
    } else {
      console.log('   ✅ 代码未发生变化');
    }
    
    // 3. 分析用例覆盖率
    console.log('\n📊 步骤3: 分析用例覆盖率...');
    const coverage = await this.analyzeCoverage(existingModule.cases, newResources, prompt);
    
    console.log(`   当前用例数: ${coverage.existingCount}`);
    console.log(`   建议用例数: ${coverage.recommendedCount}`);
    console.log(`   覆盖率: ${(coverage.coverageRatio * 100).toFixed(1)}%`);
    
    if (coverage.missingScenarios.length > 0) {
      console.log(`   ⚠️  缺失场景: ${coverage.missingScenarios.length} 个`);
      coverage.missingScenarios.forEach((scene, i) => {
        console.log(`      ${i + 1}. ${scene.name} (${scene.reason})`);
      });
    }
    
    // 4. 生成新增用例
    console.log('\n📝 步骤4: 生成新增/更新用例...');
    const updatePlan = await this.generateUpdatePlan(existingModule, coverage, changes, prompt, newResources);
    
    console.log(`   新增用例: ${updatePlan.newCases.length}`);
    console.log(`   更新用例: ${updatePlan.updatedCases.length}`);
    console.log(`   删除用例: ${updatePlan.deletedCases.length}`);
    
    // 5. 应用更新
    console.log('\n💾 步骤5: 应用更新...');
    const result = await this.applyUpdate(modulePath, moduleName, existingModule, updatePlan, newResources, options);
    
    // 6. 生成更新报告
    console.log('\n📋 步骤6: 生成更新报告...');
    await this.generateUpdateReport(modulePath, result, changes, coverage);
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ 增量更新完成！');
    console.log('='.repeat(80));
    console.log(`\n📊 更新统计:`);
    console.log(`   新增用例: ${result.statistics.added}`);
    console.log(`   更新用例: ${result.statistics.updated}`);
    console.log(`   删除用例: ${result.statistics.deleted}`);
    console.log(`   总用例数: ${result.statistics.total}`);
    
    return result;
  }

  /**
   * 检测代码变更
   * @param {Object} oldResources - 旧资源
   * @param {Object} newResources - 新资源
   * @returns {Object}
   */
  async detectChanges(oldResources, newResources) {
    const changes = {
      hasChanges: false,
      prdChanges: [],
      backendChanges: [],
      frontendChanges: []
    };
    
    if (!oldResources) {
      changes.hasChanges = true;
      changes.prdChanges = newResources.prdFiles.map(f => ({ type: 'added', file: f }));
      changes.backendChanges = newResources.backendCode.map(f => ({ type: 'added', file: f }));
      changes.frontendChanges = newResources.frontendCode.map(f => ({ type: 'added', file: f }));
      return changes;
    }
    
    // 检测PRD变更
    const oldPrdMap = new Map(oldResources.prdFiles.map(f => [f.path, f]));
    for (const newPrd of newResources.prdFiles) {
      const oldPrd = oldPrdMap.get(newPrd.path);
      if (!oldPrd) {
        changes.prdChanges.push({ type: 'added', file: newPrd });
        changes.hasChanges = true;
      } else if (this.hasFileChanged(oldPrd.path)) {
        changes.prdChanges.push({ type: 'modified', file: newPrd, oldFile: oldPrd });
        changes.hasChanges = true;
      }
    }
    
    // 检测后端代码变更
    const oldBackendMap = new Map(oldResources.backendCode.map(f => [f.path, f]));
    for (const newCode of newResources.backendCode) {
      const oldCode = oldBackendMap.get(newCode.path);
      if (!oldCode) {
        changes.backendChanges.push({ type: 'added', file: newCode });
        changes.hasChanges = true;
      } else if (this.hasFileChanged(oldCode.path)) {
        changes.backendChanges.push({ type: 'modified', file: newCode, oldFile: oldCode });
        changes.hasChanges = true;
      }
    }
    
    // 检测前端代码变更
    const oldFrontendMap = new Map(oldResources.frontendCode.map(f => [f.path, f]));
    for (const newCode of newResources.frontendCode) {
      const oldCode = oldFrontendMap.get(newCode.path);
      if (!oldCode) {
        changes.frontendChanges.push({ type: 'added', file: newCode });
        changes.hasChanges = true;
      } else if (this.hasFileChanged(oldCode.path)) {
        changes.frontendChanges.push({ type: 'modified', file: newCode, oldFile: oldCode });
        changes.hasChanges = true;
      }
    }
    
    return changes;
  }

  /**
   * 检查文件是否变更
   * @param {string} filePath - 文件路径
   * @returns {boolean}
   */
  hasFileChanged(filePath) {
    // 简化处理：总是认为可能有变化
    // 实际可以通过文件哈希或修改时间判断
    return true;
  }

  /**
   * 分析用例覆盖率
   * @param {Array} existingCases - 现有用例
   * @param {Object} resources - 资源
   * @param {string} prompt - 提示词
   * @returns {Object}
   */
  async analyzeCoverage(existingCases, resources, prompt) {
    const coverage = {
      existingCount: existingCases.length,
      recommendedCount: 0,
      coverageRatio: 0,
      missingScenarios: [],
      existingScenarios: new Set(),
      recommendedScenarios: []
    };
    
    // 从现有用例中提取场景
    for (const testCase of existingCases) {
      coverage.existingScenarios.add(testCase.name);
    }
    
    // 基于PRD和代码分析应覆盖的场景
    const requiredScenarios = this.extractRequiredScenarios(resources, prompt);
    coverage.recommendedScenarios = requiredScenarios;
    coverage.recommendedCount = requiredScenarios.length;
    
    // 找出缺失的场景
    for (const scenario of requiredScenarios) {
      const isCovered = existingCases.some(tc => 
        tc.name.toLowerCase().includes(scenario.name.toLowerCase()) ||
        this.calculateSimilarity(tc.name, scenario.name) > 0.7
      );
      
      if (!isCovered) {
        coverage.missingScenarios.push(scenario);
      }
    }
    
    // 计算覆盖率
    coverage.coverageRatio = requiredScenarios.length > 0 
      ? (requiredScenarios.length - coverage.missingScenarios.length) / requiredScenarios.length 
      : 1;
    
    return coverage;
  }

  /**
   * 提取需要的场景
   * @param {Object} resources - 资源
   * @param {string} prompt - 提示词
   * @returns {Array}
   */
  extractRequiredScenarios(resources, prompt) {
    const scenarios = [
      { name: '基础功能测试', priority: 'P0', dimension: 'functional', direction: 'positive', reason: '核心功能必须覆盖' },
      { name: '边界值测试', priority: 'P1', dimension: 'functional', direction: 'boundary', reason: '边界条件验证' },
      { name: '异常场景测试', priority: 'P1', dimension: 'functional', direction: 'negative', reason: '错误处理验证' },
      { name: '权限控制测试', priority: 'P1', dimension: 'security', direction: 'negative', reason: '安全性验证' }
    ];
    
    // 根据PRD内容添加场景
    if (resources.prdFiles.length > 0) {
      const prdContent = resources.prdFiles.map(f => {
        try {
          return fs.readFileSync(f.path, 'utf-8');
        } catch (e) {
          return '';
        }
      }).join('\n');
      
      // 检测导出功能
      if (prdContent.includes('导出') || prdContent.includes('下载') || prompt.includes('导出')) {
        scenarios.push({ name: '数据导出测试', priority: 'P1', dimension: 'functional', direction: 'positive', reason: 'PRD包含导出功能' });
        scenarios.push({ name: '导出格式验证', priority: 'P1', dimension: 'functional', direction: 'positive', reason: '导出文件格式验证' });
      }

      // 检测导入功能
      if (prdContent.includes('导入') || prdContent.includes('上传')) {
        scenarios.push({ name: '数据导入测试', priority: 'P1', dimension: 'functional', direction: 'positive', reason: 'PRD包含导入功能' });
        scenarios.push({ name: '导入格式验证', priority: 'P2', dimension: 'functional', direction: 'negative', reason: '导入文件格式验证' });
      }

      // 检测搜索功能
      if (prdContent.includes('查询') || prdContent.includes('搜索')) {
        scenarios.push({ name: '查询功能测试', priority: 'P0', dimension: 'functional', direction: 'positive', reason: 'PRD包含查询功能' });
        scenarios.push({ name: '高级查询测试', priority: 'P1', dimension: 'functional', direction: 'positive', reason: '高级搜索条件验证' });
      }

      // 检测API接口
      if (resources.backendCode.length > 0) {
        scenarios.push({ name: 'API接口测试', priority: 'P0', dimension: 'functional', direction: 'positive', reason: '后端接口验证' });
      }

      // 检测工作流
      if (prdContent.includes('流程') || prdContent.includes('审批') || prdContent.includes('状态')) {
        scenarios.push({ name: '状态流转测试', priority: 'P1', dimension: 'functional', direction: 'positive', reason: '业务流程验证' });
      }

      // 检测数据校验规则
      if (prdContent.includes('校验') || prdContent.includes('验证') || prdContent.includes('规则')) {
        scenarios.push({ name: '数据校验测试', priority: 'P1', dimension: 'functional', direction: 'negative', reason: '数据规则验证' });
      }
    }
    
    return scenarios;
  }

  /**
   * 生成更新计划
   * @param {Object} existingModule - 现有模块
   * @param {Object} coverage - 覆盖率分析
   * @param {Object} changes - 变更检测
   * @param {string} prompt - 提示词
   * @param {Object} resources - 资源
   * @returns {Object}
   */
  async generateUpdatePlan(existingModule, coverage, changes, prompt, resources) {
    const plan = {
      newCases: [],
      updatedCases: [],
      deletedCases: [],
      unchangedCases: []
    };
    
    // 为缺失的场景生成新用例
    for (const scenario of coverage.missingScenarios) {
      const newCase = await this.generateCaseFromScenario(scenario, prompt, resources);
      plan.newCases.push(newCase);
    }
    
    // 检查现有用例是否需要更新
    for (const existingCase of existingModule.cases) {
      const casePath = path.join(existingModule.modulePath, 'cases', `${existingCase.id}.json`);
      const caseData = JSON.parse(fs.readFileSync(casePath, 'utf-8'));
      const testCase = TestCase.fromJSON(caseData);
      
      // 检查代码引用是否过时
      const hasCodeChanges = changes.backendChanges.some(c => 
        testCase.codeReferences.includes(c.file.path)
      ) || changes.frontendChanges.some(c => 
        testCase.codeReferences.includes(c.file.path)
      );
      
      if (hasCodeChanges) {
        plan.updatedCases.push({
          testCase,
          reason: '引用的代码文件已变更',
          changes: [...changes.backendChanges, ...changes.frontendChanges].filter(c =>
            testCase.codeReferences.includes(c.file.path)
          )
        });
      } else {
        plan.unchangedCases.push(testCase);
      }
    }
    
    return plan;
  }

  /**
   * 从场景生成用例
   * @param {Object} scenario - 场景
   * @param {string} prompt - 提示词
   * @param {Object} resources - 资源
   * @returns {TestCase}
   */
  async generateCaseFromScenario(scenario, prompt, resources) {
    const testCase = new TestCase({
      name: `${this.sanitizeModuleName(prompt)}_${scenario.name}`,
      description: scenario.reason,
      module: this.sanitizeModuleName(prompt),
      priority: scenario.priority,
      dimension: scenario.dimension || 'functional',
      direction: scenario.direction || 'positive',
      prdReference: resources.prdFiles[0]?.path || '',
      codeReferences: [
        ...resources.backendCode.slice(0, 3).map(c => c.path),
        ...resources.frontendCode.slice(0, 2).map(c => c.path)
      ],
      author: 'auto-test-updater',
      tags: [scenario.priority, ...this.extractTags(scenario.name)]
    });
    
    // 根据场景类型生成步骤
    const steps = this.generateStepsForScenario(scenario, resources);
    for (const step of steps) {
      testCase.addStep(step);
    }
    
    return testCase;
  }

  /**
   * 为场景生成步骤
   * @param {Object} scenario - 场景
   * @param {Object} resources - 资源
   * @returns {Array}
   */
  generateStepsForScenario(scenario, resources) {
    const steps = [];
    
    switch (scenario.name) {
      case '基础功能测试':
        steps.push(
          { order: 1, action: 'navigate', target: '功能页面', selector: '', expected: '页面加载完成，功能区域可见' },
          { order: 2, action: 'verify', target: '页面标题', selector: '', expected: '标题正确显示' },
          { order: 3, action: 'verify', target: '核心元素', selector: '', expected: '按钮、表格等核心元素正常渲染' },
          { order: 4, action: 'input', target: '表单输入项', selector: '', value: '测试数据', expected: '输入框正常接受输入' },
          { order: 5, action: 'click', target: '提交按钮', selector: '', expected: '右上角弹出绿色成功提示' }
        );
        break;

      case '边界值测试':
        steps.push(
          { order: 1, action: 'navigate', target: '功能页面', selector: '', expected: '页面加载完成' },
          { order: 2, action: 'input', target: '输入框（最小值）', selector: '', value: 'MIN', expected: '系统正确处理最小边界值' },
          { order: 3, action: 'click', target: '提交按钮', selector: '', expected: '提交成功，不报错' },
          { order: 4, action: 'input', target: '输入框（最大值）', selector: '', value: 'MAX', expected: '系统正确处理最大边界值' },
          { order: 5, action: 'click', target: '提交按钮', selector: '', expected: '提交成功，不报错' }
        );
        break;

      case '异常场景测试':
        steps.push(
          { order: 1, action: 'navigate', target: '功能页面', selector: '', expected: '页面加载完成' },
          { order: 2, action: 'click', target: '提交按钮（必填项为空）', selector: '', expected: '表单不提交，必填字段下方显示红色错误提示' },
          { order: 3, action: 'verify', target: '错误提示信息', selector: '', expected: '显示具体的必填项提示文字' },
          { order: 4, action: 'verify', target: '页面状态', selector: '', expected: '页面保持稳定，无崩溃或白屏' }
        );
        break;

      case '数据导出测试':
        steps.push(
          { order: 1, action: 'navigate', target: '功能页面', selector: '', expected: '页面加载完成' },
          { order: 2, action: 'click', target: '导出按钮', selector: '', expected: '触发文件下载' },
          { order: 3, action: 'waitForDownload', target: '下载文件', selector: '', expected: '文件下载完成' },
          { order: 4, action: 'verifyFile', target: '下载文件', selector: '', expected: '文件格式为xlsx，包含正确的列头和数据' }
        );
        break;

      case '查询功能测试':
        steps.push(
          { order: 1, action: 'navigate', target: '功能页面', selector: '', expected: '页面加载完成' },
          { order: 2, action: 'input', target: '搜索框', selector: '', value: '关键词', expected: '搜索框显示输入的关键词' },
          { order: 3, action: 'click', target: '搜索按钮', selector: '', expected: '列表刷新，显示筛选后的结果' },
          { order: 4, action: 'verify', target: '结果列表', selector: '', expected: '结果中均包含搜索关键词' }
        );
        break;

      default:
        steps.push(
          { order: 1, action: 'navigate', target: '功能页面', selector: '', expected: '页面加载完成' },
          { order: 2, action: 'click', target: scenario.name, selector: '', expected: '操作执行成功' },
          { order: 3, action: 'verify', target: '操作结果', selector: '', expected: '结果符合预期' }
        );
    }
    
    return steps;
  }

  /**
   * 应用更新
   * @param {string} modulePath - 模块路径
   * @param {string} moduleName - 模块名称
   * @param {Object} existingModule - 现有模块
   * @param {Object} updatePlan - 更新计划
   * @param {Object} resources - 资源
   * @param {Object} options - 选项
   * @returns {Object}
   */
  async applyUpdate(modulePath, moduleName, existingModule, updatePlan, resources, options) {
    const structure = {
      root: modulePath,
      cases: path.join(modulePath, 'cases'),
      scripts: path.join(modulePath, 'scripts'),
      data: path.join(modulePath, 'data'),
      config: path.join(modulePath, 'config'),
      docs: path.join(modulePath, 'docs')
    };
    
    const result = {
      moduleName,
      modulePath,
      statistics: {
        added: 0,
        updated: 0,
        deleted: 0,
        total: 0
      },
      newCases: [],
      updatedCases: [],
      unchangedCases: updatePlan.unchangedCases.map(tc => tc.id)
    };
    
    // 1. 保存新增用例
    for (const testCase of updatePlan.newCases) {
      const caseFileName = `${testCase.id}.json`;
      fs.writeFileSync(
        path.join(structure.cases, caseFileName),
        JSON.stringify(testCase.toJSON(), null, 2),
        'utf-8'
      );
      result.newCases.push({
        id: testCase.id,
        name: testCase.name,
        priority: testCase.priority
      });
      result.statistics.added++;
    }
    
    // 2. 更新现有用例（创建新版本）
    for (const { testCase, reason } of updatePlan.updatedCases) {
      testCase.createVersion(this.incrementVersion(testCase.version), `自动更新: ${reason}`);
      testCase.updatedAt = new Date().toISOString();
      
      const caseFileName = `${testCase.id}.json`;
      fs.writeFileSync(
        path.join(structure.cases, caseFileName),
        JSON.stringify(testCase.toJSON(), null, 2),
        'utf-8'
      );
      result.updatedCases.push({
        id: testCase.id,
        name: testCase.name,
        reason
      });
      result.statistics.updated++;
    }
    
    // 3. 更新资源配置
    fs.writeFileSync(
      path.join(structure.config, 'resources.json'),
      JSON.stringify(resources, null, 2),
      'utf-8'
    );
    
    // 4. 更新用例清单
    const allCases = [...updatePlan.unchangedCases, ...updatePlan.newCases];
    for (const { testCase } of updatePlan.updatedCases) {
      allCases.push(testCase);
    }
    
    const caseList = allCases.map(tc => ({
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
    
    // 5. 保存更新历史
    const updateHistoryPath = path.join(structure.config, 'update-history.json');
    let updateHistory = [];
    if (fs.existsSync(updateHistoryPath)) {
      updateHistory = JSON.parse(fs.readFileSync(updateHistoryPath, 'utf-8'));
    }
    
    updateHistory.push({
      timestamp: new Date().toISOString(),
      prompt: options.originalPrompt || '',
      statistics: result.statistics,
      newCases: result.newCases.map(c => c.id),
      updatedCases: result.updatedCases.map(c => c.id)
    });
    
    fs.writeFileSync(
      updateHistoryPath,
      JSON.stringify(updateHistory, null, 2),
      'utf-8'
    );
    
    // 6. 更新模块摘要
    result.statistics.total = allCases.length;
    const summary = {
      name: moduleName,
      lastUpdated: new Date().toISOString(),
      updateCount: updateHistory.length,
      statistics: result.statistics,
      resources: {
        prdCount: resources.prdFiles.length,
        backendCount: resources.backendCode.length,
        frontendCount: resources.frontendCode.length
      }
    };
    
    fs.writeFileSync(
      path.join(modulePath, 'module-summary.json'),
      JSON.stringify(summary, null, 2),
      'utf-8'
    );
    
    return result;
  }

  /**
   * 生成更新报告
   * @param {string} modulePath - 模块路径
   * @param {Object} result - 更新结果
   * @param {Object} changes - 变更
   * @param {Object} coverage - 覆盖率
   */
  async generateUpdateReport(modulePath, result, changes, coverage) {
    const reportPath = path.join(modulePath, 'docs', 'UPDATE_REPORT.md');
    
    const report = `# 模块更新报告

## 更新时间
${new Date().toLocaleString('zh-CN')}

## 更新统计

| 类型 | 数量 |
|------|------|
| 新增用例 | ${result.statistics.added} |
| 更新用例 | ${result.statistics.updated} |
| 删除用例 | ${result.statistics.deleted} |
| 总用例数 | ${result.statistics.total} |

## 新增用例

${result.newCases.map(c => `- **${c.name}** (${c.id}) - 优先级: ${c.priority}`).join('\n')}

## 更新用例

${result.updatedCases.map(c => `- **${c.name}** (${c.id}) - 原因: ${c.reason}`).join('\n')}

## 代码变更检测

### PRD文档变更
${changes.prdChanges.map(c => `- ${c.type === 'added' ? '新增' : '修改'}: ${c.file.name}`).join('\n') || '无变更'}

### 后端代码变更
${changes.backendChanges.map(c => `- ${c.type === 'added' ? '新增' : '修改'}: ${c.file.name} (${c.file.type})`).join('\n') || '无变更'}

### 前端代码变更
${changes.frontendChanges.map(c => `- ${c.type === 'added' ? '新增' : '修改'}: ${c.file.name} (${c.file.type})`).join('\n') || '无变更'}

## 用例覆盖率分析

- 覆盖率: ${(coverage.coverageRatio * 100).toFixed(1)}%
- 推荐用例数: ${coverage.recommendedCount}
- 缺失场景: ${coverage.missingScenarios.length}

### 已覆盖场景
${coverage.recommendedScenarios.filter(s => !coverage.missingScenarios.includes(s)).map(s => `- ✅ ${s.name} (${s.priority})`).join('\n')}

### 新增覆盖场景
${result.newCases.map(c => `- ✅ ${c.name}`).join('\n')}

## 建议

${coverage.coverageRatio < 1 ? '- 用例覆盖率未达100%，建议继续补充缺失场景' : '- 用例覆盖率良好'}
${changes.hasChanges ? '- 代码有变更，请关注相关测试用例的执行结果' : '- 代码无重大变更'}

---
*报告由 Auto-Test Module Updater 自动生成*
`;
    
    fs.writeFileSync(reportPath, report, 'utf-8');
  }

  /**
   * 提取标签
   * @param {string} name - 名称
   * @returns {Array}
   */
  extractTags(name) {
    const tags = [];
    if (name.includes('导出')) tags.push('导出');
    if (name.includes('导入')) tags.push('导入');
    if (name.includes('查询')) tags.push('查询');
    if (name.includes('API')) tags.push('API');
    if (name.includes('权限')) tags.push('权限');
    if (name.includes('异常')) tags.push('异常');
    return tags;
  }

  /**
   * 计算字符串相似度
   * @param {string} str1 - 字符串1
   * @param {string} str2 - 字符串2
   * @returns {number}
   */
  calculateSimilarity(str1, str2) {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    // 简单的包含检测
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;
    
    // 计算共同子串
    let common = 0;
    const minLen = Math.min(s1.length, s2.length);
    for (let i = 0; i < minLen; i++) {
      if (s1[i] === s2[i]) common++;
    }
    
    return common / Math.max(s1.length, s2.length);
  }

  /**
   * 计算资源哈希
   * @param {Object} resources - 资源
   * @returns {string}
   */
  calculateResourceHash(resources) {
    const hash = crypto.createHash('md5');
    hash.update(JSON.stringify(resources));
    return hash.digest('hex');
  }

  /**
   * 增加版本号
   * @param {string} version - 当前版本
   * @returns {string}
   */
  incrementVersion(version) {
    const parts = version.split('.');
    const lastPart = parseInt(parts[parts.length - 1], 10);
    parts[parts.length - 1] = (lastPart + 1).toString();
    return parts.join('.');
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

module.exports = ModuleUpdater;
