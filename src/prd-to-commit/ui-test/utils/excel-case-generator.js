/**
 * Excel 测试用例生成器 / 同步器
 * 支持 JSON↔Excel 双向同步
 *
 * 步骤格式：序号|action|target|selector|value|expected（pipe分隔，无损还原JSON嵌套结构）
 * 表头17列：用例编号|测试模块|测试子项|优先级|测试维度|测试方向|前置条件|测试步骤|API端点|依赖用例|输入数据|预期结果|实际结果|测试结论|版本|作者|状态
 */

const fs = require('fs');
const path = require('path');

class ExcelCaseGenerator {
  constructor(options = {}) {
    this.outputDir = options.outputDir || 'tests/modules';
    this.useXlsx = false;
    try {
      require.resolve('xlsx', { paths: [process.cwd()] });
      this.useXlsx = true;
    } catch (e) {
      // xlsx 不可用，使用 CSV 格式
    }
  }

  /**
   * Excel 表头定义（17列）
   */
  getHeaders() {
    return [
      { key: 'id',              label: '用例编号',   width: 18, desc: '唯一身份ID，用于追溯和关联缺陷' },
      { key: 'module',          label: '测试模块',   width: 16, desc: '功能所属大板块，用于筛选统计' },
      { key: 'subModule',       label: '测试子项',   width: 16, desc: '模块下的具体功能点' },
      { key: 'priority',        label: '优先级',     width: 10, desc: 'P0(高)/P1(中)/P2(低)' },
      { key: 'dimension',       label: '测试维度',   width: 12, desc: '功能/兼容/性能/安全' },
      { key: 'direction',       label: '测试方向',   width: 10, desc: '正向/反向/边界' },
      { key: 'preconditions',   label: '前置条件',   width: 30, desc: '执行前必须满足的状态' },
      { key: 'steps',           label: '测试步骤',   width: 60, desc: '格式：序号|action|target|selector|value|expected，每步一行' },
      { key: 'apiEndpoints',    label: 'API端点',    width: 30, desc: '格式：方法 URL 描述，多个换行分隔' },
      { key: 'dependencies',    label: '依赖用例',   width: 20, desc: '依赖的用例ID，逗号分隔' },
      { key: 'inputData',       label: '输入数据',   width: 25, desc: '步骤中使用的具体数值' },
      { key: 'expectedResults', label: '预期结果',   width: 35, desc: '可观察的、具体的系统反馈' },
      { key: 'actualResult',    label: '实际结果',   width: 25, desc: '执行后真实发生的情况（执行时填写）' },
      { key: 'conclusion',      label: '测试结论',   width: 12, desc: '通过/失败/阻塞（执行时勾选）' },
      { key: 'version',         label: '版本',       width: 10, desc: '用例版本号' },
      { key: 'author',          label: '作者',       width: 12, desc: '用例作者' },
      { key: 'status',          label: '状态',       width: 10, desc: 'ready/draft/deprecated' }
    ];
  }

