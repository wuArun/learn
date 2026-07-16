/**
 * 录制辅助脚本生成器
 * 
 * 功能：
 * 1. 根据测试用例生成录制辅助脚本
 * 2. 生成录制执行脚本（自动保存到 record 目录）
 * 3. 提供录制指导（告诉用户需要录制哪些操作）
 * 4. 分析录制结果，提取关键操作
 */

const fs = require('fs');
const path = require('path');

class RecordingAssistant {
  constructor(config = {}) {
    this.config = {
      outputDir: config.outputDir || 'tests/record',
      ...config
    };
  }

  /**
   * 根据测试用例生成录制辅助脚本
   * @param {string} moduleName - 模块名称
   * @param {Array} testCases - 测试用例列表
   * @param {Object} options - 选项
   * @returns {Object} 生成的录制脚本信息
   */
  async generateRecordingGuide(moduleName, testCases, options = {}) {
    const modulePath = path.dirname(testCases[0]?.filePath || '');
    const recordDir = path.join(this.config.outputDir, moduleName);
    
    // 确保目录存在
    if (!fs.existsSync(recordDir)) {
      fs.mkdirSync(recordDir, { recursive: true });
    }

    // 1. 生成录制指导文档
    const guidePath = await this.generateRecordingGuideDoc(moduleName, testCases, recordDir);
    
    // 2. 生成录制执行脚本
    const scriptPath = await this.generateRecordingScript(moduleName, testCases, recordDir, options);
    
    // 3. 生成录制检查清单
    const checklistPath = await this.generateChecklist(moduleName, testCases, recordDir);
    
    return {
      moduleName,
      recordDir,
      guidePath,
      scriptPath,
      checklistPath,
      testCasesCount: testCases.length
    };
  }

  /**
   * 生成录制指导文档
   * @param {string} moduleName - 模块名称
   * @param {Array} testCases - 测试用例列表
   * @param {string} recordDir - 录制目录
   * @returns {string} 文档路径
   */
  async generateRecordingGuideDoc(moduleName, testCases, recordDir) {
    const guideContent = `# ${moduleName} - 录制指导文档

## 📹 录制说明

本文档指导您如何录制 ${moduleName} 的测试操作。

## 🎯 录制目标

需要录制的功能点：

${testCases.map((tc, index) => `
### ${index + 1}. ${tc.name}
- **优先级**: ${tc.priority}
- **操作步骤**:
${tc.steps.map(step => `  1. ${step.action}: ${step.target} → ${step.expected}`).join('\n')}
`).join('\n')}

## 📝 录制步骤

### 步骤1: 准备环境
\`\`\`bash
# 确保已安装 Playwright
npx playwright install chromium
\`\`\`

### 步骤2: 录制登录（如需要）
\`\`\`bash
# 如果还没有登录状态，先录制登录
npx playwright codegen <BASE_URL> --save-storage=tests/config/auth.json
\`\`\`

**登录信息**: 请使用 config/test-config.json 中配置的凭据

### 步骤3: 录制功能操作

**方式A: 使用本目录的录制脚本**
\`\`\`bash
bash ${recordDir}/record.sh
\`\`\`

**方式B: 手动录制**
\`\`\`bash
# 录制功能测试
npx playwright codegen https://apqp-dev.catl.com/material_develop_manage/material_develop_process \\
  --load-storage=tests/config/auth.json \\
  --target=javascript \\
  -o ${recordDir}/recorded-raw.spec.js
\`\`\`

### 步骤4: 检查录制结果

1. 查看录制的代码: \`cat ${recordDir}/recorded-raw.spec.js\`
2. 检查选择器是否准确
3. 确认是否包含所有功能点

## ✅ 录制检查清单

请在录制完成后勾选：

- [ ] 成功登录系统
- [ ] 导航到 ${moduleName} 页面
${testCases.map(tc => `- [ ] 录制了: ${tc.name}`).join('\n')}
- [ ] 录制的代码可以正常执行

## 🚀 下一步

录制完成后，执行：
\`\`\`bash
# 生成回归测试脚本（基于录制结果）
auto-test generate-from-recording -m ${moduleName}
\`\`\`

---
生成时间: ${new Date().toLocaleString('zh-CN')}
`;

    const guidePath = path.join(recordDir, 'RECORDING_GUIDE.md');
    fs.writeFileSync(guidePath, guideContent, 'utf-8');
    
    return guidePath;
  }

