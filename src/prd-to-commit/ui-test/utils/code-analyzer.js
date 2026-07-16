/**
 * 代码分析器 - 从前端代码中提取测试步骤
 * 
 * 功能：
 * 1. 分析 React/Vue 组件代码
 * 2. 提取表单字段、按钮、表格、弹窗等UI元素
 * 3. 识别用户交互流程
 * 4. 生成具体的测试步骤（非占位符）
 */

const fs = require('fs');

class CodeAnalyzer {
  constructor() {
    this.patterns = {
      // React/Vue 按钮
      buttons: [
        /<Button[^>]*>([^<]+)<\/Button>/gi,
        /button[^>]*>([^<]*)<\/button>/gi,
        /button:has-text\(["']([^"']+)["']\)/gi,
        /getByRole\(['"]button['"],\s*\{[^}]*name:\s*["']([^"']+)["']\}/gi
      ],
      // 输入框
      inputs: [
        /<Input[^>]*placeholder=["']([^"']+)["'][^>]*>/gi,
        /<input[^>]*placeholder=["']([^"']+)["'][^>]*>/gi,
        /<input[^>]*id=["']([^"']+)["'][^>]*>/gi,
        /id=["']([^"']*input|[^"']*field)["']/gi
      ],
      // 表格
      tables: [
        /<Table[^>]*>/gi,
        /<table[^>]*>/gi
      ],
      // 弹窗/对话框
      modals: [
        /<Modal[^>]*>/gi,
        /<Dialog[^>]*>/gi,
        /openModal|showModal|setVisible\(true\)/gi
      ],
      // 菜单
      menus: [
        /<Menu[^>]*>/gi,
        /menuItems|menuList/gi
      ],
      // 表单提交
      formSubmit: [
        /onSubmit|handleSubmit|form\.submit/gi,
        /<form[^>]*>/gi
      ],
      // 操作按钮（如编辑、删除、详情）
      actions: [
        /onClick.*edit|onClick.*delete|onClick.*detail/gi,
        /handleEdit|handleDelete|handleDetail/gi
      ]
    };
  }

  /**
   * 分析前端代码文件
   * @param {string} filePath - 代码文件路径
   * @returns {Object} 分析结果
   */
  analyzeFrontendCode(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      return {
        filePath,
        fileName: filePath.split('/').pop(),
        ...this.extractUIElements(content),
        ...this.extractUserFlows(content),
        rawContent: content.substring(0, 5000) // 保留前5000字符用于AI分析
      };
    } catch (error) {
      console.error(`❌ 分析文件失败: ${filePath}`, error.message);
      return null;
    }
  }

  /**
   * 提取UI元素
   * @param {string} content - 代码内容
   * @returns {Object}
   */
  extractUIElements(content) {
    const elements = {
      buttons: [],
      inputs: [],
      tables: [],
      modals: [],
      menus: []
    };

    // 提取按钮
    const buttonMatches = content.matchAll(/<(?:Button|button)[^>]*>([^<]+)<\/(?:Button|button)>/gi);
    for (const match of buttonMatches) {
      const buttonText = match[1].trim();
      if (buttonText && !elements.buttons.includes(buttonText)) {
        elements.buttons.push(buttonText);
      }
    }

    // 提取输入框（通过 placeholder 或 id）
    const inputMatches = content.matchAll(/<(?:Input|input)[^>]*(?:placeholder|id)=["']([^"']+)["'][^>]*>/gi);
    for (const match of inputMatches) {
      const inputInfo = match[1].trim();
      if (inputInfo && !elements.inputs.includes(inputInfo)) {
        elements.inputs.push(inputInfo);
      }
    }

    // 提取表格列
    const tableColumns = content.matchAll(/<(?:Column|column)[^>]*title=["']([^"']+)["'][^>]*>/gi);
    for (const match of tableColumns) {
      const columnTitle = match[1].trim();
      if (columnTitle && !elements.tables.includes(columnTitle)) {
        elements.tables.push(columnTitle);
      }
    }

    // 提取弹窗标题
    const modalMatches = content.matchAll(/<(?:Modal|Dialog)[^>]*title=["']([^"']+)["'][^>]*>/gi);
    for (const match of modalMatches) {
      const modalTitle = match[1].trim();
      if (modalTitle && !elements.modals.includes(modalTitle)) {
        elements.modals.push(modalTitle);
      }
    }

    // 提取菜单项
    const menuMatches = content.matchAll(/<(?:Menu\.Item|item)[^>]*>([^<]+)<\/(?:Menu\.Item|item)>/gi);
    for (const match of menuMatches) {
      const menuItem = match[1].trim();
      if (menuItem && !elements.menus.includes(menuItem)) {
        elements.menus.push(menuItem);
      }
    }

    return elements;
  }