  /**
   * 将 JSON 用例转换为 Excel 行数据
   * @param {Object} testCase - JSON 测试用例
   * @returns {Object} Excel 行数据
   */
  testCaseToRow(testCase) {
    // 步骤格式：序号|action|target|selector|value|expected
    const stepsText = (testCase.steps || []).map(step => {
      return [
        step.order || '',
        step.action || '',
        step.target || '',
        step.selector || '',
        step.value || '',
        step.expected || ''
      ].join('|');
    }).join('\n');

    // 格式化 API 端点：方法 URL 描述
    const apiEndpoints = (testCase.apiEndpoints || []).map(e =>
      `${e.method || ''} ${e.url || ''} ${e.description || ''}`.trim()
    ).join('\n');

    // 格式化依赖用例
    const dependencies = (testCase.dependencies || []).map(d =>
      typeof d === 'string' ? d : d.caseId
    ).join(',');

    // 格式化输入数据
    const inputData = testCase.testData && Object.keys(testCase.testData).length > 0
      ? Object.entries(testCase.testData)
          .map(([key, value]) => `${key}：${value}`)
          .join('\n')
      : '';

    // 格式化前置条件
    const preconditions = (testCase.preconditions || []).length > 0
      ? testCase.preconditions.join('\n')
      : '';

    // 格式化预期结果
    const expectedResults = (testCase.expectedResults || []).length > 0
      ? testCase.expectedResults.join('\n')
      : '';

    // 从 name 提取测试子项
    const nameParts = (testCase.name || '').split('-');
    const subModule = nameParts.length > 1 ? nameParts.slice(1).join('-').trim() : '';

    return {
      id: testCase.id || '',
      module: testCase.module || '',
      subModule,
      priority: testCase.priority || 'P1',
      dimension: testCase.dimension || 'functional',
      direction: testCase.direction || 'positive',
      preconditions,
      steps: stepsText,
      apiEndpoints,
      dependencies,
      inputData,
      expectedResults,
      actualResult: '',
      conclusion: '',
      version: testCase.version || '1.0.0',
      author: testCase.author || 'Auto-Test',
      status: testCase.status || 'ready'
    };
  }

  /**
   * 将 Excel 行数据反向解析为 JSON 用例
   * @param {Object} row - Excel 行数据（key 为表头 key）
   * @returns {Object} JSON 测试用例
   */
  parseExcelRowToTestCase(row) {
    // 解析步骤：按换行拆分，再按 | 拆分
    const steps = (row.steps || '').split('\n').filter(Boolean).map(line => {
      const parts = line.split('|');
      return {
        order: parseInt(parts[0]) || 1,
        action: parts[1] || 'verify',
        target: parts[2] || '',
        selector: parts[3] || '',
        value: parts[4] || '',
        expected: parts[5] || ''
      };
    });

    // 解析 API 端点：方法 URL 描述
    const apiEndpoints = (row.apiEndpoints || '').split('\n').filter(Boolean).map(line => {
      const parts = line.split(' ');
      return {
        method: parts[0] || '',
        url: parts[1] || '',
        description: parts.slice(2).join(' ') || ''
      };
    });

    // 解析依赖用例
    const dependencies = (row.dependencies || '').split(',').map(s => s.trim()).filter(Boolean);

    // 解析前置条件
    const preconditions = (row.preconditions || '').split('\n').map(s => s.trim()).filter(Boolean);

    // 解析预期结果
    const expectedResults = (row.expectedResults || '').split('\n').map(s => s.trim()).filter(Boolean);

    // 解析 testData
    const testData = {};
    (row.inputData || '').split('\n').filter(Boolean).forEach(line => {
      const sepIndex = line.indexOf('：');
      if (sepIndex > 0) {
        testData[line.substring(0, sepIndex).trim()] = line.substring(sepIndex + 1).trim();
      }
    });

    // 构造用例名称：模块-子项
    const name = row.subModule ? `${row.module}-${row.subModule}` : (row.module || row.id);

    return {
      id: row.id || '',
      name,
      module: row.module || '',
      priority: row.priority || 'P1',
      dimension: row.dimension || 'functional',
      direction: row.direction || 'positive',
      status: row.status || 'ready',
      version: row.version || '1.0.0',
      author: row.author || 'Auto-Test',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preconditions,
      steps,
      expectedResults,
      testData,
      apiEndpoints,
      dependencies
    };
  }

  /**
   * 从 Excel 同步回 JSON 用例文件
   * @param {string} moduleName - 模块名称
   * @param {Object} options - 选项
   * @returns {Object} 同步结果 { updated, created, total }
   */
  syncFromExcel(moduleName, options = {}) {
    const modulePath = path.join(this.outputDir, moduleName);
    const casesDir = path.join(modulePath, 'cases');

    if (!fs.existsSync(casesDir)) {
      throw new Error(`用例目录不存在: ${casesDir}`);
    }

    // 1. 找到 Excel 文件
    const excelFile = fs.readdirSync(casesDir).find(f =>
      f.endsWith('.xlsx') && f.includes('测试用例')
    );
    if (!excelFile) {
      throw new Error(`未找到测试用例 Excel 文件（${casesDir} 中无 *测试用例.xlsx）`);
    }

    // 2. 读取 Excel
    const XLSX = require('xlsx');
    const workbook = XLSX.readFile(path.join(casesDir, excelFile));
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      throw new Error('Excel 文件为空，无测试用例数据');
    }

