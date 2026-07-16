/**
 * 测试报告生成器
 * 生成详细的HTML/Markdown测试报告
 */

const fs = require('fs');
const path = require('path');

class ReportGenerator {
  constructor(options = {}) {
    // 使用绝对路径或基于当前工作目录的路径
    const baseDir = process.cwd();
    
    this.options = {
      outputDir: options.outputDir || path.join(baseDir, 'docs/report'),
      screenshotsDir: options.screenshotsDir || path.join(baseDir, 'docs/screenshots'),
      downloadsDir: options.downloadsDir || path.join(baseDir, 'docs/downloads'),
      ...options
    };
    
    this.ensureDirectories();
    this.reportData = {
      title: '',
      timestamp: new Date().toLocaleString('zh-CN'),
      module: '',
      prdFile: '',
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      },
      prdCodeComparison: [],
      apiValidations: [],
      apiCalls: [], // 🆕 新增：API调用记录
      uiValidations: [],
      fileValidations: [],
      screenshots: [],
      errors: []
    };
  }

  /**
   * 确保目录存在
   */
  ensureDirectories() {
    [this.options.outputDir, this.options.screenshotsDir, this.options.downloadsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * 设置报告基本信息
   */
  setBasicInfo(info) {
    this.reportData = { ...this.reportData, ...info };
  }

  /**
   * 添加PRD与代码对比结果
   */
  addPrdCodeComparison(differences) {
    this.reportData.prdCodeComparison = differences;
  }

  /**
   * 添加API调用记录
   * @param {Array} apiCalls - API调用列表
   */
  addApiCalls(apiCalls) {
    this.reportData.apiCalls = apiCalls;
  }

  /**
   * 添加API校验结果
   */
  addApiValidation(validation) {
    this.reportData.apiValidations.push(validation);
    this.updateSummary(validation);
  }

  /**
   * 添加UI校验结果
   */
  addUIValidation(validation) {
    this.reportData.uiValidations.push(validation);
    this.updateSummary(validation);
  }

  /**
   * 添加文件校验结果
   */
  addFileValidation(validation) {
    this.reportData.fileValidations.push(validation);
    this.updateSummary(validation);
  }

  /**
   * 添加截图
   * @param {string} name - 截图名称/描述
   * @param {string} filePath - 截图文件名（不包含路径）
   */
  addScreenshot(name, filePath) {
    // 自动添加相对路径前缀，指向 screenshots 目录
    const relativePath = filePath.startsWith('../') ? filePath : `../screenshots/${filePath}`;
    this.reportData.screenshots.push({
      name,
      path: relativePath,
      fileName: filePath,
      timestamp: new Date().toLocaleString('zh-CN')
    });
  }

  /**
   * 更新统计摘要
   */
  updateSummary(validation) {
    this.reportData.summary.total++;
    
    if (validation.valid) {
      this.reportData.summary.passed++;
    } else {
      this.reportData.summary.failed++;
    }
    
    if (validation.warnings && validation.warnings.length > 0) {
      this.reportData.summary.warnings += validation.warnings.length;
    }
  }

  /**
   * 生成HTML报告
   */
  generateHTML() {
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.reportData.title || '测试报告'}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
      background-color: #f5f5f5;
      color: #333;
      line-height: 1.6;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .header h1 {
      font-size: 28px;
      margin-bottom: 10px;
    }
    
    .header .meta {
      opacity: 0.9;
      font-size: 14px;
    }
    
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .card h3 {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
    }
    
    .card .value {
      font-size: 32px;
      font-weight: bold;
    }
    
    .card.pass .value { color: #52c41a; }
    .card.fail .value { color: #f5222d; }
    .card.warning .value { color: #faad14; }
    .card.total .value { color: #1890ff; }
    
    .section {
      background: white;
      padding: 25px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .section h2 {
      font-size: 18px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #f0f0f0;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #f0f0f0;
    }
    
    th {
      background-color: #fafafa;
      font-weight: 600;
      color: #666;
    }
    
    tr:hover {
      background-color: #f5f5f5;
    }
    
    .status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .status.pass {
      background-color: #f6ffed;
      color: #52c41a;
      border: 1px solid #b7eb8f;
    }
    
    .status.fail {
      background-color: #fff2f0;
      color: #f5222d;
      border: 1px solid #ffccc7;
    }
    
    .status.warning {
      background-color: #fffbe6;
      color: #faad14;
      border: 1px solid #ffe58f;
    }
    
    .diff {
      background-color: #fff2f0;
      padding: 10px;
      border-radius: 4px;
      margin: 5px 0;
    }
    
    .diff-title {
      font-weight: bold;
      color: #f5222d;
      margin-bottom: 5px;
    }
    
    .diff-content {
      font-family: monospace;
      font-size: 13px;
    }
    
    .error-list {
      background-color: #fff2f0;
      border: 1px solid #ffccc7;
      border-radius: 4px;
      padding: 15px;
      margin-top: 10px;
    }
    
    .error-item {
      color: #f5222d;
      margin-bottom: 8px;
      padding-left: 20px;
      position: relative;
    }
    
    .error-item:before {
      content: "✗";
      position: absolute;
      left: 0;
      color: #f5222d;
    }
    
    .warning-list {
      background-color: #fffbe6;
      border: 1px solid #ffe58f;
      border-radius: 4px;
      padding: 15px;
      margin-top: 10px;
    }
    
    .warning-item {
      color: #d48806;
      margin-bottom: 8px;
      padding-left: 20px;
      position: relative;
    }
    
    .warning-item:before {
      content: "⚠";
      position: absolute;
      left: 0;
      color: #faad14;
    }
    
    .screenshots {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    
    .screenshot {
      border: 1px solid #e8e8e8;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .screenshot img {
      width: 100%;
      height: auto;
      display: block;
    }
    
    .screenshot .caption {
      padding: 10px;
      background-color: #fafafa;
      font-size: 12px;
      color: #666;
    }
    
    /* 🆕 API调用记录样式 */
    .api-summary {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }
    
    .api-stat {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    
    .api-stat .stat-label {
      font-weight: 600;
      color: #666;
    }
    
    .api-stat .stat-value {
      font-size: 20px;
      font-weight: bold;
      color: #333;
    }
    
    .api-stat.success .stat-value {
      color: #52c41a;
    }
    
    .api-stat.error .stat-value {
      color: #f5222d;
    }
    
    .api-calls-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .api-call-item {
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      overflow: hidden;
      background-color: #fafafa;
    }
    
    .api-call-item.pass {
      border-left: 4px solid #52c41a;
    }
    
    .api-call-item.fail {
      border-left: 4px solid #f5222d;
    }
    
    .api-call-item.warning {
      border-left: 4px solid #faad14;
    }
    
    .api-call-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 15px;
      background-color: #f5f5f5;
      border-bottom: 1px solid #e8e8e8;
    }
    
    .api-method {
      display: inline-block;
      padding: 4px 10px;
      background-color: #1890ff;
      color: white;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .api-url {
      flex: 1;
      font-family: monospace;
      font-size: 13px;
      color: #333;
      word-break: break-all;
    }
    
    .api-status {
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .api-status.pass {
      background-color: #f6ffed;
      color: #52c41a;
      border: 1px solid #b7eb8f;
    }
    
    .api-status.fail {
      background-color: #fff2f0;
      color: #f5222d;
      border: 1px solid #ffccc7;
    }
    
    .api-call-body {
      padding: 15px;
    }
    
    .api-details {
      margin-top: 10px;
    }
    
    .api-details summary {
      cursor: pointer;
      padding: 8px;
      background-color: #e6f7ff;
      border-radius: 4px;
      font-size: 13px;
      color: #1890ff;
      font-weight: 500;
    }
    
    .api-details summary:hover {
      background-color: #bae7ff;
    }
    
    .code-block {
      background-color: #f6f8fa;
      border: 1px solid #e1e4e8;
      border-radius: 4px;
      padding: 12px;
      margin-top: 8px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.5;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
      max-height: 300px;
      overflow-y: auto;
    }
    
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      margin-left: 8px;
    }
    
    .badge.prd {
      background-color: #e6f7ff;
      color: #1890ff;
    }
    
    .badge.code {
      background-color: #f6ffed;
      color: #52c41a;
    }
    
    .comparison-table th {
      width: 25%;
    }
    
    .field-validation {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }
    
    .field-tag {
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    
    .field-tag.pass {
      background-color: #f6ffed;
      color: #52c41a;
    }
    
    .field-tag.fail {
      background-color: #fff2f0;
      color: #f5222d;
    }
    
    .footer {
      text-align: center;
      padding: 20px;
      color: #999;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${this.reportData.title || '测试报告'}</h1>
      <div class="meta">
        <p>测试模块: ${this.reportData.module || 'N/A'}</p>
        <p>PRD文档: ${this.reportData.prdFile || 'N/A'}</p>
        <p>生成时间: ${this.reportData.timestamp}</p>
      </div>
    </div>
    
    <div class="summary-cards">
      <div class="card total">
        <h3>总测试项</h3>
        <div class="value">${this.reportData.summary.total}</div>
      </div>
      <div class="card pass">
        <h3>通过</h3>
        <div class="value">${this.reportData.summary.passed}</div>
      </div>
      <div class="card fail">
        <h3>失败</h3>
        <div class="value">${this.reportData.summary.failed}</div>
      </div>
      <div class="card warning">
        <h3>警告</h3>
        <div class="value">${this.reportData.summary.warnings}</div>
      </div>
    </div>
    
    ${this.generatePrdCodeComparisonSection()}
    
    ${this.generateApiCallsSection()}
    
    ${this.generateApiValidationSection()}
    
    ${this.generateFileValidationSection()}
    
    ${this.generateUIValidationSection()}
    
    ${this.generateScreenshotsSection()}
    
    <div class="footer">
      <p>由 Auto-Test Skill 自动生成</p>
    </div>
  </div>
</body>
</html>`;

    const fileName = `${this.sanitizeFileName(this.reportData.title || '测试报告')}_${this.getTimestamp()}.html`;
    const filePath = path.join(this.options.outputDir, fileName);
    
    fs.writeFileSync(filePath, html, 'utf-8');
    
    return filePath;
  }

  /**
   * 生成PRD与代码对比部分
   */
  generatePrdCodeComparisonSection() {
    if (!this.reportData.prdCodeComparison || this.reportData.prdCodeComparison.length === 0) {
      return '';
    }

    const rows = this.reportData.prdCodeComparison.map(diff => `
      <tr>
        <td>${diff.type}</td>
        <td>${diff.prd || '-'}</td>
        <td>${Array.isArray(diff.code) ? diff.code.join(', ') : (diff.code || '-')}</td>
        <td><span class="status ${diff.status}">${diff.status === 'mismatch' ? '不匹配' : diff.status}</span></td>
      </tr>
    `).join('');

    return `
    <div class="section">
      <h2>PRD与代码对比</h2>
      <table class="comparison-table">
        <thead>
          <tr>
            <th>对比项</th>
            <th>PRD定义</th>
            <th>代码定义</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>`;
  }

  /**
   * 生成API调用记录部分
   */
  generateApiCallsSection() {
    if (!this.reportData.apiCalls || this.reportData.apiCalls.length === 0) {
      return '';
    }

    const apiCalls = this.reportData.apiCalls;
    
    // 统计信息
    const totalCalls = apiCalls.length;
    const successCalls = apiCalls.filter(call => call.status >= 200 && call.status < 300).length;
    const failedCalls = apiCalls.filter(call => call.status >= 400).length;
    
    const rows = apiCalls.map((call, index) => {
      const statusClass = call.status >= 200 && call.status < 300 ? 'pass' : 
                          call.status >= 400 ? 'fail' : 'warning';
      
      // 格式化请求体
      const requestBodyHtml = call.requestBody ? `
        <details class="api-details">
          <summary>请求体</summary>
          <pre class="code-block">${this.formatJson(call.requestBody)}</pre>
        </details>
      ` : '';
      
      // 格式化响应体
      const responseBodyHtml = call.responseBody ? `
        <details class="api-details">
          <summary>响应体 (${call.responseBodyType})</summary>
          <pre class="code-block">${typeof call.responseBody === 'object' ? this.formatJson(call.responseBody) : call.responseBody}</pre>
        </details>
      ` : '';
      
      return `
      <div class="api-call-item ${statusClass}">
        <div class="api-call-header">
          <span class="api-method">${call.method}</span>
          <span class="api-url" title="${call.fullUrl}">${call.url}</span>
          <span class="api-status ${statusClass}">${call.status} ${call.statusText}</span>
        </div>
        <div class="api-call-body">
          ${requestBodyHtml}
          ${responseBodyHtml}
        </div>
      </div>`;
    }).join('');

    return `
    <div class="section">
      <h2>📡 API调用记录</h2>
      
      <div class="api-summary">
        <div class="api-stat">
          <span class="stat-label">总调用数:</span>
          <span class="stat-value">${totalCalls}</span>
        </div>
        <div class="api-stat success">
          <span class="stat-label">成功:</span>
          <span class="stat-value">${successCalls}</span>
        </div>
        <div class="api-stat error">
          <span class="stat-label">失败:</span>
          <span class="stat-value">${failedCalls}</span>
        </div>
      </div>
      
      <div class="api-calls-list">
        ${rows}
      </div>
    </div>`;
  }

  /**
   * 生成API校验部分
   */
  generateApiValidationSection() {
    if (!this.reportData.apiValidations || this.reportData.apiValidations.length === 0) {
      return '';
    }

    return this.reportData.apiValidations.map((validation, index) => {
      const fieldTags = validation.fieldValidations ? validation.fieldValidations.map(v => `
        <span class="field-tag ${v.status}">
          ${v.field}: ${v.expected} → ${v.actual}
        </span>
      `).join('') : '';

      const errors = validation.errors && validation.errors.length > 0 ? `
        <div class="error-list">
          ${validation.errors.map(e => `<div class="error-item">${e}</div>`).join('')}
        </div>
      ` : '';

      const warnings = validation.warnings && validation.warnings.length > 0 ? `
        <div class="warning-list">
          ${validation.warnings.map(w => `<div class="warning-item">${w}</div>`).join('')}
        </div>
      ` : '';

      return `
    <div class="section">
      <h2>API校验 #${index + 1} <span class="status ${validation.valid ? 'pass' : 'fail'}">${validation.valid ? '通过' : '失败'}</span></h2>
      
      <h3>字段校验</h3>
      <div class="field-validation">
        ${fieldTags}
      </div>
      
      ${errors}
      ${warnings}
    </div>`;
    }).join('');
  }

  /**
   * 生成文件校验部分
   */
  generateFileValidationSection() {
    if (!this.reportData.fileValidations || this.reportData.fileValidations.length === 0) {
      return '';
    }

    return this.reportData.fileValidations.map((validation, index) => {
      const validations = validation.validations ? validation.validations.map(v => `
        <tr>
          <td>${v.check}</td>
          <td>${v.expected}</td>
          <td>${v.actual}</td>
          <td><span class="status ${v.status}">${v.status}</span></td>
        </tr>
      `).join('') : '';

      return `
    <div class="section">
      <h2>文件下载校验 #${index + 1} <span class="status ${validation.valid ? 'pass' : 'fail'}">${validation.valid ? '通过' : '失败'}</span></h2>
      
      ${validation.fileInfo ? `
      <p><strong>文件名:</strong> ${validation.fileInfo.name}</p>
      <p><strong>文件大小:</strong> ${this.formatBytes(validation.fileInfo.size)}</p>
      ` : ''}
      
      <table>
        <thead>
          <tr>
            <th>校验项</th>
            <th>预期</th>
            <th>实际</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          ${validations}
        </tbody>
      </table>
      
      ${validation.errors && validation.errors.length > 0 ? `
      <div class="error-list">
        ${validation.errors.map(e => `<div class="error-item">${e}</div>`).join('')}
      </div>
      ` : ''}
    </div>`;
    }).join('');
  }

  /**
   * 生成UI校验部分
   */
  generateUIValidationSection() {
    if (!this.reportData.uiValidations || this.reportData.uiValidations.length === 0) {
      return '';
    }

    return this.reportData.uiValidations.map((validation, index) => {
      const validations = validation.validations ? validation.validations.map(v => `
        <tr>
          <td><code>${v.selector}</code></td>
          <td>${v.expected}</td>
          <td>${v.actual}</td>
          <td><span class="status ${v.status}">${v.status}</span></td>
        </tr>
      `).join('') : '';

      return `
    <div class="section">
      <h2>UI校验 #${index + 1} <span class="status ${validation.valid ? 'pass' : 'fail'}">${validation.valid ? '通过' : '失败'}</span></h2>
      
      <table>
        <thead>
          <tr>
            <th>选择器</th>
            <th>预期</th>
            <th>实际</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          ${validations}
        </tbody>
      </table>
    </div>`;
    }).join('');
  }

  /**
   * 生成截图部分
   */
  generateScreenshotsSection() {
    if (!this.reportData.screenshots || this.reportData.screenshots.length === 0) {
      return '';
    }

    const screenshots = this.reportData.screenshots.map(screenshot => `
      <div class="screenshot">
        <img src="${screenshot.path}" alt="${screenshot.name}" />
        <div class="caption">${screenshot.name} - ${screenshot.timestamp}</div>
      </div>
    `).join('');

    return `
    <div class="section">
      <h2>测试截图</h2>
      <div class="screenshots">
        ${screenshots}
      </div>
    </div>`;
  }

  /**
   * 生成Markdown报告
   */
  generateMarkdown() {
    const md = `# ${this.reportData.title || '测试报告'}

## 1. 测试概览

| 项目 | 值 |
|------|------|
| 测试模块 | ${this.reportData.module || 'N/A'} |
| PRD文档 | ${this.reportData.prdFile || 'N/A'} |
| 生成时间 | ${this.reportData.timestamp} |
| 通过率 | ${this.reportData.summary.total > 0 ? Math.round((this.reportData.summary.passed / this.reportData.summary.total) * 100) : 0}% |

## 2. 测试统计

- **总测试项**: ${this.reportData.summary.total}
- **通过**: ${this.reportData.summary.passed}
- **失败**: ${this.reportData.summary.failed}
- **警告**: ${this.reportData.summary.warnings}

## 3. PRD与代码对比

${this.generateMarkdownPrdComparison()}

## 4. 详细测试结果

${this.generateMarkdownTestResults()}

## 5. 测试截图

${this.generateMarkdownScreenshots()}

---
*由 Auto-Test Skill 自动生成*
`;

    const fileName = `${this.sanitizeFileName(this.reportData.title || '测试报告')}_${this.getTimestamp()}.md`;
    const filePath = path.join(this.options.outputDir, fileName);
    
    fs.writeFileSync(filePath, md, 'utf-8');
    
    return filePath;
  }

  /**
   * 生成Markdown PRD对比部分
   */
  generateMarkdownPrdComparison() {
    if (!this.reportData.prdCodeComparison || this.reportData.prdCodeComparison.length === 0) {
      return '> 未发现PRD与代码的差异';
    }

    const rows = this.reportData.prdCodeComparison.map(diff => 
      `| ${diff.type} | ${diff.prd || '-'} | ${Array.isArray(diff.code) ? diff.code.join(', ') : (diff.code || '-')} | ${diff.status} |`
    ).join('\n');

    return `| 对比项 | PRD定义 | 代码定义 | 状态 |
|--------|---------|----------|------|
${rows}`;
  }

  /**
   * 生成Markdown测试结果部分
   */
  generateMarkdownTestResults() {
    let content = '';

    // 🆕 API调用记录
    if (this.reportData.apiCalls && this.reportData.apiCalls.length > 0) {
      content += '\n### 📡 API调用记录\n\n';
      
      const totalCalls = this.reportData.apiCalls.length;
      const successCalls = this.reportData.apiCalls.filter(call => call.status >= 200 && call.status < 300).length;
      const failedCalls = this.reportData.apiCalls.filter(call => call.status >= 400).length;
      
      content += `**统计**: 总计 ${totalCalls} 次调用 | 成功 ${successCalls} | 失败 ${failedCalls}\n\n`;
      
      this.reportData.apiCalls.forEach((call, index) => {
        const statusEmoji = call.status >= 200 && call.status < 300 ? '✅' : 
                           call.status >= 400 ? '❌' : '⚠️';
        
        content += `#### ${index + 1}. ${call.method} ${call.url}\n\n`;
        content += `- **状态**: ${statusEmoji} ${call.status} ${call.statusText}\n`;
        content += `- **完整URL**: \`${call.fullUrl}\`\n`;
        
        if (call.requestBody) {
          content += `- **请求体**:\n\n\`\`\`json\n${typeof call.requestBody === 'object' ? JSON.stringify(call.requestBody, null, 2) : call.requestBody}\n\`\`\`\n`;
        }
        
        if (call.responseBody) {
          content += `- **响应体** (${call.responseBodyType}):\n\n\`\`\`json\n${typeof call.responseBody === 'object' ? JSON.stringify(call.responseBody, null, 2) : call.responseBody}\n\`\`\`\n`;
        }
        
        content += '\n---\n\n';
      });
    }

    // API校验
    if (this.reportData.apiValidations && this.reportData.apiValidations.length > 0) {
      content += '\n### API校验\n\n';
      this.reportData.apiValidations.forEach((v, i) => {
        content += `#### API校验 #${i + 1} ${v.valid ? '✅ 通过' : '❌ 失败'}\n\n`;
        if (v.errors && v.errors.length > 0) {
          content += '**错误:**\n';
          v.errors.forEach(e => content += `- ❌ ${e}\n`);
          content += '\n';
        }
        if (v.warnings && v.warnings.length > 0) {
          content += '**警告:**\n';
          v.warnings.forEach(w => content += `- ⚠️ ${w}\n`);
          content += '\n';
        }
      });
    }

    // 文件校验
    if (this.reportData.fileValidations && this.reportData.fileValidations.length > 0) {
      content += '\n### 文件下载校验\n\n';
      this.reportData.fileValidations.forEach((v, i) => {
        content += `#### 文件校验 #${i + 1} ${v.valid ? '✅ 通过' : '❌ 失败'}\n\n`;
        if (v.fileInfo) {
          content += `- 文件名: ${v.fileInfo.name}\n`;
          content += `- 文件大小: ${this.formatBytes(v.fileInfo.size)}\n\n`;
        }
        if (v.errors && v.errors.length > 0) {
          v.errors.forEach(e => content += `- ❌ ${e}\n`);
          content += '\n';
        }
      });
    }

    return content || '> 暂无详细测试结果';
  }

  /**
   * 生成Markdown截图部分
   */
  generateMarkdownScreenshots() {
    if (!this.reportData.screenshots || this.reportData.screenshots.length === 0) {
      return '> 暂无截图';
    }

    return this.reportData.screenshots.map(s => 
      `### ${s.name}\n\n![${s.name}](${s.path})\n\n*${s.timestamp}*`
    ).join('\n\n');
  }

  /**
   * 辅助方法：格式化字节数
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 🆕 辅助方法：格式化JSON
   */
  formatJson(data) {
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return JSON.stringify(parsed, null, 2);
      } catch (e) {
        return data;
      }
    }
    return JSON.stringify(data, null, 2);
  }

  /**
   * 辅助方法：获取时间戳
   */
  getTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  }

  /**
   * 辅助方法：清理文件名
   */
  sanitizeFileName(name) {
    return name.replace(/[^\w\u4e00-\u9fa5]/g, '_');
  }
}

module.exports = ReportGenerator;
