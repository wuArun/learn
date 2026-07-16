/**
 * 配置加载器 - 统一加载和管理 test-config.json
 * 
 * 功能：
 * 1. 读取配置文件
 * 2. 解析环境变量
 * 3. 提供配置访问接口
 * 4. 配置验证
 */

const fs = require('fs');
const path = require('path');

class ConfigLoader {
  constructor() {
    this.config = null;
    this.configPath = null;
  }

  /**
   * 查找配置文件路径
   * 按以下顺序查找：
   * 1. 当前工作目录下的 tests/config/test-config.json
   * 2. 环境变量 TEST_CONFIG_PATH 指定的路径
   * 3. 上级目录中的 tests/config/test-config.json
   */
  findConfigPath() {
    // 1. 检查环境变量
    if (process.env.TEST_CONFIG_PATH) {
      const envPath = path.resolve(process.env.TEST_CONFIG_PATH);
      if (fs.existsSync(envPath)) {
        return envPath;
      }
    }

    // 2. 检查当前工作目录
    const cwd = process.cwd();
    const defaultPaths = [
      path.join(cwd, 'config/test-config.json'),
      path.join(cwd, 'tests/config/test-config.json'),
      path.join(cwd, 'test-config.json'),
    ];

    for (const configPath of defaultPaths) {
      if (fs.existsSync(configPath)) {
        return configPath;
      }
    }

    // 3. 基于脚本所在目录查找（skill项目根目录）
    const scriptDir = path.resolve(__dirname, '..');
    const scriptDefaultPaths = [
      path.join(scriptDir, 'config/test-config.json'),
      path.join(scriptDir, 'tests/config/test-config.json'),
    ];

    for (const configPath of scriptDefaultPaths) {
      if (fs.existsSync(configPath)) {
        return configPath;
      }
    }

    // 4. 向上级目录查找（最多查找5层）
    let currentDir = cwd;
    for (let i = 0; i < 5; i++) {
      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) break; // 到达根目录
      
      const parentPath = path.join(parentDir, 'tests/config/test-config.json');
      if (fs.existsSync(parentPath)) {
        return parentPath;
      }
      
      currentDir = parentDir;
    }

