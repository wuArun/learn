#!/usr/bin/env node
/**
 * Auto-Test Skill CLI 工具 v4.0.0
 * 模块化测试管理命令行入口
 * 
 * 重大变更 v4.0.0:
 * - 强制前置扫描PRD和代码
 * - 所有配置从 test-config.json 读取
 * - 移除命令行登录参数
 * - 简化用户操作流程
 */

const { program } = require('commander');
const path = require('path');
const ModuleGenerator = require('./agents/module-generator');
const ModuleUpdater = require('./agents/module-updater');
const ScriptGenerator = require('./agents/script-generator');
const TestCase = require('./models/test-case');
const DependencyManager = require('./models/dependency-manager');
const ConfigLoader = require('./utils/config-loader');
const RecordingAssistant = require('./agents/recording-assistant');
const fs = require('fs');

const VERSION = '4.0.0';

// 读取用户输入
function askQuestion(query) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise(resolve => {
    rl.question(query, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

// 验证配置文件是否存在
function validateConfig() {
  try {
    const config = ConfigLoader.load();
    return config;
  } catch (error) {
    console.error('\n❌ 配置文件错误:', error.message);
    console.log('\n请创建配置文件: config/test-config.json');
    console.log('示例文件: config/test-config.example.json');
    process.exit(1);
  }
}

program
  .name('auto-test')
  .description('智能自动化测试管理工具 v' + VERSION)
  .version(VERSION);

// 生成功能模块命令（智能增量更新）
program
  .command('generate')
  .alias('g')
  .description('根据提示词生成功能模块（自动扫描PRD和代码）')
  .requiredOption('-p, --prompt <prompt>', '功能描述提示词')
  .option('-o, --output <dir>', '输出目录', 'tests/modules')
  .option('-a, --author <name>', '作者名称', 'auto-test')
  .option('--prd-dir <dir>', 'PRD文档目录', 'docs/prd')
  .option('--code-dirs <dirs>', '代码目录（逗号分隔）', 'backend,frontend,src')
  .option('--force-new', '强制创建新模块（不检查现有模块）', false)
  .action(async (options) => {
    console.log('\n🚀 Auto-Test Module Generator v' + VERSION);
    console.log('='.repeat(80));
    
    // 步骤0: 读取配置文件
    console.log('\n【步骤0】读取公共配置...');
    const config = validateConfig();
    console.log('   ✅ 配置文件已加载: config/test-config.json');
    console.log(`   ✅ 环境: ${config.defaultEnvironment || 'test'}`);
    console.log(`   ✅ 账号: ${config.credentials.accounts.length} 个`);
    
    try {
      if (options.forceNew) {
        // 强制创建新模块
        const generator = new ModuleGenerator({
          outputDir: options.output,
          resourceFinder: {
            prdDir: options.prdDir,
            codeDirs: options.codeDirs.split(',')
          }
        });
        
        const result = await generator.generateModule(options.prompt, {
          author: options.author
        });
        
        console.log('\n' + '='.repeat(80));
        console.log('✅ 功能模块创建成功！');
        console.log('='.repeat(80));
        console.log(`\n📂 模块位置: ${result.modulePath}`);
        console.log(`📋 用例数量: ${result.testCases.length}`);
        console.log(`🔗 执行层级: ${result.executionOrder.length}`);
        console.log('\n⚠️  【用户确认环节】');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('请检查生成的测试用例文件是否正确：');
        console.log(`   ${result.modulePath}/cases/*.json`);
        console.log('\n检查内容：');
        console.log('  1. 用例步骤是否符合实际业务流程');
        console.log('  2. 选择器是否准确（如 #tenantCode, #loginName）');
        console.log('  3. 预期结果是否合理');
        console.log('  4. 是否缺少关键功能点的测试');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // 等待用户确认
        const answer = await askQuestion('\n确认用例正确吗？(yes/no/edit): ');
        
        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
          console.log('\n✅ 用户已确认用例');
          
          // 询问是否需要录制
          console.log('\n🎥 是否需要录制操作以生成更准确的回归测试脚本？');
          const recordAnswer = await askQuestion('开始录制吗？(yes/no): ');
          
          if (recordAnswer.toLowerCase() === 'yes' || recordAnswer.toLowerCase() === 'y') {
            console.log('\n🎬 正在准备录制...');
            
            // 生成录制辅助脚本
            const recordingAssistant = new RecordingAssistant({
              outputDir: 'tests/record'
            });
            
            const recordInfo = await recordingAssistant.generateRecordingGuide(
              result.moduleName,
              result.testCases,
              {
                baseUrl: config.environments[config.defaultEnvironment || 'dev']?.baseUrl || 'https://apqp-dev.catl.com'
              }
            );
            
            console.log('\n' + '='.repeat(80));
            console.log('📹 录制准备完成！');
            console.log('='.repeat(80));
            console.log(`\n📂 录制目录: ${recordInfo.recordDir}`);
            console.log('\n生成的文件:');
            console.log(`  📄 录制指导: ${recordInfo.guidePath}`);
            console.log(`  🎬 录制脚本: ${recordInfo.scriptPath}`);
            console.log(`  ✅ 检查清单: ${recordInfo.checklistPath}`);
            console.log('\n开始录制:');
            console.log(`  bash ${recordInfo.scriptPath}`);
            console.log('\n或者手动录制:');
            console.log(`  npx playwright codegen --load-storage=tests/config/auth.json -o ${recordInfo.recordDir}/recorded-raw.spec.js`);
            console.log('\n录制完成后，执行:');
            console.log(`  auto-test generate-from-recording -m ${result.moduleName}`);
            console.log('\n生成基于录制的回归测试脚本');
            
            // 询问是否立即录制
            const startNow = await askQuestion('\n是否立即开始录制？(yes/no): ');
            if (startNow.toLowerCase() === 'yes' || startNow.toLowerCase() === 'y') {
              console.log('\n🎥 启动录制...\n');
              const { execSync } = require('child_process');
              try {
                execSync(`bash "${recordInfo.scriptPath}"`, { 
                  stdio: 'inherit',
                  cwd: process.cwd()
                });
              } catch (error) {
                console.log('\n⚠️  录制过程结束');
              }
              
              // 检查录制结果
              const recordedFile = path.join(recordInfo.recordDir, 'recorded-raw.spec.js');
              if (fs.existsSync(recordedFile)) {
                console.log('\n✅ 检测到录制文件');
                const generateNow = await askQuestion('是否立即基于录制生成回归测试脚本？(yes/no): ');
                if (generateNow.toLowerCase() === 'yes' || generateNow.toLowerCase() === 'y') {
                  // 执行生成
                  const outputPath = path.join(result.modulePath, 'scripts', `${result.moduleName}-regression.spec.js`);
                  const generatedPath = await recordingAssistant.generateRegressionScriptFromRecording(
                    result.moduleName,
                    recordedFile,
                    result.testCases,
                    outputPath
                  );
                  console.log('\n✅ 回归测试脚本已生成！');
                  console.log(`📄 ${generatedPath}`);
                }
              }
            }
          } else {
            console.log('\n📋 跳过录制，基于现有用例生成脚本...');
            console.log(`\n执行命令:`);
            console.log(`   auto-test generate-scripts -m ${result.moduleName}`);
            console.log(`   auto-test regression -m ${result.moduleName}`);
          }
        } else if (answer.toLowerCase() === 'edit' || answer.toLowerCase() === 'e') {
          console.log('\n✏️  请手动编辑用例文件:');
          console.log(`   ${result.modulePath}/cases/*.json`);
          console.log('\n编辑完成后执行:');
          console.log(`   auto-test generate-scripts -m ${result.moduleName}`);
          console.log(`   auto-test regression -m ${result.moduleName}`);
        } else {
          console.log('\n⚠️  用例未确认，测试执行已暂停');
          console.log('如需重新生成，请使用 --force-new 参数');
          process.exit(0);
        }
        
      } else {
        // 智能增量更新
        const updater = new ModuleUpdater({
          outputDir: options.output,
          resourceFinder: {
            prdDir: options.prdDir,
            codeDirs: options.codeDirs.split(',')
          }
        });
        
        const result = await updater.generateOrUpdate(options.prompt, {
          author: options.author,
          originalPrompt: options.prompt
        });
        
        console.log('\n' + '='.repeat(80));
        console.log('✅ 模块处理完成！');
        console.log('='.repeat(80));
        
        if (result.isUpdate) {
          console.log(`\n📊 更新统计:`);
          console.log(`   新增用例: ${result.statistics?.added || 0}`);
          console.log(`   更新用例: ${result.statistics?.updated || 0}`);
        }
        
        console.log(`\n📂 模块位置: ${result.modulePath}`);
        console.log('\n⚠️  【用户确认环节】');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('请检查生成/更新的测试用例文件是否正确：');
        console.log(`   ${result.modulePath}/cases/*.json`);
        console.log('\n检查内容：');
        console.log('  1. 新增用例是否符合需求');
        console.log('  2. 更新用例是否保持原有逻辑');
        console.log('  3. 用例步骤是否准确');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // 等待用户确认
        const answer = await askQuestion('\n确认用例正确吗？(yes/no/edit): ');
        
        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
          console.log('\n✅ 用户已确认用例，可以继续执行回归测试');
          console.log(`\n执行命令:`);
          console.log(`   auto-test regression -m ${result.moduleName}`);
        } else if (answer.toLowerCase() === 'edit' || answer.toLowerCase() === 'e') {
          console.log('\n✏️  请手动编辑用例文件:');
          console.log(`   ${result.modulePath}/cases/*.json`);
          console.log('\n编辑完成后执行:');
          console.log(`   auto-test generate-scripts -m ${result.moduleName}`);
          console.log(`   auto-test regression -m ${result.moduleName}`);
        } else {
          console.log('\n⚠️  用例未确认，测试执行已暂停');
          process.exit(0);
        }
      }
      
    } catch (error) {
      console.error('\n❌ 生成失败:', error.message);
      process.exit(1);
    }
  });

// 生成测试脚本命令
program
  .command('generate-scripts')
  .alias('gs')
  .description('为功能模块生成Playwright测试脚本（自动使用配置文件）')
  .requiredOption('-m, --module <name>', '模块名称')
  .option('-i, --individual', '生成独立用例脚本', false)
  .option('-o, --output <dir>', '模块目录', 'tests/modules')
  .action(async (options) => {
    console.log('\n🎬 Auto-Test Script Generator');
    console.log('='.repeat(80));
    
    // 验证配置文件
    console.log('\n检查配置...');
    validateConfig();
    
    try {
      const generator = new ScriptGenerator({
        outputDir: options.output,
        useConfigFile: true  // 使用配置文件而不是参数
      });
      
      const scripts = await generator.generateModuleScripts(options.module, {
        generateIndividualScripts: options.individual,
        // 不再传入登录信息，脚本会从配置文件读取
      });
      
      console.log('\n✅ 脚本生成成功！');
      console.log('\n生成的文件:');
      scripts.forEach(script => {
        console.log(`  📄 ${script.name} (${script.type})`);
      });
      
      console.log('\n执行测试:');
      console.log(`  npx playwright test ${scripts[0].path}`);
      
    } catch (error) {
      console.error('\n❌ 生成失败:', error.message);
      process.exit(1);
    }
  });

// 执行测试命令
program
  .command('run')
  .alias('run')
  .description('执行功能模块的测试（自动读取配置）')
  .requiredOption('-m, --module <name>', '模块名称')
  .option('-o, --output <dir>', '模块目录', 'tests/modules')
  .option('--headed', '有头模式运行', false)
  .option('--debug', '调试模式', false)
  .action(async (options) => {
    console.log('\n🎭 Auto-Test Runner');
    console.log('='.repeat(80));
    
    // 验证配置文件
    console.log('\n检查配置...');
    validateConfig();
    
    const modulePath = path.join(options.output, options.module);
    const scriptPath = path.join(modulePath, 'scripts', `${options.module}.spec.js`);
    
    if (!fs.existsSync(scriptPath)) {
      console.error(`\n❌ 未找到测试脚本: ${scriptPath}`);
      console.log('\n请先生成脚本:');
      console.log(`  auto-test generate-scripts -m ${options.module}`);
      process.exit(1);
    }
    
    console.log(`\n执行模块: ${options.module}`);
    console.log(`脚本路径: ${scriptPath}`);
    
    const { execSync } = require('child_process');
    
    try {
      const playwrightOptions = [
        options.headed ? '--headed' : '',
        options.debug ? '--debug' : ''
      ].filter(Boolean).join(' ');
      
      const command = `npx playwright test ${scriptPath} ${playwrightOptions}`;
      
      console.log('\n执行命令:', command);
      console.log('');
      
      execSync(command, { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
    } catch (error) {
      console.error('\n❌ 测试执行失败');
      process.exit(1);
    }
  });

// 查看用例命令
program
  .command('list')
  .alias('ls')
  .description('列出功能模块的测试用例')
  .requiredOption('-m, --module <name>', '模块名称')
  .option('-o, --output <dir>', '模块目录', 'tests/modules')
  .option('--json', '以JSON格式输出', false)
  .action(async (options) => {
    const modulePath = path.join(options.output, options.module);
    const casesDir = path.join(modulePath, 'cases');
    
    if (!fs.existsSync(casesDir)) {
      console.error(`❌ 未找到模块: ${options.module}`);
      process.exit(1);
    }
    
    const files = fs.readdirSync(casesDir).filter(f => f.endsWith('.json'));
    
    if (files.length === 0) {
      console.log('该模块暂无测试用例');
      return;
    }
    
    const cases = [];
    for (const file of files) {
      const data = JSON.parse(fs.readFileSync(path.join(casesDir, file), 'utf-8'));
      cases.push(data);
    }
    
    if (options.json) {
      console.log(JSON.stringify(cases, null, 2));
    } else {
      console.log(`\n📋 模块 "${options.module}" 的测试用例:`);
      console.log('='.repeat(80));
      console.log('ID\t\t\t名称\t\t\t优先级\t版本\t状态');
      console.log('-'.repeat(80));
      
      cases.forEach(tc => {
        console.log(`${tc.id}\t${tc.name.substring(0, 20).padEnd(20)}\t${tc.priority}\t${tc.version}\t${tc.status}`);
      });
      
      console.log('='.repeat(80));
      console.log(`总计: ${cases.length} 个用例`);
      
      console.log('\n⚠️  请检查用例文件是否正确:');
      console.log(`   ${casesDir}`);
    }
  });

// 查看依赖关系命令
program
  .command('dependencies')
  .alias('deps')
  .description('查看用例依赖关系')
  .requiredOption('-m, --module <name>', '模块名称')
  .option('-o, --output <dir>', '模块目录', 'tests/modules')
  .action(async (options) => {
    const modulePath = path.join(options.output, options.module);
    const depsPath = path.join(modulePath, 'config', 'dependencies.json');
    
    if (!fs.existsSync(depsPath)) {
      console.error(`❌ 未找到依赖关系文件: ${depsPath}`);
      process.exit(1);
    }
    
    const data = JSON.parse(fs.readFileSync(depsPath, 'utf-8'));
    const manager = new DependencyManager();
    manager.import(data);
    
    const stats = manager.getStatistics();
    const order = manager.getExecutionOrder();
    
    console.log(`\n🔗 模块 "${options.module}" 的依赖关系:`);
    console.log('='.repeat(60));
    console.log(`总用例数: ${stats.totalCases}`);
    console.log(`总依赖数: ${stats.totalDependencies}`);
    console.log(`最大深度: ${stats.maxDepth}`);
    console.log(`并行组数: ${stats.parallelGroups}`);
    console.log(`孤立用例: ${stats.isolatedCases}`);
    console.log('='.repeat(60));
    
    console.log('\n执行顺序:');
    order.forEach((step, index) => {
      const parallelMark = step.parallel ? '【并行】' : '';
      console.log(`  ${index + 1}. ${parallelMark}${step.cases.join(', ')}`);
    });
  });

// 更新用例版本命令
program
  .command('version')
  .alias('v')
  .description('管理测试用例版本')
  .requiredOption('-m, --module <name>', '模块名称')
  .requiredOption('-c, --case <id>', '用例ID')
  .option('-o, --output <dir>', '模块目录', 'tests/modules')
  .option('-n, --new-version <version>', '新版本号')
  .option('--changelog <text>', '变更说明', '更新用例')
  .option('--rollback <version>', '回滚到指定版本')
  .action(async (options) => {
    const modulePath = path.join(options.output, options.module);
    const casePath = path.join(modulePath, 'cases', `${options.case}.json`);
    
    if (!fs.existsSync(casePath)) {
      console.error(`❌ 未找到用例: ${options.case}`);
      process.exit(1);
    }
    
    const data = JSON.parse(fs.readFileSync(casePath, 'utf-8'));
    const testCase = TestCase.fromJSON(data);
    
    if (options.rollback) {
      // 回滚版本
      testCase.rollbackToVersion(options.rollback);
      console.log(`✅ 用例 ${options.case} 已回滚到版本 ${options.rollback}`);
    } else if (options.newVersion) {
      // 创建新版本
      testCase.createVersion(options.newVersion, options.changelog);
      console.log(`✅ 用例 ${options.case} 已更新到版本 ${options.newVersion}`);
    } else {
      // 显示版本信息
      console.log(`\n📋 用例 ${options.case} 的版本信息:`);
      console.log('='.repeat(60));
      console.log(`当前版本: ${testCase.version}`);
      console.log(`创建时间: ${testCase.createdAt}`);
      console.log(`更新时间: ${testCase.updatedAt}`);
      console.log(`作者: ${testCase.author}`);
      
      if (testCase.versionHistory.length > 0) {
        console.log('\n历史版本:');
        testCase.versionHistory.forEach(h => {
          console.log(`  - ${h.version} (${h.updatedAt})`);
        });
      }
      
      if (testCase.changelog && testCase.changelog.length > 0) {
        console.log('\n变更日志:');
        testCase.changelog.forEach(log => {
          console.log(`  ${log.version}: ${log.description}`);
        });
      }
    }
    
    // 保存更新
    fs.writeFileSync(casePath, JSON.stringify(testCase.toJSON(), null, 2), 'utf-8');
  });

// 初始化项目命令
program
  .command('init')
  .description('初始化测试项目结构')
  .option('-o, --output <dir>', '输出目录', 'tests')
  .action(async (options) => {
    console.log('\n🏗️  初始化测试项目结构...');
    
    const dirs = [
      options.output,
      path.join(options.output, 'modules'),
      path.join(options.output, 'config'),
      path.join(options.output, 'data'),
      path.join(options.output, 'report'),
      path.join(options.output, 'regression-report')
    ];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`  📁 创建: ${dir}`);
      }
    });
    
    // 检查配置文件是否存在
    const configPath = path.join(options.output, 'config', 'test-config.json');
    if (!fs.existsSync(configPath)) {
      // 复制示例配置文件
      const examplePath = path.join(__dirname, 'config', 'test-config.json');
      if (fs.existsSync(examplePath)) {
        fs.copyFileSync(examplePath, configPath);
        console.log(`  📄 创建配置文件: ${configPath}`);
      } else {
        // 创建基础配置文件
        const defaultConfig = {
          version: "1.0.0",
          description: "自动化测试公共配置文件",
          lastUpdated: new Date().toISOString().split('T')[0],
          environments: {
            test: {
              baseUrl: "https://your-app.com",
              apiBaseUrl: "https://your-app.com/api",
              timeout: 30000
            }
          },
          defaultEnvironment: "test",
          credentials: {
            tenant: { default: "default" },
            accounts: [
              {
                role: "admin",
                username: "your_username",
                password: "${TEST_PASSWORD}",
                description: "测试账号"
              }
            ]
          },
          selectors: {
            common: {
              loginForm: {
                tenantInput: "[data-testid='tenant-input']",
                usernameInput: "[data-testid='username-input']",
                passwordInput: "[data-testid='password-input']",
                loginButton: "[data-testid='login-button']"
              }
            }
          },
          timeouts: {
            default: 30000,
            navigation: 60000,
            api: 10000
          },
          testData: {
            screenshotDir: "tests/screenshots",
            downloadDir: "tests/downloads",
            reportDir: "tests/report"
          }
        };
        
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf-8');
        console.log(`  📄 创建配置文件: ${configPath}`);
      }
      
      console.log('\n⚠️  重要: 请编辑配置文件，填入正确的登录信息:');
      console.log(`   ${configPath}`);
    }
    
    console.log('\n✅ 项目初始化完成！');
    console.log(`\n项目位置: ${path.resolve(options.output)}`);
    console.log('\n下一步:');
    console.log('  1. 配置测试环境: 编辑 config/test-config.json');
    console.log('  2. 设置环境变量: export TEST_PASSWORD="your_password"');
    console.log('  3. 生成功能模块: auto-test generate -p "功能描述"');
  });