    // 3. 映射表头 label → key，解析每行
    const headers = this.getHeaders();
    const labelToKey = new Map(headers.map(h => [h.label, h.key]));

    const testCases = [];
    for (const row of rows) {
      const mappedRow = {};
      for (const [label, value] of Object.entries(row)) {
        const key = labelToKey.get(label) || label;
        mappedRow[key] = String(value || '');
      }
      const testCase = this.parseExcelRowToTestCase(mappedRow);
      testCases.push(testCase);
    }

    // 4. 写回 JSON 文件（优先匹配已有文件，避免重复）
    let updated = 0;
    let created = 0;

    // 建立现有 JSON 文件索引：id → filePath
    // 需要读取 JSON 内容获取真实 id，因为文件名中的 id 格式可能与 JSON id 不一致
    const existingJsonFiles = fs.readdirSync(casesDir).filter(f => f.endsWith('.json'));
    const jsonFileMap = new Map();
    for (const file of existingJsonFiles) {
      try {
        const content = JSON.parse(fs.readFileSync(path.join(casesDir, file), 'utf-8'));
        if (content.id) {
          jsonFileMap.set(content.id, path.join(casesDir, file));
        }
      } catch (e) {}
    }

    for (const tc of testCases) {
      if (!tc.id) continue;

      // 优先使用已有文件路径，保持文件名一致性
      const existingPath = jsonFileMap.get(tc.id);
      const fileName = existingPath
        ? path.basename(existingPath)
        : `${tc.id}-${this.sanitizeForFileName(tc.name)}.json`;
      const filePath = path.join(casesDir, fileName);

      if (existingPath) {
        // 保留原有 JSON 中的 createdAt
        try {
          const existing = JSON.parse(fs.readFileSync(existingPath, 'utf-8'));
          tc.createdAt = existing.createdAt || tc.createdAt;
        } catch (e) {}
        updated++;
      } else {
        created++;
      }

      fs.writeFileSync(filePath, JSON.stringify(tc, null, 2), 'utf-8');
    }

    // 5. 删除 Excel 中已不存在的旧 JSON 用例（可选，--force 时执行）
    if (options.force) {
      const excelIds = new Set(testCases.map(tc => tc.id));
      const existingJsonFiles = fs.readdirSync(casesDir).filter(f => f.endsWith('.json'));
      let deleted = 0;
      for (const file of existingJsonFiles) {
        const jsonId = file.split('-')[0];
        if (!excelIds.has(jsonId)) {
          fs.unlinkSync(path.join(casesDir, file));
          deleted++;
        }
      }
      if (deleted > 0) {
        console.log(`   删除过期用例: ${deleted} 个`);
      }
    }

    console.log(`✅ Excel → JSON 同步完成`);
    console.log(`   更新: ${updated} 个 | 新增: ${created} 个 | 总计: ${testCases.length} 个`);

