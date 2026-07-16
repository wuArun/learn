# Java Coding Standards - Response Templates

This file contains response templates for the java-coding-standards-checker skill.

## Standard Inspection Report Template

```markdown
## Java 基础规范检查报告

**项目名称**: [project_name]
**Java 版本**: [java_version]
**构建工具**: [build_tool]
**检查时间**: [timestamp]

---

### 问题统计

| 严重级别 | 数量 |
|:---------|:----:|
| CRITICAL | [count] |
| HIGH | [count] |
| MEDIUM | [count] |
| LOW | [count] |
| **总计** | **[total]** |

---

### 异常处理

#### CRITICAL
| 文件 | 行号 | 问题描述 | 修复建议 |
|:-----|:----:|:---------|:---------|
| [file.java] | [line] | [description] | [suggestion] |

#### HIGH
| 文件 | 行号 | 问题描述 | 修复建议 |
|:-----|:----:|:---------|:---------|
| [file.java] | [line] | [description] | [suggestion] |

### 资源管理
| 文件 | 行号 | 问题描述 | 修复建议 |
|:-----|:----:|:---------|:---------|
| [file.java] | [line] | [description] | [suggestion] |

### 空安全
| 文件 | 行号 | 问题描述 | 修复建议 |
|:-----|:----:|:---------|:---------|
| [file.java] | [line] | [description] | [suggestion] |

### 注解规范
| 文件 | 行号 | 问题描述 | 修复建议 |
|:-----|:----:|:---------|:---------|
| [file.java] | [line] | [description] | [suggestion] |

### 代码质量
| 文件 | 行号 | 问题描述 | 修复建议 |
|:-----|:----:|:---------|:---------|
| [file.java] | [line] | [description] | [suggestion] |

### MQ 监听器规范
| 文件 | 行号 | 问题描述 | 修复建议 |
|:-----|:----:|:---------|:---------|
| [file.java] | [line] | [description] | [suggestion] |

### Redis Key 规范
| 文件 | 行号 | 问题描述 | 修复建议 |
|:-----|:----:|:---------|:---------|
| [file.java] | [line] | [description] | [suggestion] |

### 单元测试规范
| 文件 | 行号 | 问题描述 | 修复建议 |
|:-----|:----:|:---------|:---------|
| [file.java] | [line] | [description] | [suggestion] |

### 现代 Java 特性应用
- [ ] 使用模式匹配 instanceof（Java 16+）
- [ ] 将 DTO 转换为 record
- [ ] 使用 switch 表达式
- [ ] 使用文本块处理多行字符串

---

### 修复建议优先级

1. **立即修复**（CRITICAL）
   - [ ] 替换空 catch 块为适当的异常处理
   - [ ] 将可变静态字段改为不可变

2. **建议修复**（HIGH）
   - [ ] 使用 try-with-resources 处理所有 IO 操作
   - [ ] 返回空集合而非 null
   - [ ] 为集合添加泛型类型参数

3. **优化建议**（MEDIUM/LOW）
   - [ ] 在循环中使用 StringBuilder 替代字符串拼接
   - [ ] 使用 Collectors 替代 forEach 副作用
   - [ ] 为覆盖方法添加 @Override 注解
   - [ ] 使用卫语句（Guard Clause）替代深层嵌套
   - [ ] 使用 Optional 链替代连续 null 检查

---

### 正面模式（值得保持）
- ✓ Optional 用于可空返回值
- ✓ Stream 用于集合处理
- ✓ 记录类（record）的使用
- ✓ Switch 表达式的应用
```