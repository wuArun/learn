/**
 * PRD文档解析器
 * 用于从PRD Markdown文档中提取接口定义、字段规范、业务规则
 */

const fs = require('fs');
const path = require('path');

class PrdParser {
  constructor(prdPath) {
    this.prdPath = prdPath;
    this.content = '';
    this.parsedData = {
      api: {},
      fields: [],
      enums: {},
      rules: [],
      flows: []
    };
  }

  /**
   * 加载PRD文档
   */
  load() {
    if (!fs.existsSync(this.prdPath)) {
      throw new Error(`PRD文件不存在: ${this.prdPath}`);
    }
    this.content = fs.readFileSync(this.prdPath, 'utf-8');
    return this;
  }

  /**
   * 解析PRD文档
   */
  parse() {
    this.parseApiDefinition();
    this.parseFieldDefinitions();
    this.parseEnumDefinitions();
    this.parseBusinessRules();
    this.parseFlowDefinitions();
    return this.parsedData;
  }

  /**
   * 解析接口定义
   * 查找包含"接口地址"、"请求方式"等关键字的表格
   */
  parseApiDefinition() {
    // 匹配接口定义表格
    const apiTableRegex = /\|[^|]*接口地址[^|]*\|[^|]*说明[^|]*\|[\s\S]*?(?=\n\n|\n## |$)/i;
    const apiMatch = this.content.match(apiTableRegex);
    
    if (apiMatch) {
      const lines = apiMatch[0].split('\n').filter(line => line.trim());
      lines.forEach(line => {
        if (line.includes('接口地址')) {
          const endpointMatch = line.match(/`([^`]+)`/);
          if (endpointMatch) {
            this.parsedData.api.endpoint = endpointMatch[1];
            // 提取请求方法
            const methodMatch = endpointMatch[1].match(/^(GET|POST|PUT|DELETE|PATCH)/i);
            if (methodMatch) {
              this.parsedData.api.method = methodMatch[1].toUpperCase();
            }
          }
        }
        if (line.includes('接口名称')) {
          const nameMatch = line.match(/\|\s*[^|]*\|\s*([^|]+)\|/);
          if (nameMatch) {
            this.parsedData.api.name = nameMatch[1].trim();
          }
        }
      });
    }

    // 解析请求参数表格
    const paramTableRegex = /\|[^|]*参数名[^|]*\|[^|]*类型[^|]*\|[^|]*必填[^|]*\|[\s\S]*?(?=\n\n|\n## |$)/i;
    const paramMatch = this.content.match(paramTableRegex);
    
    if (paramMatch) {
      this.parsedData.api.params = this.parseTable(paramMatch[0]);
    }

    // 解析响应字段表格
    const responseTableRegex = /\|[^|]*字段名[^|]*\|[^|]*Excel列名[^|]*\|[\s\S]*?(?=\n\n|\n## |$)/i;
    const responseMatch = this.content.match(responseTableRegex);
    
    if (responseMatch) {
      this.parsedData.api.responseFields = this.parseTable(responseMatch[0]);
    }
  }

  /**
   * 解析字段定义
   */
  parseFieldDefinitions() {
    // 查找字段定义表格
    const fieldTableRegex = /\|[^|]*字段名[^|]*\|[^|]*类型[^|]*\|[^|]*说明[^|]*\|[\s\S]*?(?=\n\n|\n## |$)/gi;
    let match;
    
    while ((match = fieldTableRegex.exec(this.content)) !== null) {
      const fields = this.parseTable(match[0]);
      this.parsedData.fields.push(...fields);
    }

    // 解析Excel导出字段
    const excelTableRegex = /\|[^|]*字段名[^|]*\|[^|]*Excel列名[^|]*\|[^|]*数据来源[^|]*\|[\s\S]*?(?=\n\n|\n## |$)/gi;
    while ((match = excelTableRegex.exec(this.content)) !== null) {
      const fields = this.parseTable(match[0]);
      fields.forEach(field => {
        if (field['Excel列名']) {
          field.exportLabel = field['Excel列名'];
        }
        if (field['数据来源']) {
          field.dataSource = field['数据来源'];
        }
      });
      this.parsedData.fields.push(...fields);
    }
  }

  /**
   * 解析枚举值定义
   */
  parseEnumDefinitions() {
    // 查找枚举值表格（值 | 含义 格式）
    const enumTableRegex = /##\s*([\s\S]*?)\n\n\|[^|]*值[^|]*\|[^|]*含义[^|]*\|[\s\S]*?(?=\n\n|\n## |$)/gi;
    let match;
    
    while ((match = enumTableRegex.exec(this.content)) !== null) {
      const enumName = match[1].trim();
      const enumData = this.parseTable(match[0]);
      
      if (enumData.length > 0) {
        const enumMap = {};
        enumData.forEach(item => {
          if (item['值'] && item['含义']) {
            enumMap[item['值'].trim()] = item['含义'].trim();
          }
        });
        
        // 提取枚举名称（从标题）
        const enumKey = this.extractEnumKey(enumName);
        this.parsedData.enums[enumKey] = enumMap;
      }
    }
  }

  /**
   * 解析业务规则
   */
  parseBusinessRules() {
    // 查找规则表格
    const ruleTableRegex = /\|[^|]*规则项[^|]*\|[^|]*说明[^|]*\|[\s\S]*?(?=\n\n|\n## |$)/gi;
    let match;
    
    while ((match = ruleTableRegex.exec(this.content)) !== null) {
      const rules = this.parseTable(match[0]);
      rules.forEach(rule => {
        if (rule['规则项'] && rule['说明']) {
          this.parsedData.rules.push({
            name: rule['规则项'].trim(),
            description: rule['说明'].trim()
          });
        }
      });
    }

    // 解析数据限制规则
    const limitRegex = /导出数量上限.*?(\d+)/i;
    const limitMatch = this.content.match(limitRegex);
    if (limitMatch) {
      this.parsedData.rules.push({
        name: '导出数量上限',
        value: parseInt(limitMatch[1]),
        description: `最多${limitMatch[1]}条记录`
      });
    }
  }

  /**
   * 解析流程定义
   */
  parseFlowDefinitions() {
    // 查找流程步骤
    const flowStepRegex = /(\d+)\.\s*(.+?)(?=\n\d+\.|\n##|$)/gs;
    let match;
    
    while ((match = flowStepRegex.exec(this.content)) !== null) {
      this.parsedData.flows.push({
        step: match[1].trim(),
        description: match[2].trim()
      });
    }
  }

  /**
   * 解析Markdown表格
   */
  parseTable(tableContent) {
    const lines = tableContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    // 提取表头
    const headerLine = lines[0];
    const headers = headerLine.split('|')
      .map(h => h.trim())
      .filter(h => h);

    // 提取数据行（跳过分隔符行）
    const dataRows = lines.slice(2);
    const results = [];

    dataRows.forEach(row => {
      const cells = row.split('|')
        .map(c => c.trim())
        .filter(c => c);
      
      if (cells.length >= headers.length) {
        const rowData = {};
        headers.forEach((header, index) => {
          rowData[header] = cells[index] || '';
        });
        results.push(rowData);
      }
    });

    return results;
  }

  /**
   * 从标题提取枚举键名
   */
  extractEnumKey(title) {
    // 移除常见前缀后缀
    const cleaned = title
      .replace(/值集|枚举|定义|状态|表/gi, '')
      .trim();
    
    // 转换为驼峰命名
    return cleaned
      .replace(/[^\w\s]/g, '')
      .replace(/\s+(.)/g, (match, group) => group.toUpperCase())
      .replace(/^(.)/, (match, group) => group.toLowerCase());
  }

  /**
   * 获取解析后的数据
   */
  getParsedData() {
    return this.parsedData;
  }

  /**
   * 获取接口定义
   */
  getApiDefinition() {
    return this.parsedData.api;
  }

  /**
   * 获取字段定义
   */
  getFieldDefinitions() {
    return this.parsedData.fields;
  }

  /**
   * 获取枚举定义
   */
  getEnumDefinitions() {
    return this.parsedData.enums;
  }

  /**
   * 获取业务规则
   */
  getBusinessRules() {
    return this.parsedData.rules;
  }

  /**
   * 打印解析摘要
   */
  printSummary() {
    console.log('\n=== PRD解析摘要 ===');
    console.log(`接口: ${this.parsedData.api.method} ${this.parsedData.api.endpoint}`);
    console.log(`接口名称: ${this.parsedData.api.name}`);
    console.log(`字段数量: ${this.parsedData.fields.length}`);
    console.log(`枚举定义: ${Object.keys(this.parsedData.enums).length}个`);
    console.log(`业务规则: ${this.parsedData.rules.length}条`);
    console.log('===================\n');
  }
}

module.exports = PrdParser;