    return { updated, created, total: testCases.length };
  }

  /**
   * 清理文件名中的非法字符
   */
  sanitizeForFileName(name) {
    return (name || '')
      .replace(/[\\/:*?"<>|]/g, '_')
      .replace(/\s+/g, '')
      .substring(0, 60);
  }

  /**
   * 生成 CSV 格式内容（Excel 可直接打开）
   */
  generateCSV(testCases) {
    const headers = this.getHeaders();
    const BOM = '﻿';

    const headerRow = headers.map(h => h.label).join(',');

    const dataRows = testCases.map(tc => {
      const row = this.testCaseToRow(tc);
      return headers.map(h => {
        const value = row[h.key] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',');
    });

    return BOM + headerRow + '\n' + dataRows.join('\n');
  }

  /**
   * 生成 XLSX 格式
   */
  generateXLSX(testCases) {
    const XLSX = require('xlsx');
    const headers = this.getHeaders();
    const rows = testCases.map(tc => this.testCaseToRow(tc));

    const wsData = [
      headers.map(h => h.label),
      ...rows.map(row => headers.map(h => row[h.key] || ''))
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws['!cols'] = headers.map(h => ({ wch: h.width }));

    XLSX.utils.book_append_sheet(wb, ws, '测试用例');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * 为指定模块生成 Excel 用例文件（JSON → Excel）
   */
  generateForModule(moduleName, options = {}) {
    const modulePath = path.join(this.outputDir, moduleName);
    const casesDir = path.join(modulePath, 'cases');

    if (!fs.existsSync(casesDir)) {
      throw new Error(`用例目录不存在: ${casesDir}`);
    }

    // 读取所有 JSON 用例
    const caseFiles = fs.readdirSync(casesDir).filter(f => f.endsWith('.json'));
    const testCases = [];

    for (const file of caseFiles) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(casesDir, file), 'utf-8'));
        testCases.push(data);
      } catch (e) {
        console.warn(`⚠️  跳过无效用例: ${file}`);
      }
    }

    if (testCases.length === 0) {
      throw new Error('未找到有效的测试用例');
    }

    // 按 priority 和 id 排序
    const priorityOrder = { P0: 0, P1: 1, P2: 2 };
    testCases.sort((a, b) => {
      const pa = priorityOrder[a.priority] || 1;
      const pb = priorityOrder[b.priority] || 1;
      if (pa !== pb) return pa - pb;
      return (a.id || '').localeCompare(b.id || '');
    });

    // 生成文件
    let filePath;
    if (this.useXlsx && !options.forceCSV) {
      filePath = path.join(casesDir, `${moduleName}-测试用例.xlsx`);
      const buffer = this.generateXLSX(testCases);
      fs.writeFileSync(filePath, buffer);
    } else {
      filePath = path.join(casesDir, `${moduleName}-测试用例.csv`);
      const csv = this.generateCSV(testCases);
      fs.writeFileSync(filePath, csv, 'utf-8');
    }

    console.log(`✅ Excel用例已生成: ${filePath}`);
    console.log(`   用例数量: ${testCases.length}`);
    console.log(`   格式: ${this.useXlsx && !options.forceCSV ? 'xlsx' : 'csv'}`);

    return filePath;
  }
}

// CLI 入口
if (require.main === module) {
  const args = process.argv.slice(2);
  const moduleName = args[0];

  if (!moduleName) {
    console.log('用法: node excel-case-generator.js <模块名称> [--csv] [--sync] [--force]');
    console.log('');
    console.log('命令:');
    console.log('  (默认)    JSON → Excel  从 JSON 用例生成 Excel 文件');
    console.log('  --sync    Excel → JSON  从 Excel 同步回 JSON 用例文件');
    console.log('  --force   配合 --sync，删除 Excel 中已不存在的旧 JSON 用例');
    console.log('  --csv     强制使用 CSV 格式（默认使用 xlsx）');
    console.log('');
    console.log('示例:');
    console.log('  node excel-case-generator.js 配置管理-供应商联系人');
    console.log('  node excel-case-generator.js 配置管理-供应商联系人 --sync');
    console.log('  node excel-case-generator.js 配置管理-供应商联系人 --sync --force');
    process.exit(1);
  }

  const generator = new ExcelCaseGenerator();

  if (args.includes('--sync')) {
    generator.syncFromExcel(moduleName, { force: args.includes('--force') });
  } else {
    generator.generateForModule(moduleName, { forceCSV: args.includes('--csv') });
  }
}

module.exports = ExcelCaseGenerator;
