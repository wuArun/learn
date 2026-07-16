/**
 * PRD和代码检索 Agent
 * 根据功能提示词自动检索相关PRD文档和前后端代码
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class ResourceFinder {
  constructor(config = {}) {
    this.config = {
      prdDir: config.prdDir || 'docs/prd',
      codeDirs: config.codeDirs || ['backend', 'frontend', 'src'],
      fileExtensions: config.fileExtensions || ['.md', '.java', '.ts', '.tsx', '.js', '.jsx'],
      ...config
    };
    
    this.cache = new Map();
  }

  /**
   * 根据功能提示词检索资源
   * @param {string} prompt - 功能提示词（如："物料开发导出功能"）
   * @returns {Promise<Object>}
   */
  async findResources(prompt) {
    console.log(`🔍 正在检索与 "${prompt}" 相关的资源...`);
    
    const result = {
      prompt,
      timestamp: new Date().toISOString(),
      prdFiles: [],
      backendCode: [],
      frontendCode: [],
      confidence: 0
    };
    
    // 1. 检索PRD文档
    console.log('  📄 检索PRD文档...');
    result.prdFiles = await this.findPrdFiles(prompt);
    console.log(`     找到 ${result.prdFiles.length} 个相关PRD文档`);
    
    // 2. 检索后端代码
    console.log('  💻 检索后端代码...');
    result.backendCode = await this.findBackendCode(prompt, result.prdFiles);
    console.log(`     找到 ${result.backendCode.length} 个后端代码文件`);
    
    // 3. 检索前端代码
    console.log('  🎨 检索前端代码...');
    result.frontendCode = await this.findFrontendCode(prompt);
    console.log(`     找到 ${result.frontendCode.length} 个前端代码文件`);
    
    // 4. 计算置信度
    result.confidence = this.calculateConfidence(result);
    
    // 5. 打印检索结果摘要
    this.printSummary(result);
    
    return result;
  }

  /**
   * 检索PRD文档
   * @param {string} prompt - 功能提示词
   * @returns {Promise<Array>}
   */
  async findPrdFiles(prompt) {
    const prdFiles = [];
    const keywords = this.extractKeywords(prompt);
    
    // 查找所有Markdown文件
    const pattern = path.join(this.config.prdDir, '**/*.md');
    const files = glob.sync(pattern, { absolute: true });
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const score = this.calculateRelevance(content, keywords, file);
        
        if (score > 0.3) { // 阈值
          prdFiles.push({
            path: file,
            name: path.basename(file),
            score,
            summary: this.extractSummary(content, 200)
          });
        }
      } catch (e) {
        // 忽略读取失败的文件
      }
    }
    
    // 按相关性排序
    return prdFiles.sort((a, b) => b.score - a.score);
  }

  /**
   * 检索后端代码
   * @param {string} prompt - 功能提示词
   * @param {Array} prdFiles - 已找到的PRD文件
   * @returns {Promise<Array>}
   */
  async findBackendCode(prompt, prdFiles) {
    const codeFiles = [];
    const keywords = this.extractKeywords(prompt);
    
    // 从PRD中提取接口和实体信息
    const extractedInfo = this.extractInfoFromPrd(prdFiles);
    
    // 查找Java文件
    const patterns = this.config.codeDirs.map(dir => 
      path.join(dir, '**/*.java')
    );
    
    for (const pattern of patterns) {
      const files = glob.sync(pattern, { absolute: true });
      
      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf-8');
          const fileName = path.basename(file, '.java');
          
          // 多维度评分
          let score = 0;
          
          // 1. 文件名匹配
          if (keywords.some(k => fileName.toLowerCase().includes(k.toLowerCase()))) {
            score += 0.4;
          }
          
          // 2. 内容匹配
          const contentScore = this.calculateRelevance(content, keywords, file);
          score += contentScore * 0.4;
          
          // 3. PRD中提到的类名匹配
          if (extractedInfo.classNames.some(cn => 
            fileName.toLowerCase().includes(cn.toLowerCase()) ||
            content.toLowerCase().includes(cn.toLowerCase())
          )) {
            score += 0.2;
          }
          
          if (score > 0.3) {
            codeFiles.push({
              path: file,
              name: fileName,
              type: this.classifyJavaFile(file),
              score,
              keyMethods: this.extractMethods(content)
            });
          }
        } catch (e) {
          // 忽略读取失败的文件
        }
      }
    }
    
    return codeFiles.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  /**
   * 检索前端代码
   * @param {string} prompt - 功能提示词
   * @returns {Promise<Array>}
   */
  async findFrontendCode(prompt) {
    const codeFiles = [];
    const keywords = this.extractKeywords(prompt);
    
    // 查找前端文件
    const patterns = [
      '**/*.tsx',
      '**/*.ts',
      '**/*.jsx',
      '**/*.js'
    ];
    
    for (const pattern of patterns) {
      const files = glob.sync(pattern, { 
        absolute: true,
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
      });
      
      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf-8');
          const fileName = path.basename(file);
          
          let score = 0;
          
          // 文件名匹配
          if (keywords.some(k => fileName.toLowerCase().includes(k.toLowerCase()))) {
            score += 0.5;
          }
          
          // 内容匹配
          const contentScore = this.calculateRelevance(content, keywords, file);
          score += contentScore * 0.5;
          
          if (score > 0.3) {
            codeFiles.push({
              path: file,
              name: fileName,
              type: this.classifyFrontendFile(file),
              score,
              keyComponents: this.extractComponents(content)
            });
          }
        } catch (e) {
          // 忽略读取失败的文件
        }
      }
    }
    
    return codeFiles.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  /**
   * 提取关键词
   * @param {string} prompt - 提示词
   * @returns {Array}
   */
  extractKeywords(prompt) {
    // 分词并过滤停用词
    const stopWords = ['的', '了', '和', '是', '在', '我', '有', '个', '功能', '模块'];
    const words = prompt
      .replace(/[，。！？、；：""''（）【】《》]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1 && !stopWords.includes(w));
    
    // 添加英文变体
    const variations = [];
    for (const word of words) {
      variations.push(word);
      variations.push(word.toLowerCase());
      variations.push(word.charAt(0).toUpperCase() + word.slice(1));
      
      // 添加驼峰命名变体
      if (word.length > 2) {
        variations.push(word.charAt(0).toLowerCase() + word.slice(1));
      }
    }
    
    return [...new Set(variations)];
  }

  /**
   * 计算相关性分数
   * @param {string} content - 文件内容
   * @param {Array} keywords - 关键词列表
   * @param {string} filePath - 文件路径
   * @returns {number}
   */
  calculateRelevance(content, keywords, filePath) {
    const lowerContent = content.toLowerCase();
    const lowerPath = filePath.toLowerCase();
    
    let matches = 0;
    let totalWeight = 0;
    
    for (const keyword of keywords) {
      const weight = keyword.length > 3 ? 1.5 : 1; // 长词权重更高
      totalWeight += weight;
      
      // 内容匹配
      const contentMatches = (lowerContent.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      matches += contentMatches * weight * 0.1;
      
      // 路径匹配
      if (lowerPath.includes(keyword.toLowerCase())) {
        matches += weight * 0.5;
      }
    }
    
    // 归一化
    return Math.min(matches / Math.max(totalWeight * 0.5, 1), 1);
  }

  /**
   * 从PRD提取信息
   * @param {Array} prdFiles - PRD文件列表
   * @returns {Object}
   */
  extractInfoFromPrd(prdFiles) {
    const info = {
      classNames: [],
      apiEndpoints: [],
      entities: []
    };
    
    for (const prd of prdFiles) {
      try {
        const content = fs.readFileSync(prd.path, 'utf-8');
        
        // 提取Controller类名
        const controllerMatches = content.match(/Controller[:：]?\s*(\w+)/gi);
        if (controllerMatches) {
          info.classNames.push(...controllerMatches.map(m => m.replace(/Controller[:：]?\s*/i, '')));
        }
        
        // 提取API接口
        const apiMatches = content.match(/(?:GET|POST|PUT|DELETE|PATCH)\s+\/[^\s\n]+/gi);
        if (apiMatches) {
          info.apiEndpoints.push(...apiMatches);
        }
        
        // 提取实体名
        const entityMatches = content.match(/(?:实体|Entity|VO|DTO)[:：]?\s*(\w+)/gi);
        if (entityMatches) {
          info.entities.push(...entityMatches.map(m => m.replace(/(?:实体|Entity|VO|DTO)[:：]?\s*/i, '')));
        }
      } catch (e) {
        // 忽略错误
      }
    }
    
    return info;
  }

  /**
   * 提取摘要
   * @param {string} content - 内容
   * @param {number} maxLength - 最大长度
   * @returns {string}
   */
  extractSummary(content, maxLength = 200) {
    // 移除Markdown标记
    const plain = content
      .replace(/#+\s+/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_`]/g, '')
      .replace(/\n+/g, ' ')
      .trim();
    
    return plain.substring(0, maxLength) + (plain.length > maxLength ? '...' : '');
  }

  /**
   * 分类Java文件
   * @param {string} filePath - 文件路径
   * @returns {string}
   */
  classifyJavaFile(filePath) {
    if (filePath.includes('Controller')) return 'controller';
    if (filePath.includes('Service')) return 'service';
    if (filePath.includes('Mapper') || filePath.includes('Repository')) return 'repository';
    if (filePath.includes('VO') || filePath.includes('DTO') || filePath.includes('Entity')) return 'entity';
    if (filePath.includes('Config')) return 'config';
    return 'other';
  }

  /**
   * 分类前端文件
   * @param {string} filePath - 文件路径
   * @returns {string}
   */
  classifyFrontendFile(filePath) {
    if (filePath.includes('page') || filePath.includes('Page') || filePath.includes('views')) return 'page';
    if (filePath.includes('component') || filePath.includes('Component') || filePath.includes('components')) return 'component';
    if (filePath.includes('api') || filePath.includes('service')) return 'api';
    if (filePath.includes('store') || filePath.includes('model')) return 'store';
    if (filePath.includes('util') || filePath.includes('helper')) return 'util';
    return 'other';
  }

  /**
   * 提取方法
   * @param {string} content - 文件内容
   * @returns {Array}
   */
  extractMethods(content) {
    const methods = [];
    const methodPattern = /(?:public|private|protected)\s+(?:\w+(?:<[^>]+>)?\s+)?(\w+)\s*\([^)]*\)/g;
    let match;
    
    while ((match = methodPattern.exec(content)) !== null) {
      if (!['if', 'for', 'while', 'switch'].includes(match[1])) {
        methods.push(match[1]);
      }
    }
    
    return [...new Set(methods)].slice(0, 10);
  }

  /**
   * 提取组件
   * @param {string} content - 文件内容
   * @returns {Array}
   */
  extractComponents(content) {
    const components = [];
    
    // React组件
    const componentPattern = /(?:function|const|class)\s+(\w+)(?:\s*[:=]\s*(?:\([^)]*\)|React\.FC|React\.Component))?/g;
    let match;
    
    while ((match = componentPattern.exec(content)) !== null) {
      if (match[1] && match[1][0] === match[1][0].toUpperCase()) {
        components.push(match[1]);
      }
    }
    
    return [...new Set(components)].slice(0, 10);
  }

  /**
   * 计算置信度
   * @param {Object} result - 检索结果
   * @returns {number}
   */
  calculateConfidence(result) {
    let score = 0;
    
    // PRD文档
    if (result.prdFiles.length > 0) {
      score += Math.min(result.prdFiles.length * 0.2, 0.4);
      if (result.prdFiles[0].score > 0.7) {
        score += 0.2;
      }
    }
    
    // 后端代码
    if (result.backendCode.length > 0) {
      score += Math.min(result.backendCode.length * 0.1, 0.3);
    }
    
    // 前端代码
    if (result.frontendCode.length > 0) {
      score += Math.min(result.frontendCode.length * 0.05, 0.1);
    }
    
    return Math.min(score, 1);
  }

  /**
   * 打印摘要
   * @param {Object} result - 检索结果
   */
  printSummary(result) {
    console.log('\n📊 检索结果摘要:');
    console.log(`   置信度: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`   PRD文档: ${result.prdFiles.length} 个`);
    console.log(`   后端代码: ${result.backendCode.length} 个`);
    console.log(`   前端代码: ${result.frontendCode.length} 个`);
    
    if (result.prdFiles.length > 0) {
      console.log('\n   最相关的PRD:');
      result.prdFiles.slice(0, 3).forEach((prd, i) => {
        console.log(`     ${i + 1}. ${prd.name} (匹配度: ${(prd.score * 100).toFixed(1)}%)`);
      });
    }
    
    if (result.backendCode.length > 0) {
      console.log('\n   最相关的后端代码:');
      result.backendCode.slice(0, 3).forEach((code, i) => {
        console.log(`     ${i + 1}. ${code.name} (${code.type}, 匹配度: ${(code.score * 100).toFixed(1)}%)`);
      });
    }
  }
}

module.exports = ResourceFinder;