// 回归测试命令
program
  .command('regression')
  .alias('reg')
  .description('执行回归测试（自动从配置文件读取登录信息）')
  .requiredOption('-m, --module <name>', '模块名称')
  .option('-o, --output <dir>', '报告输出目录', 'tests/regression-report')
  .option('--headed', '有头模式运行（显示浏览器界面）', false)
  .option('--continue-on-failure', '失败后继续执行', false)
  .option('--parallel', '并行执行', false)
  .option('--env <environment>', '指定环境（dev/test/prod）', null)
  .action(async (options) => {
    console.log('\n🔄 Auto-Test Regression Runner v' + VERSION);
    console.log('='.repeat(80));
    
    // 步骤0: 读取配置文件（强制）
    console.log('\n【步骤0】读取公共配置...');
    const config = validateConfig();
    
    const envName = options.env || config.defaultEnvironment || 'test';
    const envConfig = config.environments[envName];
    
    if (!envConfig) {
      console.error(`\n❌ 环境 '${envName}' 不存在`);
      console.log(`可用环境: ${Object.keys(config.environments).join(', ')}`);
      process.exit(1);
    }
    
    const credentials = config.credentials.accounts[0]; // 使用第一个账号
    
    console.log('   ✅ 配置文件已加载');
    console.log(`   ✅ 环境: ${envName}`);
    console.log(`   ✅ Base URL: ${envConfig.baseUrl}`);
    console.log(`   ✅ 登录账号: ${credentials.username}`);
    
    const RegressionTestRunner = require('./agents/regression-runner');
    
    const runner = new RegressionTestRunner({
      baseUrl: envConfig.baseUrl,
      headless: !options.headed,
      outputDir: options.output,
      continueOnFailure: options.continueOnFailure,
      parallel: options.parallel,
      useConfigFile: true,  // 使用配置文件
      config: config,       // 传入配置对象
      credentials: {        // 从配置文件读取
        tenant: config.credentials.tenant.default,
        username: credentials.username,
        password: credentials.password
      }
    });
    
    try {
      const result = await runner.runRegression(options.module);
      
      if (result.success) {
        console.log('\n✅ 回归测试全部通过！');
        process.exit(0);
      } else {
        console.log('\n❌ 回归测试存在失败用例');
        process.exit(1);
      }
    } catch (error) {
      console.error('\n❌ 回归测试执行失败:', error.message);
      process.exit(1);
    }
  });

