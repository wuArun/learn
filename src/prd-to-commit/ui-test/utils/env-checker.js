/**
 * Playwright 环境自动检测与安装工具
 * 检查 node_modules、playwright 包、浏览器是否已安装
 * 支持自动安装缺失的依赖
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');

class EnvChecker {
  constructor() {
    this.issues = [];
    this.ready = false;
  }

  /**
   * 检查 node_modules 是否存在
   * @returns {boolean}
   */
  checkNodeModules() {
    const nodeModulesPath = path.join(PROJECT_ROOT, 'node_modules');
    const exists = fs.existsSync(nodeModulesPath);

    if (!exists) {
      this.issues.push({
        type: 'node_modules',
        message: 'node_modules 目录不存在',
        fix: 'npm install'
      });
    }

    return exists;
  }

  /**
   * 检查 playwright 包是否可用
   * @returns {boolean}
   */
  checkPlaywright() {
    try {
      require.resolve('playwright', { paths: [PROJECT_ROOT] });
      return true;
    } catch (e) {
      this.issues.push({
        type: 'playwright',
        message: 'playwright 包未安装',
        fix: 'npm install'
      });
      return false;
    }
  }

  /**
   * 检查 @playwright/test 包是否可用
   * @returns {boolean}
   */
  checkPlaywrightTest() {
    try {
      require.resolve('@playwright/test', { paths: [PROJECT_ROOT] });
      return true;
    } catch (e) {
      this.issues.push({
        type: '@playwright/test',
        message: '@playwright/test 包未安装',
        fix: 'npm install'
      });
      return false;
    }
  }

  /**
   * 检查 Playwright 浏览器是否已安装
   * @returns {boolean}
   */
  checkBrowsers() {
    try {
      const playwrightPath = require.resolve('playwright', { paths: [PROJECT_ROOT] });
      const playwrightDir = path.dirname(playwrightPath);
      const registryPath = path.join(playwrightDir, '..', '.local-browsers');

      if (fs.existsSync(registryPath)) {
        return true;
      }

      // 尝试通过 playwright 命令检查
      try {
        const result = execSync('npx playwright install --dry-run 2>&1', {
          cwd: PROJECT_ROOT,
          encoding: 'utf-8',
          timeout: 15000
        });
        // 如果 dry-run 没报错，说明浏览器已安装
        return true;
      } catch (e) {
        this.issues.push({
          type: 'browsers',
          message: 'Playwright 浏览器未安装',
          fix: 'npx playwright install chromium'
        });
        return false;
      }
    } catch (e) {
      // playwright 包本身未安装，浏览器检查跳过
      return false;
    }
  }

  /**
   * 执行所有检查
   * @returns {{ ready: boolean, issues: Array }}
   */
  check() {
    this.issues = [];

    const nodeModulesOk = this.checkNodeModules();
    const playwrightOk = this.checkPlaywright();
    const playwrightTestOk = this.checkPlaywrightTest();
    let browsersOk = false;

    if (playwrightOk) {
      browsersOk = this.checkBrowsers();
    }

    this.ready = nodeModulesOk && playwrightOk && playwrightTestOk && browsersOk;
    return {
      ready: this.ready,
      issues: this.issues
    };
  }

  /**
   * 自动安装缺失的依赖
   * @param {Object} options - 安装选项
   * @param {boolean} options.installBrowsers - 是否安装浏览器（默认 true）
   * @param {boolean} options.withDeps - 是否安装系统依赖（默认 false，需要管理员权限）
   * @returns {boolean} 安装是否成功
   */
  async install(options = {}) {
    const { installBrowsers = true, withDeps = false } = options;

    console.log('\n🔧 开始安装缺失的依赖...\n');

    // 1. npm install
    if (!this.issues.some(i => i.type === 'node_modules' || i.type === 'playwright' || i.type === '@playwright/test')) {
      console.log('   ✅ npm 包已安装，跳过 npm install');
    } else {
      console.log('   📦 执行 npm install...');
      try {
        execSync('npm install', {
          cwd: PROJECT_ROOT,
          stdio: 'inherit',
          timeout: 120000
        });
        console.log('   ✅ npm install 完成');
      } catch (e) {
        console.error('   ❌ npm install 失败:', e.message);
        return false;
      }
    }

    // 2. 安装浏览器
    if (installBrowsers) {
      console.log('\n   🌐 安装 Playwright 浏览器...');
      const cmd = withDeps
        ? 'npx playwright install --with-deps chromium'
        : 'npx playwright install chromium';

      try {
        execSync(cmd, {
          cwd: PROJECT_ROOT,
          stdio: 'inherit',
          timeout: 300000
        });
        console.log('   ✅ 浏览器安装完成');
      } catch (e) {
        console.error('   ❌ 浏览器安装失败:', e.message);
        if (!withDeps) {
          console.log('   💡 提示: 如果缺少系统依赖，请尝试:');
          console.log('      npx playwright install --with-deps chromium');
          console.log('      (可能需要管理员权限)');
        }
        return false;
      }
    }

    console.log('\n   ✅ 依赖安装完成');
    return true;
  }

  /**
   * 打印环境状态
   */
  printStatus() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 Playwright 环境检查');
    console.log('='.repeat(60));
    console.log(`   项目根目录: ${PROJECT_ROOT}`);

    const nodeModulesOk = fs.existsSync(path.join(PROJECT_ROOT, 'node_modules'));
    console.log(`   node_modules: ${nodeModulesOk ? '✅ 存在' : '❌ 不存在'}`);

    let playwrightOk = false;
    try {
      require.resolve('playwright', { paths: [PROJECT_ROOT] });
      playwrightOk = true;
    } catch (e) {}
    console.log(`   playwright: ${playwrightOk ? '✅ 已安装' : '❌ 未安装'}`);

    let playwrightTestOk = false;
    try {
      require.resolve('@playwright/test', { paths: [PROJECT_ROOT] });
      playwrightTestOk = true;
    } catch (e) {}
    console.log(`   @playwright/test: ${playwrightTestOk ? '✅ 已安装' : '❌ 未安装'}`);

    console.log(`   浏览器: ${this.issues.some(i => i.type === 'browsers') ? '❌ 未安装' : '✅ 已安装'}`);

    if (this.issues.length > 0) {
      console.log('\n   ⚠️  发现问题:');
      this.issues.forEach(issue => {
        console.log(`   - ${issue.message}`);
        console.log(`     修复: ${issue.fix}`);
      });
      console.log('\n   📌 运行以下命令自动修复:');
      console.log('      node utils/env-checker.js --install');
    } else {
      console.log('\n   ✅ 环境检查通过，可以执行测试');
    }

    console.log('='.repeat(60));
  }
}

// CLI 入口
if (require.main === module) {
  const checker = new EnvChecker();
  const result = checker.check();
  checker.printStatus();

  const shouldInstall = process.argv.includes('--install') || process.argv.includes('-i');
  const withDeps = process.argv.includes('--with-deps');

  if (shouldInstall && !result.ready) {
    checker.install({ installBrowsers: true, withDeps }).then(success => {
      if (success) {
        console.log('\n✅ 环境安装成功！');
        // 重新检查
        const recheck = checker.check();
        checker.printStatus();
        process.exit(recheck.ready ? 0 : 1);
      } else {
        console.error('\n❌ 环境安装失败，请手动安装');
        process.exit(1);
      }
    });
  } else {
    process.exit(result.ready ? 0 : 1);
  }
}

module.exports = EnvChecker;
