/**
 * 测试用例模型
 * 表示一个完整的测试用例，包含步骤、依赖、版本等信息
 */

class TestCase {
  /**
   * @param {Object} options
   * @param {string} options.name - 用例名称
   * @param {string} [options.description] - 用例描述
   * @param {string} [options.module] - 所属模块
   * @param {string} [options.priority] - 优先级 P0/P1/P2
   * @param {string} [options.author] - 作者
   * @param {string[]} [options.tags] - 标签
   * @param {string} [options.prdReference] - PRD文档引用
   * @param {string[]} [options.codeReferences] - 代码引用
   */
  constructor(options = {}) {
    this.id = options.id || this.generateId();
    this.name = options.name || '';
    this.description = options.description || '';
    this.module = options.module || '';
    this.priority = options.priority || 'P1';
    this.status = options.status || 'ready';
    this.version = options.version || '1.0.0';
    this.author = options.author || '';
    this.tags = options.tags || [];
    this.prdReference = options.prdReference || '';
    this.codeReferences = options.codeReferences || [];
    this.steps = options.steps || [];
    this.preconditions = options.preconditions || [];
    this.expectedResults = options.expectedResults || {};
    this.dependencies = options.dependencies || [];
    this.testData = options.testData || {};
    this.apiEndpoints = options.apiEndpoints || [];
    this.versionHistory = options.versionHistory || [];
    this.changelog = options.changelog || [];
    this.createdAt = options.createdAt || new Date().toISOString();
    this.updatedAt = options.updatedAt || new Date().toISOString();
    this.filePath = options.filePath || '';
  }

  /**
   * 生成用例ID
   * @returns {string}
   */
  generateId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'TC-';
    for (let i = 0; i < 8; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

  /**
   * 添加测试步骤
   * @param {Object} step - { action, target, value?, expected?, selector?, timeout? }
   */
  addStep(step) {
    const order = this.steps.length + 1;
    this.steps.push({
      id: step.id || `STEP-${order}`,
      order,
      action: step.action || '',
      target: step.target || '',
      selector: step.selector || '',
      value: step.value || '',
      expected: step.expected || '',
      timeout: step.timeout,
      body: step.body,
      filePath: step.filePath,
      fileName: step.fileName
    });
  }

  /**
   * 添加依赖
   * @param {string} caseId - 依赖的用例ID
   * @param {string} type - 依赖类型 (如 'before')
   */
  addDependency(caseId, type = 'before') {
    if (!this.dependencies.some(d => d.caseId === caseId)) {
      this.dependencies.push({ caseId, type });
    }
  }

  /**
   * 创建新版本
   * @param {string} version - 新版本号
   * @param {string} description - 变更说明
   */
  createVersion(version, description) {
    this.versionHistory.push({
      version: this.version,
      updatedAt: this.updatedAt,
      data: this.toJSON(),
      description: description || ''
    });

    this.changelog.push({
      version,
      description: description || ''
    });

    this.version = version;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * 回滚到指定版本
   * @param {string} version - 目标版本号
   */
  rollbackToVersion(version) {
    const historyEntry = this.versionHistory.find(h => h.version === version);
    if (!historyEntry || !historyEntry.data) {
      throw new Error(`版本 ${version} 不存在或无数据`);
    }

    // 保存当前状态到版本历史
    this.versionHistory.push({
      version: this.version,
      updatedAt: this.updatedAt,
      data: this.toJSON(),
      description: `回滚前自动保存`
    });

    // 从历史数据恢复
    const data = historyEntry.data;
    this.name = data.name || this.name;
    this.description = data.description || this.description;
    this.module = data.module || this.module;
    this.priority = data.priority || this.priority;
    this.status = data.status || this.status;
    this.version = version;
    this.steps = data.steps || this.steps;
    this.preconditions = data.preconditions || this.preconditions;
    this.expectedResults = data.expectedResults || this.expectedResults;
    this.dependencies = data.dependencies || this.dependencies;
    this.testData = data.testData || this.testData;
    this.apiEndpoints = data.apiEndpoints || this.apiEndpoints;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * 序列化为JSON对象
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      module: this.module,
      priority: this.priority,
      status: this.status,
      version: this.version,
      author: this.author,
      tags: this.tags,
      prdReference: this.prdReference,
      codeReferences: this.codeReferences,
      steps: this.steps.map(s => ({ ...s })),
      preconditions: [...this.preconditions],
      expectedResults: { ...this.expectedResults },
      dependencies: this.dependencies.map(d => ({ ...d })),
      testData: this.testData ? JSON.parse(JSON.stringify(this.testData)) : {},
      apiEndpoints: this.apiEndpoints ? this.apiEndpoints.map(e => typeof e === 'object' ? { ...e } : e) : [],
      versionHistory: this.versionHistory.map(h => ({
        ...h,
        data: h.data ? JSON.parse(JSON.stringify(h.data)) : null
      })),
      changelog: this.changelog.map(c => ({ ...c })),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      filePath: this.filePath
    };
  }

  /**
   * 从JSON对象创建TestCase实例
   * @param {Object} data - JSON数据
   * @returns {TestCase}
   */
  static fromJSON(data) {
    if (!data) return new TestCase();

    return new TestCase({
      id: data.id,
      name: data.name,
      description: data.description,
      module: data.module,
      priority: data.priority,
      status: data.status,
      version: data.version,
      author: data.author,
      tags: data.tags || [],
      prdReference: data.prdReference || '',
      codeReferences: data.codeReferences || [],
      steps: data.steps || [],
      preconditions: data.preconditions || [],
      expectedResults: data.expectedResults || {},
      dependencies: (data.dependencies || []).map(d =>
        typeof d === 'string' ? { caseId: d, type: 'before' } : d
      ),
      testData: data.testData || {},
      apiEndpoints: data.apiEndpoints || [],
      versionHistory: data.versionHistory || [],
      changelog: data.changelog || [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      filePath: data.filePath || ''
    });
  }
}

module.exports = TestCase;