    return null;
  }

  /**
   * 加载配置文件
   * @param {string} configPath - 配置文件路径（可选）
   * @returns {Object} 配置对象
   */
  load(configPath = null) {
    // 如果已经加载过，直接返回缓存
    if (this.config && !configPath) {
      return this.config;
    }

    // 确定配置文件路径
    this.configPath = configPath || this.findConfigPath();

    if (!this.configPath) {
      throw new Error(
        'Configuration file not found!\n' +
        'Expected: tests/config/test-config.json\n' +
        'Please create the configuration file or set TEST_CONFIG_PATH environment variable.'
      );
    }

    try {
      const configContent = fs.readFileSync(this.configPath, 'utf-8');
      this.config = JSON.parse(configContent);
      
      // 解析环境变量
      this.config = this.resolveEnvironmentVariables(this.config);

      // 验证配置
      this.validateConfig(this.config);

      return this.config;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Configuration file not found: ${this.configPath}`);
      }
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in configuration file: ${this.configPath}\n${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 解析配置中的环境变量占位符
   * 支持格式：${ENV_VAR_NAME} 或 ${ENV_VAR_NAME:default_value}
   */
  resolveEnvironmentVariables(obj) {
    if (typeof obj === 'string') {
      return obj.replace(/\$\{([^}:]+)(?::([^}]*))?\}/g, (match, varName, defaultValue) => {
        const value = process.env[varName];
        if (value === undefined) {
          if (defaultValue !== undefined) {
            return defaultValue;
          }
          console.warn(`⚠️  Environment variable not found: ${varName}`);
          return match; // 保留原样
        }
        return value;
      });
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.resolveEnvironmentVariables(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      const resolved = {};
      for (const [key, value] of Object.entries(obj)) {
        resolved[key] = this.resolveEnvironmentVariables(value);
      }
      return resolved;
    }

    return obj;
  }

  /**
   * 验证配置完整性
   */
  validateConfig(config) {
    const requiredSections = ['environments', 'credentials', 'selectors', 'timeouts'];
    const missing = requiredSections.filter(section => !config[section]);
    
    if (missing.length > 0) {
      throw new Error(
        `Configuration validation failed. Missing required sections: ${missing.join(', ')}`
      );
    }

    // 验证环境配置
    if (!config.environments.dev && !config.environments.test && !config.environments.prod) {
      throw new Error('Configuration must have at least one environment (dev, test, or prod)');
    }

    // 验证凭据配置
    if (!config.credentials.accounts || config.credentials.accounts.length === 0) {
      throw new Error('Configuration must have at least one account in credentials.accounts');
    }

    // 验证选择器配置
    if (!config.selectors.common || !config.selectors.common.loginForm) {
      throw new Error('Configuration must have selectors.common.loginForm defined');
    }

    return true;
  }

  /**
   * 获取特定环境的配置
   * @param {string} envName - 环境名称 (dev/test/prod)
   * @returns {Object} 环境配置
   */
  getEnvironment(envName = null) {
    if (!this.config) {
      this.load();
    }

    const targetEnv = envName || this.config.defaultEnvironment || 'test';
    
    if (!this.config.environments[targetEnv]) {
      throw new Error(`Environment '${targetEnv}' not found in configuration`);
    }

    return this.config.environments[targetEnv];
  }

  /**
   * 获取凭据配置
   * @param {string} role - 角色名称 (admin/user/viewer)
   * @returns {Object} 凭据信息
   */
  getCredentials(role = null) {
    if (!this.config) {
      this.load();
    }

    const { accounts } = this.config.credentials;
    
    if (!role) {
      // 返回默认账号（第一个）
      return accounts[0];
    }

    const account = accounts.find(acc => acc.role === role);
    if (!account) {
      throw new Error(`Credentials for role '${role}' not found. Available roles: ${accounts.map(a => a.role).join(', ')}`);
    }

    return account;
  }

  /**
   * 获取租户配置
   * @param {string} tenantName - 租户名称
   * @returns {string} 租户值
   */
  getTenant(tenantName = 'default') {
    if (!this.config) {
      this.load();
    }

    const tenant = this.config.credentials.tenant[tenantName];
    if (!tenant) {
      throw new Error(`Tenant '${tenantName}' not found. Available tenants: ${Object.keys(this.config.credentials.tenant).join(', ')}`);
    }

    return tenant;
  }

  /**
   * 获取选择器配置
   * @param {string} selectorPath - 选择器路径 (如 'common.loginForm.loginButton')
   * @returns {string} 选择器值
   */
  getSelector(selectorPath) {
    if (!this.config) {
      this.load();
    }

    const parts = selectorPath.split('.');
    let current = this.config.selectors;

    for (const part of parts) {
      if (current[part] === undefined) {
        throw new Error(`Selector '${selectorPath}' not found in configuration`);
      }
      current = current[part];
    }

    return current;
  }

  /**
   * 获取超时配置
   * @param {string} timeoutName - 超时名称
   * @returns {number} 超时毫秒数
   */
  getTimeout(timeoutName = 'default') {
    if (!this.config) {
      this.load();
    }

    const timeout = this.config.timeouts[timeoutName];
    if (timeout === undefined) {
      return this.config.timeouts.default || 30000;
    }

    return timeout;
  }

  /**
   * 获取测试数据配置
   * @returns {Object} 测试数据配置
   */
  getTestData() {
    if (!this.config) {
      this.load();
    }

    return this.config.testData || {};
  }

  /**
   * 获取浏览器配置
   * @returns {Object} 浏览器配置
   */
  getBrowserConfig() {
    if (!this.config) {
      this.load();
    }

    return this.config.browser || { headless: true };
  }

  /**
   * 获取重试配置
   * @returns {Object} 重试配置
   */
  getRetryConfig() {
    if (!this.config) {
      this.load();
    }

    return this.config.retry || { maxRetries: 3, retryDelay: 1000 };
  }

  /**
   * 获取完整配置
   * @returns {Object} 完整配置对象
   */
  getConfig() {
    if (!this.config) {
      this.load();
    }

    return this.config;
  }

  /**
   * 重新加载配置
   */
  reload() {
    this.config = null;
    return this.load(this.configPath);
  }

  /**
   * 静态方法：快速加载配置
   */
  static load(configPath = null) {
    const loader = new ConfigLoader();
    return loader.load(configPath);
  }
}

// 导出单例实例
const configLoader = new ConfigLoader();

module.exports = ConfigLoader;
module.exports.default = configLoader;
module.exports.load = ConfigLoader.load;