  /**
   * 提取用户操作流程
   * @param {string} content - 代码内容
   * @returns {Object}
   */
  extractUserFlows(content) {
    const flows = {
      create: [],
      edit: [],
      delete: [],
      view: [],
      export: [],
      search: []
    };

    // 识别新增流程
    if (content.includes('新增') || content.includes('create') || content.includes('add')) {
      flows.create = this.extractCreateFlow(content);
    }

    // 识别编辑流程
    if (content.includes('编辑') || content.includes('edit')) {
      flows.edit = this.extractEditFlow(content);
    }

    // 识别导出流程
    if (content.includes('导出') || content.includes('export') || content.includes('download')) {
      flows.export = this.extractExportFlow(content);
    }

    // 识别搜索流程
    if (content.includes('搜索') || content.includes('查询') || content.includes('search')) {
      flows.search = this.extractSearchFlow(content);
    }

    return { flows };
  }

  /**
   * 提取新增流程步骤
   * @param {string} content - 代码内容
   * @returns {Array}
   */
  extractCreateFlow(content) {
    const steps = [];
    
    // 查找新增按钮
    const addButtonMatch = content.match(/<Button[^>]*>(?:新增|添加|创建|Add)[^<]*<\/Button>/i);
    if (addButtonMatch) {
      steps.push({
        action: 'click',
        target: '新增按钮',
        selector: 'button:has-text("新增")',
        expected: '打开新增弹窗或页面'
      });
    }

    // 查找表单字段
    const formFields = content.matchAll(/<(?:Form\.Item|field)[^>]*label=["']([^"']+)["'][^>]*>/gi);
    for (const match of formFields) {
      const fieldLabel = match[1].trim();
      steps.push({
        action: 'input',
        target: fieldLabel,
        selector: `input[placeholder*="${fieldLabel}"]`,
        expected: `可填写${fieldLabel}`
      });
    }

    // 查找提交按钮
    const submitMatch = content.match(/<Button[^>]*type=["']submit["'][^>]*>([^<]+)<\/Button>/i);
    if (submitMatch) {
      steps.push({
        action: 'click',
        target: submitMatch[1].trim() || '提交按钮',
        selector: 'button[type="submit"]',
        expected: '提交成功，返回列表页'
      });
    }

    return steps;
  }

  /**
   * 提取编辑流程步骤
   * @param {string} content - 代码内容
   * @returns {Array}
   */
  extractEditFlow(content) {
    const steps = [];
    
    // 查找编辑按钮
    steps.push({
      action: 'click',
      target: '编辑按钮',
      selector: 'button:has-text("编辑")',
      expected: '打开编辑弹窗'
    });

    // 修改字段
    steps.push({
      action: 'input',
      target: '表单字段',
      selector: 'input',
      expected: '可修改字段值'
    });

    // 保存
    steps.push({
      action: 'click',
      target: '保存按钮',
      selector: 'button:has-text("保存")',
      expected: '保存成功'
    });

    return steps;
  }

  /**
   * 提取导出流程步骤
   * @param {string} content - 代码内容
   * @returns {Array}
   */
  extractExportFlow(content) {
    return [
      {
        action: 'click',
        target: '导出按钮',
        selector: 'button:has-text("导出")',
        expected: '触发文件下载'
      },
      {
        action: 'verify',
        target: '下载文件',
        selector: 'download',
        expected: '文件下载成功，格式正确'
      }
    ];
  }

  /**
   * 提取搜索流程步骤
   * @param {string} content - 代码内容
   * @returns {Array}
   */
  extractSearchFlow(content) {
    const steps = [];
    
    // 查找搜索输入框
    const searchInputMatch = content.match(/<Input[^>]*placeholder=["']([^"']*搜索[^"']*)["'][^>]*>/i);
    if (searchInputMatch) {
      steps.push({
        action: 'input',
        target: '搜索框',
        selector: `input[placeholder="${searchInputMatch[1].trim()}"]`,
        expected: '可输入搜索条件'
      });
    }

    // 搜索按钮
    steps.push({
      action: 'click',
      target: '搜索按钮',
      selector: 'button:has-text("搜索")',
      expected: '显示搜索结果'
    });

    return steps;
  }

  /**
   * 生成具体测试步骤（非占位符）
   * @param {string} prompt - 功能提示词
   * @param {Array} frontendCodeFiles - 前端代码文件列表
   * @returns {Array} 测试步骤
   */
  generateSpecificSteps(prompt, frontendCodeFiles) {
    const allElements = {
      buttons: [],
      inputs: [],
      tables: [],
      modals: [],
      menus: []
    };

    // 分析所有前端代码文件
    for (const file of frontendCodeFiles) {
      if (file.path && (file.path.endsWith('.tsx') || file.path.endsWith('.jsx') || 
                        file.path.endsWith('.ts') || file.path.endsWith('.js'))) {
        const analysis = this.analyzeFrontendCode(file.path);
        if (analysis) {
          allElements.buttons.push(...analysis.buttons);
          allElements.inputs.push(...analysis.inputs);
          allElements.tables.push(...analysis.tables);
          allElements.modals.push(...analysis.modals);
          allElements.menus.push(...analysis.menus);
        }
      }
    }

    // 去重
    Object.keys(allElements).forEach(key => {
      allElements[key] = [...new Set(allElements[key])];
    });

    // 生成具体步骤
    const steps = [];

    // 1. 导航步骤
    if (allElements.menus.length > 0) {
      steps.push({
        action: 'navigate',
        target: allElements.menus[0],
        selector: `text=${allElements.menus[0]}`,
        expected: `进入${allElements.menus[0]}页面`
      });
    }

    // 2. 验证关键按钮
    allElements.buttons.slice(0, 5).forEach((btn, index) => {
      steps.push({
        action: 'verify',
        target: `${btn}按钮`,
        selector: `button:has-text("${btn}")`,
        expected: `${btn}按钮可见且可点击`
      });
    });

    // 3. 点击主要操作按钮（如新增）
    const addButton = allElements.buttons.find(b => 
      b.includes('新增') || b.includes('添加') || b.includes('创建') || 
      b.toLowerCase().includes('add') || b.toLowerCase().includes('create')
    );
    if (addButton) {
      steps.push({
        action: 'click',
        target: addButton,
        selector: `button:has-text("${addButton}")`,
        expected: '打开新增弹窗或页面'
      });
    }

    // 4. 填写表单
    allElements.inputs.slice(0, 3).forEach((input, index) => {
      steps.push({
        action: 'input',
        target: input,
        selector: `input[placeholder*="${input}"]`,
        value: `测试数据${index + 1}`,
        expected: `可填写${input}`
      });
    });

    // 5. 保存/提交
    const submitButton = allElements.buttons.find(b => 
      b.includes('保存') || b.includes('提交') || b.includes('确定') ||
      b.toLowerCase().includes('save') || b.toLowerCase().includes('submit')
    );
    if (submitButton) {
      steps.push({
        action: 'click',
        target: submitButton,
        selector: `button:has-text("${submitButton}")`,
        expected: '提交成功，显示成功提示'
      });
    }

    // 6. 验证表格数据
    if (allElements.tables.length > 0) {
      steps.push({
        action: 'verify',
        target: '数据表格',
        selector: 'table',
        expected: `表格显示${allElements.tables.length}列数据`
      });
    }

    return {
      steps,
      elements: allElements,
      hasSpecificSelectors: steps.some(s => s.selector && !s.selector.includes('功能'))
    };
  }

  /**
   * 打印分析结果
   * @param {Object} analysis - 分析结果
   */
  printAnalysis(analysis) {
    console.log('\n📊 前端代码分析结果:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (analysis.buttons.length > 0) {
      console.log(`\n🎮 发现 ${analysis.buttons.length} 个按钮:`);
      analysis.buttons.slice(0, 10).forEach(btn => {
        console.log(`   - ${btn}`);
      });
    }

    if (analysis.inputs.length > 0) {
      console.log(`\n📝 发现 ${analysis.inputs.length} 个输入框:`);
      analysis.inputs.slice(0, 10).forEach(input => {
        console.log(`   - ${input}`);
      });
    }

    if (analysis.tables.length > 0) {
      console.log(`\n📊 发现 ${analysis.tables.length} 个表格列:`);
      analysis.tables.slice(0, 10).forEach(col => {
        console.log(`   - ${col}`);
      });
    }

    if (analysis.modals.length > 0) {
      console.log(`\n🪟 发现 ${analysis.modals.length} 个弹窗:`);
      analysis.modals.forEach(modal => {
        console.log(`   - ${modal}`);
      });
    }

    if (analysis.menus.length > 0) {
      console.log(`\n📁 发现 ${analysis.menus.length} 个菜单项:`);
      analysis.menus.forEach(menu => {
        console.log(`   - ${menu}`);
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
}

module.exports = CodeAnalyzer;
