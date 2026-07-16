/**
 * 依赖关系管理器
 * 管理测试用例之间的依赖关系，支持拓扑排序和并行分组
 */

class DependencyManager {
  constructor() {
    this.dependencies = new Map();
  }

  /**
   * 添加依赖关系
   * @param {string} fromId - 依赖方用例ID
   * @param {string} toId - 被依赖方用例ID
   * @param {Object} [options] - 依赖选项 { type: 'before' }
   */
  addDependency(fromId, toId, options = {}) {
    if (!this.dependencies.has(fromId)) {
      this.dependencies.set(fromId, []);
    }

    const deps = this.dependencies.get(fromId);
    if (!deps.some(d => d.toId === toId)) {
      deps.push({
        toId,
        type: options.type || 'before'
      });
    }
  }

  /**
   * 从JSON对象导入依赖关系
   * @param {Object} data - 序列化的依赖数据
   */
  import(data) {
    if (!data || !data.dependencies) return;

    if (Array.isArray(data.dependencies)) {
      data.dependencies.forEach(dep => {
        this.addDependency(dep.fromId, dep.toId, { type: dep.type });
      });
    } else if (typeof data.dependencies === 'object') {
      // Map-like object format
      for (const [fromId, deps] of Object.entries(data.dependencies)) {
        if (Array.isArray(deps)) {
          deps.forEach(dep => {
            if (typeof dep === 'string') {
              this.addDependency(fromId, dep);
            } else {
              this.addDependency(fromId, dep.toId, { type: dep.type });
            }
          });
        }
      }
    }
  }

  /**
   * 导出依赖关系为JSON对象
   * @returns {Object}
   */
  export() {
    const depsArray = [];
    for (const [fromId, deps] of this.dependencies) {
      deps.forEach(dep => {
        depsArray.push({
          fromId,
          toId: dep.toId,
          type: dep.type
        });
      });
    }

    return {
      version: '1.0.0',
      dependencies: depsArray
    };
  }

  /**
   * 获取执行顺序（拓扑排序）
   * @returns {Array<{cases: string[], parallel: boolean}>}
   */
  getExecutionOrder() {
    const graph = this.buildExecutionGraph();
    return graph.levels.map(level => ({
      cases: level.nodes,
      parallel: level.nodes.length > 1
    }));
  }

  /**
   * 构建执行图（拓扑排序）
   * @returns {{ levels: Array<{nodes: string[]}> }}
   */
  buildExecutionGraph() {
    // 收集所有用例ID
    const allIds = new Set();
    for (const [fromId, deps] of this.dependencies) {
      allIds.add(fromId);
      deps.forEach(d => allIds.add(d.toId));
    }

    // 计算入度
    const inDegree = new Map();
    const adjList = new Map();

    allIds.forEach(id => {
      inDegree.set(id, 0);
      adjList.set(id, []);
    });

    for (const [fromId, deps] of this.dependencies) {
      for (const dep of deps) {
        // dep.toId -> fromId: toId must run before fromId
        if (adjList.has(dep.toId)) {
          adjList.get(dep.toId).push(fromId);
        }
        if (inDegree.has(fromId)) {
          inDegree.set(fromId, inDegree.get(fromId) + 1);
        }
      }
    }

    // BFS 拓扑排序
    const levels = [];
    const queue = [];

    // 入度为0的节点作为第一层
    for (const [id, degree] of inDegree) {
      if (degree === 0) {
        queue.push(id);
      }
    }

    while (queue.length > 0) {
      levels.push({ nodes: [...queue] });

      const nextQueue = [];
      for (const id of queue) {
        const neighbors = adjList.get(id) || [];
        for (const neighbor of neighbors) {
          inDegree.set(neighbor, inDegree.get(neighbor) - 1);
          if (inDegree.get(neighbor) === 0) {
            nextQueue.push(neighbor);
          }
        }
      }

      queue.length = 0;
      queue.push(...nextQueue);
    }

    // 处理未在依赖图中的孤立节点
    const coveredIds = new Set();
    levels.forEach(level => level.nodes.forEach(id => coveredIds.add(id)));

    const isolatedIds = [...allIds].filter(id => !coveredIds.has(id));
    if (isolatedIds.length > 0) {
      if (levels.length > 0) {
        levels[0].nodes.push(...isolatedIds);
      } else {
        levels.push({ nodes: isolatedIds });
      }
    }

    return { levels };
  }

  /**
   * 获取统计信息
   * @returns {Object}
   */
  getStatistics() {
    const allIds = new Set();
    let totalDeps = 0;

    for (const [fromId, deps] of this.dependencies) {
      allIds.add(fromId);
      deps.forEach(d => {
        allIds.add(d.toId);
        totalDeps++;
      });
    }

    const graph = this.buildExecutionGraph();
    const maxDepth = graph.levels.length;
    const parallelGroups = graph.levels.filter(l => l.nodes.length > 1).length;

    // 孤立节点：没有任何依赖关系
    const connectedIds = new Set();
    for (const [fromId, deps] of this.dependencies) {
      connectedIds.add(fromId);
      deps.forEach(d => connectedIds.add(d.toId));
    }
    const isolatedCases = [...allIds].filter(id => !connectedIds.has(id) || (this.dependencies.get(id)?.length === 0 && ![...this.dependencies.values()].some(deps => deps.some(d => d.toId === id)))).length;

    return {
      totalCases: allIds.size,
      totalDependencies: totalDeps,
      maxDepth,
      parallelGroups,
      isolatedCases
    };
  }
}

module.exports = DependencyManager;