// 增量更新模块命令
program
  .command('update')
  .alias('u')
  .description('增量更新现有功能模块（检测代码变更并更新用例和脚本）')
  .requiredOption('-m, --module <name>', '模块名称（或提示词）')
  .option('-o, --output <dir>', '模块目录', 'tests/modules')
  .option('-a, --author <name>', '作者名称', 'auto-test')
  .option('--prd-dir <dir>', 'PRD文档目录', 'docs/prd')
  .option('--code-dirs <dirs>', '代码目录（逗号分隔）', 'backend,frontend,src')
  .action(async (options) => {
    console.log('\n🔄 Auto-Test Module Updater v' + VERSION);
    console.log('='.repeat(80));
    
    // 步骤0: 读取配置文件
    console.log('\n【步骤0】读取公共配置...');
    const config = validateConfig();
    console.log('   ✅ 配置文件已加载');
    
    try {
      const updater = new ModuleUpdater({
        outputDir: options.output,
        resourceFinder: {
          prdDir: options.prdDir,
          codeDirs: options.codeDirs.split(',')
        }
      });
      
      const result = await updater.generateOrUpdate(options.module, {
        author: options.author,
        originalPrompt: options.module
      });
      
      console.log('\n' + '='.repeat(80));
      console.log('✅ 模块更新完成！');
      console.log('='.repeat(80));
      
      if (result.statistics) {
        console.log(`\n📊 更新统计:`);
        console.log(`   新增用例: ${result.statistics.added}`);
        console.log(`   更新用例: ${result.statistics.updated}`);
        console.log(`   删除用例: ${result.statistics.deleted}`);
        console.log(`   总用例数: ${result.statistics.total}`);
      }
      
      if (result.scriptsUpdated) {
        console.log(`   更新脚本: ${result.scriptsUpdated} 个`);
      }
      
      console.log(`\n📂 模块位置: ${result.modulePath}`);
      
      if (result.updateReport) {
        console.log(`\n📄 更新报告: ${result.updateReport}`);
      }
      
      console.log('\n⚠️  【用户确认】请检查更新的用例文件:');
      console.log(`   ${result.modulePath}/cases/*.json`);
      console.log('\n确认无误后执行:');
      console.log(`   auto-test regression -m ${result.moduleName}`);
      
    } catch (error) {
      console.error('\n❌ 更新失败:', error.message);
      process.exit(1);
    }
  });