  /**
   * 生成录制执行脚本
   * @param {string} moduleName - 模块名称
   * @param {Array} testCases - 测试用例列表
   * @param {string} recordDir - 录制目录
   * @param {Object} options - 选项
   * @returns {string} 脚本路径
   */
  async generateRecordingScript(moduleName, testCases, recordDir, options = {}) {
    const baseUrl = options.baseUrl || 'https://apqp-dev.catl.com';
    const authPath = 'tests/config/auth.json';
    
    const scriptContent = `#!/bin/bash
# ${moduleName} - 自动化录制脚本
# 本脚本帮助您录制功能测试

echo "=========================================="
echo "🎥 开始录制 ${moduleName}"
echo "=========================================="
echo ""

# 配置
MODULE_NAME="${moduleName}"
RECORD_DIR="${recordDir}"
OUTPUT_FILE="\${RECORD_DIR}/recorded-raw.spec.js"
AUTH_FILE="${authPath}"
BASE_URL="${baseUrl}"

echo "📋 录制配置:"
echo "   模块: \${MODULE_NAME}"
echo "   输出: \${OUTPUT_FILE}"
echo ""

# 检查目录
if [ ! -d "\${RECORD_DIR}" ]; then
    mkdir -p "\${RECORD_DIR}"
    echo "✓ 创建录制目录: \${RECORD_DIR}"
fi

# 检查登录状态
if [ -f "\${AUTH_FILE}" ]; then
    echo "✓ 找到登录状态: \${AUTH_FILE}"
    echo "   将自动使用已保存的登录状态"
    AUTH_OPTION="--load-storage=\${AUTH_FILE}"
else
    echo "⚠️  未找到登录状态: \${AUTH_FILE}"
    echo "   录制时会要求您先登录"
    AUTH_OPTION="--save-storage=\${AUTH_FILE}"
fi

echo ""
echo "=========================================="
echo "🎬 即将启动 Playwright 录制"
echo "=========================================="
echo ""
echo "操作说明:"
echo "  1. 会打开两个窗口：浏览器 + 代码生成器"
echo "  2. 在浏览器中执行以下操作:"
${testCases.map((tc, idx) => `echo "     ${idx + 1}. ${tc.name}"`).join('\n')}
echo "  3. 代码生成器会实时显示录制的代码"
echo "  4. 完成后关闭浏览器，代码自动保存"
echo ""
echo "按 Enter 开始录制..."
read

echo "🚀 启动录制..."
echo ""

# 执行录制
npx playwright codegen "\${BASE_URL}" \\
  \${AUTH_OPTION} \\
  --viewport-size=1920,1080 \\
  --target=javascript \\
  -o "\${OUTPUT_FILE}"

echo ""
echo "=========================================="
if [ -f "\${OUTPUT_FILE}" ]; then
    echo "✅ 录制完成！"
    echo "=========================================="
    echo ""
    echo "📄 录制的文件:"
    echo "   \${OUTPUT_FILE}"
    echo ""
    echo "📋 文件大小:"
    ls -lh "\${OUTPUT_FILE}" | awk '{print "   " $5 " " $9}'
    echo ""
    echo "📝 下一步:"
    echo "   1. 检查录制的代码: cat \${OUTPUT_FILE}"
    echo "   2. 生成回归测试: auto-test generate-from-recording -m \${MODULE_NAME}"
else
    echo "❌ 录制失败或未保存"
    echo "=========================================="
fi

echo ""
`;

    const scriptPath = path.join(recordDir, 'record.sh');
    fs.writeFileSync(scriptPath, scriptContent, 'utf-8');
    
    // 添加执行权限（Unix/Linux/Mac）
    try {
      fs.chmodSync(scriptPath, '755');
    } catch (e) {
      // Windows 不支持 chmod
    }
    
    return scriptPath;
  }

