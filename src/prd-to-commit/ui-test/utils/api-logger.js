/**
 * API调用日志记录器
 * 捕获和记录页面API请求和响应
 */

class ApiLogger {
  constructor() {
    this.apiCalls = [];
  }

  /**
   * 设置页面API监听
   * @param {Page} page - Playwright page对象
   */
  setupPageListener(page) {
    // 监听请求
    page.on('request', request => {
      const url = request.url();
      // 只记录API请求（排除静态资源）
      if (this.isApiRequest(url)) {
        const call = {
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          method: request.method(),
          url: this.simplifyUrl(url),
          fullUrl: url,
          timestamp: new Date().toISOString(),
          requestHeaders: request.headers(),
          requestBody: null,
          responseBody: null,
          responseBodyType: null,
          status: null,
          statusText: null,
          responseHeaders: null,
          duration: null
        };

        // 记录请求体（POST/PUT/PATCH）
        if (['POST', 'PUT', 'PATCH'].includes(request.method())) {
          const postData = request.postData();
          if (postData) {
            try {
              call.requestBody = JSON.parse(postData);
            } catch (e) {
              call.requestBody = postData;
            }
          }
        }

        this.apiCalls.push(call);
      }
    });

    // 监听响应
    page.on('response', async response => {
      const url = response.url();
      // 只记录API响应
      if (this.isApiRequest(url)) {
        const matchingCall = this.findMatchingCall(url, response.request().method());
        if (matchingCall) {
          matchingCall.status = response.status();
          matchingCall.statusText = response.statusText();
          matchingCall.responseHeaders = response.headers();

          // 尝试获取响应体
          try {
            const contentType = response.headers()['content-type'] || '';
            
            if (contentType.includes('application/json')) {
              matchingCall.responseBody = await response.json();
              matchingCall.responseBodyType = 'JSON';
            } else if (contentType.includes('text/')) {
              matchingCall.responseBody = await response.text();
              matchingCall.responseBodyType = 'Text';
            } else {
              matchingCall.responseBody = '[Binary Data]';
              matchingCall.responseBodyType = 'Binary';
            }
          } catch (e) {
            matchingCall.responseBody = `[Error reading response: ${e.message}]`;
            matchingCall.responseBodyType = 'Error';
          }
        }
      }
    });
  }

  /**
   * 判断是否是API请求
   * @param {string} url - 请求URL
   * @returns {boolean}
   */
  isApiRequest(url) {
    // 排除静态资源
    const excludedExtensions = [
      '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
      '.woff', '.woff2', '.ttf', '.eot', '.map'
    ];
    
    const excludedPatterns = [
      '/assets/', '/static/', '/dist/', '/build/',
      'google-analytics', 'googleapis', 'gstatic',
      'chrome-extension', 'moz-extension'
    ];

    // 检查扩展名
    const urlLower = url.toLowerCase();
    for (const ext of excludedExtensions) {
      if (urlLower.endsWith(ext)) {
        return false;
      }
    }

    // 检查排除模式
    for (const pattern of excludedPatterns) {
      if (url.includes(pattern)) {
        return false;
      }
    }

    // 检查是否是API路径（包含 /api/ 或其他API模式）
    const apiPatterns = [
      '/api/',
      '/v1/',
      '/v2/',
      '/rest/',
      '/service/',
      '.json'
    ];

    for (const pattern of apiPatterns) {
      if (url.includes(pattern)) {
        return true;
      }
    }

    // 默认包含所有非静态资源的HTTP请求
    return url.startsWith('http');
  }

  /**
   * 查找匹配的API调用记录
   * @param {string} url - 响应URL
   * @param {string} method - 请求方法
   * @returns {Object|null}
   */
  findMatchingCall(url, method) {
    // 从后往前找最新的匹配项
    for (let i = this.apiCalls.length - 1; i >= 0; i--) {
      const call = this.apiCalls[i];
      if (call.fullUrl === url && call.method === method && call.status === null) {
        return call;
      }
    }
    return null;
  }

  /**
   * 简化URL显示
   * @param {string} url - 完整URL
   * @returns {string}
   */
  simplifyUrl(url) {
    try {
      const urlObj = new URL(url);
      // 只返回路径部分
      let path = urlObj.pathname;
      // 如果路径太长，截断显示
      if (path.length > 60) {
        path = path.substring(0, 30) + '...' + path.substring(path.length - 25);
      }
      return path;
    } catch (e) {
      return url;
    }
  }

  /**
   * 获取所有API调用记录
   * @returns {Array}
   */
  getApiCalls() {
    return this.apiCalls;
  }

  /**
   * 格式化API调用记录用于报告
   * @returns {Array}
   */
  formatForReport() {
    return this.apiCalls.map(call => ({
      method: call.method,
      url: call.url,
      fullUrl: call.fullUrl,
      status: call.status,
      statusText: call.statusText,
      requestBody: call.requestBody,
      responseBody: call.responseBody,
      responseBodyType: call.responseBodyType,
      timestamp: call.timestamp
    }));
  }

  /**
   * 清除所有记录
   */
  clear() {
    this.apiCalls = [];
  }

  /**
   * 获取统计信息
   * @returns {Object}
   */
  getStatistics() {
    const total = this.apiCalls.length;
    const success = this.apiCalls.filter(call => call.status >= 200 && call.status < 300).length;
    const failed = this.apiCalls.filter(call => call.status >= 400).length;
    const pending = this.apiCalls.filter(call => call.status === null).length;

    return {
      total,
      success,
      failed,
      pending
    };
  }
}

module.exports = ApiLogger;