// 分析模块覆盖率命令
program
  .command('analyze')
  .alias('an')
  .description('分析模块用例覆盖率')
  .requiredOption('-m, --module <name>', '模块名称')
  .option('-o, --output <dir>', '模块目录', 'tests/modules')
  .option('--prd-dir <dir>', 'PRD文档目录', 'docs/prd')
  .option('--code-dirs <dirs>', '代码目录（逗号分隔）', 'backend,frontend,src')
  .option('--json', '以JSON格式输出', false)
  .action(async (options) => {
    console.log('\n📊 Auto-Test Coverage Analyzer');
    console.log('='.repeat(80));
    
    // 验证配置文件
    console.log('\n检查配置...');
    validateConfig();
    
    const modulePath = path.join(options.output, options.module);
    
    if (!fs.existsSync(modulePath)) {
      console.error(`\n❌ 模块不存在: ${options.module}`);
      console.log('\n请先创建模块:');
      console.log(`  auto-test generate -p "${options.module}"`);
      process.exit(1);
    }
    
    try {
      const updater = new ModuleUpdater({
        outputDir: options.output,
        resourceFinder: {
          prdDir: options.prdDir,
          codeDirs: options.codeDirs.split(',')
        }
      });
      
      // 加载现有模块
      const existingModule = await updater.checkExistingModule(modulePath);
      
      // 检索最新资源
      console.log('\n📡 正在检索最新资源...');
      const resources = await updater.resourceFinder.findResources(options.module);
      
      // 分析覆盖率
      console.log('\n📊 正在分析用例覆盖率...');
      const coverage = await updater.analyzeCoverage(existingModule.cases, resources, options.module);
      
      if (options.json) {
        console.log(JSON.stringify(coverage, null, 2));
      } else {
        console.log(`\n📈 覆盖率报告:`);
        console.log('='.repeat(80));
        console.log(`\n当前用例数: ${coverage.existingCount}`);
        console.log(`推荐用例数: ${coverage.recommendedCount}`);
        console.log(`覆盖率: ${(coverage.coverageRatio * 100).toFixed(1)}%`);
        
        if (coverage.missingScenarios.length > 0) {
          console.log(`\n⚠️  缺失场景 (${coverage.missingScenarios.length}个):`);
          coverage.missingScenarios.forEach((scene, i) => {
            console.log(`  ${i + 1}. ${scene.name}`);
            console.log(`     优先级: ${scene.priority} | 原因: ${scene.reason}`);
          });
          
          console.log('\n💡 建议:');
          console.log(`  运行 auto-test update -m "${options.module}" 补充缺失用例`);
        } else {
          console.log('\n✅ 用例覆盖完整！');
        }
        
        console.log(`\n📋 已覆盖场景:`);
        coverage.recommendedScenarios
          .filter(s => !coverage.missingScenarios.includes(s))
          .forEach((scene, i) => {
            console.log(`  ${i + 1}. ✅ ${scene.name} (${scene.priority})`);
          });
      }
      
    } catch (error) {
      console.error('\n❌ 分析失败:', error.message);
      process.exit(1);
    }
  });