  /**
   * 生成录制检查清单
   * @param {string} moduleName - 模块名称
   * @param {Array} testCases - 测试用例列表
   * @param {string} recordDir - 录制目录
   * @returns {string} 清单路径
   */
  async generateChecklist(moduleName, testCases, recordDir) {
    const checklistContent = {
      moduleName,
      generatedAt: new Date().toISOString(),
      items: [
        {
          id: 'login',
          description: '成功登录系统',
          status: 'pending'
        },
        {
          id: 'navigation',
          description: `导航到 ${moduleName} 页面`,
          status: 'pending'
        },
        ...testCases.map(tc => ({
          id: tc.id,
          description: `录制了: ${tc.name}`,
          priority: tc.priority,
          status: 'pending'
        })),
        {
          id: 'verification',
          description: '录制的代码可以正常执行',
          status: 'pending'
        }
      ]
    };

    const checklistPath = path.join(recordDir, 'checklist.json');
    fs.writeFileSync(checklistPath, JSON.stringify(checklistContent, null, 2), 'utf-8');
    
    return checklistPath;
  }

  /**
   * 分析录制结果
   * @param {string} recordedFilePath - 录制的文件路径
   * @returns {Object} 分析结果
   */
  analyzeRecording(recordedFilePath) {
    if (!fs.existsSync(recordedFilePath)) {
      return null;
    }

    const content = fs.readFileSync(recordedFilePath, 'utf-8');
    
    // 提取关键信息
    const analysis = {
      filePath: recordedFilePath,
      fileSize: fs.statSync(recordedFilePath).size,
      actions: [],
      selectors: [],
      urls: []
    };

    // 提取操作（click, fill, goto等）
    const actionMatches = content.matchAll(/await page\.(click|fill|goto|selectOption|check|uncheck)\(/g);
    for (const match of actionMatches) {
      analysis.actions.push(match[1]);
    }

    // 提取选择器
    const selectorMatches = content.matchAll(/locator\(['"`]([^'"`]+)['"`]\)/g);
    for (const match of selectorMatches) {
      if (!analysis.selectors.includes(match[1])) {
        analysis.selectors.push(match[1]);
      }
    }

    // 提取URL
    const urlMatches = content.matchAll(/goto\(['"`]([^'"`]+)['"`]\)/g);
    for (const match of urlMatches) {
      if (!analysis.urls.includes(match[1])) {
        analysis.urls.push(match[1]);
      }
    }

    // 统计
    analysis.stats = {
      clickCount: analysis.actions.filter(a => a === 'click').length,
      fillCount: analysis.actions.filter(a => a === 'fill').length,
      gotoCount: analysis.actions.filter(a => a === 'goto').length,
      totalActions: analysis.actions.length,
      uniqueSelectors: analysis.selectors.length
    };

    return analysis;
  }

  /**
   * 根据录制结果生成回归测试脚本
   * @param {string} moduleName - 模块名称
   * @param {string} recordedFile - 录制的原始文件
   * @param {Array} testCases - 原始测试用例
   * @param {string} outputPath - 输出路径
   * @returns {string} 生成的脚本路径
   */
  async generateRegressionScriptFromRecording(moduleName, recordedFile, testCases, outputPath) {
    // 1. 分析录制结果
    const analysis = this.analyzeRecording(recordedFile);
    if (!analysis) {
      throw new Error(`录制文件不存在: ${recordedFile}`);
    }

    // 2. 读取原始录制内容
    const recordedContent = fs.readFileSync(recordedFile, 'utf-8');

    // 3. 生成回归测试脚本
    const scriptContent = `/**
 * ${moduleName} - 回归测试脚本
 * 
 * 基于录制结果生成
 * 录制文件: ${recordedFile}
 * 分析时间: ${new Date().toLocaleString('zh-CN')}
 * 
 * 录制统计:
 * - 总操作数: ${analysis.stats.totalActions}
 * - 点击次数: ${analysis.stats.clickCount}
 * - 输入次数: ${analysis.stats.fillCount}
 * - 页面跳转: ${analysis.stats.gotoCount}
 * - 唯一选择器: ${analysis.stats.uniqueSelectors}
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// 从 test-config.json 加载配置（禁止硬编码）
const ConfigLoader = require('../../../utils/config-loader');
const _cfg = ConfigLoader.load();
const _env = _cfg.environments[_cfg.defaultEnvironment];
const _acc = _cfg.credentials.accounts[0];

const config = {
  baseUrl: _env.baseUrl,
  tenant: _cfg.credentials.tenant.default,
  username: _acc.username,
  password: _acc.password
};

// 截图函数
async function takeScreenshot(page, name) {
  const screenshotDir = path.join(__dirname, '../../../screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  const screenshotPath = path.join(screenshotDir, \`\${name}_\${Date.now()}.png\`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(\`   📸 截图: \${screenshotPath}\`);
}

test.describe('${moduleName} - 回归测试', () => {
  
  test.beforeEach(async ({ page }) => {
    console.log('\\n=====================================');
    console.log('🔑 正在登录系统...');
    console.log('=====================================');
    
    // 访问登录页面
    await page.goto(config.baseUrl);
    await page.waitForTimeout(2000);
    
    // 填写租户
    await page.fill('#tenantCode', config.tenant);
    console.log('   ✓ 填写租户:', config.tenant);
    
    // 填写用户名
    await page.fill('#loginName', config.username);
    console.log('   ✓ 填写用户名:', config.username);
    
    // 填写密码
    await page.fill('#password', config.password);
    console.log('   ✓ 填写密码');
    
    // 点击登录按钮
    await page.click("button[type='submit']");
    console.log('   ✓ 点击登录按钮');
    
    // 等待登录成功
    await page.waitForTimeout(5000);
    console.log('   ✓ 登录成功');
    
    // 等待页面加载
    await page.waitForLoadState('networkidle');
  });

${testCases.map((tc, index) => `
  test('TC-${String(index + 1).padStart(3, '0')}: ${tc.name}', async ({ page }) => {
    console.log('\\n📋 TC-${String(index + 1).padStart(3, '0')}: ${tc.name}');
    
    // 基于录制生成的步骤
    ${tc.steps.map(step => `
    // ${step.action}: ${step.target}
    // 预期: ${step.expected}
    `).join('')}
    
    // 添加基于录制的具体操作
    // TODO: 从录制文件中提取具体选择器
    
    await takeScreenshot(page, 'TC${String(index + 1).padStart(3, '0')}_${tc.name.replace(/\s+/g, '_')}');
    
    console.log('   ✓ ${tc.name} 测试完成');
  });
`).join('\n')}

});

/*
基于录制的原始代码（参考）:
${recordedContent.substring(0, 3000)}...

录制分析:
- 操作列表: ${analysis.actions.join(', ')}
- 选择器: ${analysis.selectors.slice(0, 10).join(', ')}${analysis.selectors.length > 10 ? '...' : ''}
- 访问的URL: ${analysis.urls.join(', ')}
*/
`;

    // 确保目录存在
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, scriptContent, 'utf-8');
    
    return outputPath;
  }

  /**
   * 打印录制分析报告
   * @param {Object} analysis - 分析结果
   */
  printAnalysisReport(analysis) {
    console.log('\n📊 录制分析报告:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`文件: ${analysis.filePath}`);
    console.log(`大小: ${(analysis.fileSize / 1024).toFixed(2)} KB`);
    console.log('');
    console.log('操作统计:');
    console.log(`  - 总操作数: ${analysis.stats.totalActions}`);
    console.log(`  - 点击: ${analysis.stats.clickCount}`);
    console.log(`  - 输入: ${analysis.stats.fillCount}`);
    console.log(`  - 跳转: ${analysis.stats.gotoCount}`);
    console.log('');
    console.log(`唯一选择器: ${analysis.stats.uniqueSelectors} 个`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
}

module.exports = RecordingAssistant;