// 对比版本命令
program
  .command('compare')
  .alias('diff')
  .description('对比测试用例版本差异')
  .requiredOption('-m, --module <name>', '模块名称')
  .requiredOption('-v1, --version1 <version>', '版本1')
  .requiredOption('-v2, --version2 <version>', '版本2')
  .action(async (options) => {
    console.log('\n📊 Auto-Test Version Comparator');
    console.log('='.repeat(80));
    
    const modulePath = path.join('tests/modules', options.module);
    const casesDir = path.join(modulePath, 'cases');
    
    if (!fs.existsSync(casesDir)) {
      console.error(`\n❌ 模块不存在: ${options.module}`);
      process.exit(1);
    }
    
    try {
      // 读取所有用例
      const caseFiles = fs.readdirSync(casesDir).filter(f => f.endsWith('.json'));
      const differences = [];
      
      for (const file of caseFiles) {
        const caseData = JSON.parse(fs.readFileSync(path.join(casesDir, file), 'utf-8'));
        const testCase = TestCase.fromJSON(caseData);
        
        // 查找指定版本
        const v1History = testCase.versionHistory.find(h => h.version === options.version1);
        const v2History = testCase.versionHistory.find(h => h.version === options.version2);
        
        if (v1History || v2History) {
          const currentInV1 = testCase.version === options.version1 || v1History;
          const currentInV2 = testCase.version === options.version2 || v2History;
          
          if (currentInV1 !== currentInV2 || (v1History && v2History)) {
            differences.push({
              caseId: testCase.id,
              caseName: testCase.name,
              inVersion1: currentInV1,
              inVersion2: currentInV2,
              v1Data: v1History,
              v2Data: v2History
            });
          }
        }
      }
      
      console.log('\n对比结果:');
      console.log(`  模块: ${options.module}`);
      console.log(`  版本变化: ${options.version1} → ${options.version2}`);
      console.log(`  变更用例数: ${differences.length}`);
      
      if (differences.length > 0) {
        console.log('\n详细变更:');
        differences.forEach(diff => {
          const status = diff.inVersion1 && diff.inVersion2 ? '修改' : 
                        diff.inVersion2 ? '新增' : '删除';
          console.log(`\n  📋 ${diff.caseName} (${diff.caseId}) - ${status}`);
        });
      }
      
    } catch (error) {
      console.error('\n❌ 版本对比失败:', error.message);
      process.exit(1);
    }
  });

// 基于录制生成回归测试脚本命令
program
  .command('generate-from-recording')
  .alias('gfr')
  .description('基于录制结果生成回归测试脚本')
  .requiredOption('-m, --module <name>', '模块名称')
  .option('-r, --record-file <path>', '录制的原始文件路径')
  .option('-o, --output <dir>', '模块目录', 'tests/modules')
  .action(async (options) => {
    console.log('\n🎬 Auto-Test Generate From Recording');
    console.log('='.repeat(80));
    
    // 验证配置
    const config = validateConfig();
    
    const modulePath = path.join(options.output, options.module);
    const recordDir = path.join('tests/record', options.module);
    
    // 确定录制文件路径
    let recordedFile = options.recordFile;
    if (!recordedFile) {
      // 自动查找录制文件
      const defaultPath = path.join(recordDir, 'recorded-raw.spec.js');
      if (fs.existsSync(defaultPath)) {
        recordedFile = defaultPath;
      } else {
        console.error(`\n❌ 未找到录制文件: ${defaultPath}`);
        console.log('\n请确认:');
        console.log(`  1. 已执行录制: auto-test record-quick -m ${options.module}`);
        console.log(`  2. 或手动指定录制文件: --record-file <path>`);
        process.exit(1);
      }
    }
    
    if (!fs.existsSync(recordedFile)) {
      console.error(`\n❌ 录制文件不存在: ${recordedFile}`);
      process.exit(1);
    }
    
    console.log(`\n📂 模块: ${options.module}`);
    console.log(`📄 录制文件: ${recordedFile}`);
    
    try {
      // 加载用例
      const casesDir = path.join(modulePath, 'cases');
      const testCases = [];
      
      if (fs.existsSync(casesDir)) {
        const caseFiles = fs.readdirSync(casesDir).filter(f => f.endsWith('.json'));
        for (const file of caseFiles) {
          const caseData = JSON.parse(fs.readFileSync(path.join(casesDir, file), 'utf-8'));
          testCases.push(caseData);
        }
      }
      
      console.log(`📋 加载了 ${testCases.length} 个测试用例`);
      
      // 分析录制结果
      const recordingAssistant = new RecordingAssistant();
      const analysis = recordingAssistant.analyzeRecording(recordedFile);
      
      if (analysis) {
        recordingAssistant.printAnalysisReport(analysis);
      }
      
      // 生成回归测试脚本
      const outputPath = path.join(modulePath, 'scripts', `${options.module}-regression.spec.js`);
      
      console.log('\n📝 正在生成回归测试脚本...');
      const generatedPath = await recordingAssistant.generateRegressionScriptFromRecording(
        options.module,
        recordedFile,
        testCases,
        outputPath
      );
      
      console.log('\n' + '='.repeat(80));
      console.log('✅ 回归测试脚本生成完成！');
      console.log('='.repeat(80));
      console.log(`\n📄 生成的脚本: ${generatedPath}`);
      console.log('\n执行回归测试:');
      console.log(`  auto-test regression -m ${options.module}`);
      console.log('\n或直接执行:');
      console.log(`  npx playwright test ${generatedPath} --headed`);
      
    } catch (error) {
      console.error('\n❌ 生成失败:', error.message);
      process.exit(1);
    }
  });

// 验证配置命令
program
  .command('config')
  .alias('cfg')
  .description('查看和验证 test-config.json 配置')
  .option('--validate', '验证配置完整性', true)
  .option('--show', '显示配置内容（隐藏敏感信息）', false)
  .action(async (options) => {
    console.log('\n⚙️  Auto-Test Configuration Validator');
    console.log('='.repeat(80));
    
    try {
      const config = ConfigLoader.load();
      
      console.log('\n✅ 配置文件加载成功');
      console.log(`\n配置文件路径: ${ConfigLoader.configPath || 'config/test-config.json'}`);
      
      if (options.validate) {
        console.log('\n📋 配置验证结果:');
        console.log(`  ✅ 环境配置: ${Object.keys(config.environments).length} 个环境`);
        console.log(`     - ${Object.keys(config.environments).join(', ')}`);
        console.log(`  ✅ 账号配置: ${config.credentials.accounts.length} 个账号`);
        config.credentials.accounts.forEach(acc => {
          console.log(`     - ${acc.role}: ${acc.username}`);
        });
        console.log(`  ✅ 租户配置: ${Object.keys(config.credentials.tenant).join(', ')}`);
        console.log(`  ✅ 选择器配置: 已定义`);
        console.log(`  ✅ 超时配置: 已定义`);
      }
      
      if (options.show) {
        console.log('\n📄 配置内容（敏感信息已隐藏）:');
        const displayConfig = JSON.parse(JSON.stringify(config));
        
        // 隐藏密码
        if (displayConfig.credentials && displayConfig.credentials.accounts) {
          displayConfig.credentials.accounts.forEach(acc => {
            if (acc.password) {
              acc.password = '********';
            }
          });
        }
        
        console.log(JSON.stringify(displayConfig, null, 2));
      }
      
      console.log('\n✅ 配置验证通过！');
      
    } catch (error) {
      console.error('\n❌ 配置验证失败:', error.message);
      process.exit(1);
    }
  });

// 录制测试命令
program
  .command('record')
  .alias('rec')
  .description('使用 Playwright 录制测试（自动打开浏览器录制操作）')
  .option('-u, --url <url>', '目标URL', 'https://apqp-dev.catl.com')
  .option('-o, --output <file>', '输出文件', 'tests/recorded-test.spec.js')
  .option('-s, --save-auth', '保存登录状态', false)
  .option('-l, --load-auth', '使用已保存的登录状态', false)
  .option('--headed', '有头模式（默认）', true)
  .option('--viewport <size>', '视窗大小', '1920,1080')
  .action(async (options) => {
    console.log('\n🎥 Playwright Test Recorder');
    console.log('='.repeat(80));
    
    // 验证配置
    const config = validateConfig();
    const envConfig = ConfigLoader.getEnvironment('dev');
    
    console.log('\n📋 录制配置:');
    console.log(`   目标URL: ${options.url}`);
    console.log(`   输出文件: ${options.output}`);
    console.log(`   视窗大小: ${options.viewport}`);
    
    // 构建命令
    let cmd = `npx playwright codegen ${options.url}`;
    
    // 添加视窗大小
    if (options.viewport) {
      cmd += ` --viewport-size=${options.viewport}`;
    }
    
    // 添加认证状态
    const authPath = 'tests/config/auth.json';
    if (options.saveAuth) {
      cmd += ` --save-storage=${authPath}`;
      console.log(`   保存认证: ${authPath}`);
    } else if (options.loadAuth && fs.existsSync(authPath)) {
      cmd += ` --load-storage=${authPath}`;
      console.log(`   加载认证: ${authPath}`);
    }
    
    // 设置目标语言
    cmd += ' --target=javascript';
    
    // 设置输出文件
    cmd += ` -o ${options.output}`;
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎬 即将启动录制...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('操作说明:');
    console.log('  1. 会打开两个窗口：浏览器 + 代码生成器');
    console.log('  2. 在浏览器中执行你的操作');
    console.log('  3. 代码生成器会实时显示录制的代码');
    console.log('  4. 完成后关闭浏览器，代码自动保存');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const { execSync } = require('child_process');
    
    try {
      execSync(cmd, { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      console.log('\n' + '='.repeat(80));
      console.log('✅ 录制完成！');
      console.log('='.repeat(80));
      console.log(`\n📄 录制的测试文件: ${options.output}`);
      console.log('\n下一步:');
      console.log(`  1. 检查录制的代码: cat ${options.output}`);
      console.log(`  2. 执行录制的测试: npx playwright test ${options.output} --headed`);
      console.log(`  3. 优化录制的代码，替换不稳定的选择器`);
      
      if (options.saveAuth) {
        console.log(`\n💾 登录状态已保存: ${authPath}`);
        console.log('   后续录制可使用: auto-test record --load-auth');
      }
      
    } catch (error) {
      console.error('\n❌ 录制失败:', error.message);
      process.exit(1);
    }
  });

// 快速录制常用功能命令
program
  .command('record-quick')
  .alias('rq')
  .description('快速录制常用功能（预配置好登录状态）')
  .option('-m, --module <name>', '功能模块名称', '物料开发流程管理')
  .action(async (options) => {
    console.log('\n🎥 快速录制模式');
    console.log('='.repeat(80));
    
    // 验证配置
    const config = validateConfig();
    const envConfig = ConfigLoader.getEnvironment('dev');
    
    const authPath = 'tests/config/auth.json';
    const outputFile = `tests/modules/${options.module}/scripts/${options.module}-录制版.spec.js`;
    
    // 确保目录存在
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log(`\n📋 快速录制配置:`);
    console.log(`   功能模块: ${options.module}`);
    console.log(`   输出文件: ${outputFile}`);
    
    // 检查是否有认证状态
    const hasAuth = fs.existsSync(authPath);
    if (hasAuth) {
      console.log(`   认证状态: 已保存，跳过登录`);
    } else {
      console.log(`   认证状态: 未保存，需要先登录`);
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎬 即将启动录制...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('提示:');
    if (!hasAuth) {
      console.log('  1. 首先在浏览器中完成登录');
      console.log('  2. 登录后会自动保存认证状态');
      console.log('  3. 然后导航到功能页面进行录制');
    } else {
      console.log('  1. 浏览器会自动使用已保存的登录状态');
      console.log('  2. 直接开始功能操作录制');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // 构建命令
    let cmd = `npx playwright codegen ${envConfig.baseUrl}`;
    cmd += ' --viewport-size=1920,1080';
    cmd += ' --target=javascript';
    cmd += ` -o ${outputFile}`;
    
    if (hasAuth) {
      cmd += ` --load-storage=${authPath}`;
    } else {
      cmd += ` --save-storage=${authPath}`;
    }
    
    const { execSync } = require('child_process');
    
    try {
      execSync(cmd, { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      console.log('\n' + '='.repeat(80));
      console.log('✅ 录制完成！');
      console.log('='.repeat(80));
      console.log(`\n📄 录制的测试文件: ${outputFile}`);
      console.log('\n下一步:');
      console.log(`  1. 查看录制的代码，检查选择器是否稳定`);
      console.log(`  2. 执行测试: auto-test run -m ${options.module}`);
      
    } catch (error) {
      console.error('\n❌ 录制失败:', error.message);
      process.exit(1);
    }
  });

// 解析命令行参数
program.parse();

// 如果没有参数，显示帮助
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
