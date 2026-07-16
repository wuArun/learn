# Java 编码规范参考

## 目录
1. [命名规范](#命名规范)
2. [异常处理](#异常处理)
3. [资源管理](#资源管理)
4. [空安全](#空安全)
5. [集合与泛型](#集合与泛型)
6. [流与Lambda](#流与lambda)
7. [现代 Java 特性](#现代-java-特性)

---

## 命名规范

### 类名
- 使用 PascalCase（大驼峰）
- 名词或名词短语
- 示例：`UserService`、`OrderRepository`

### 方法名
- 使用 camelCase（小驼峰）
- 动词或动词短语
- 示例：`getUserById()`、`processOrder()`

### 常量
- 使用 UPPER_SNAKE_CASE
- 示例：`MAX_RETRY_COUNT`、`DEFAULT_TIMEOUT`

### 字段名
- 使用 camelCase
- 避免单字母名称（除了循环变量）
- 布尔字段使用 is/has/can/should 前缀

---

## 异常处理

### 原则
1. **不要捕获异常而不处理**（尤其不要空 catch 块）
2. **不要捕获 Throwable**（会捕获 Error）
3. **不要捕获过于宽泛的 Exception**
4. **记录异常时提供上下文**

### 最佳实践
```java
// GOOD: 特定异常处理
try {
    processFile(path);
} catch (FileNotFoundException e) {
    log.warn("File not found: {}", path);
} catch (IOException e) {
    log.error("Failed to process file: {}", path, e);
    throw new ProcessingException("File processing failed", e);
}

// GOOD: 使用 try-with-resources
try (InputStream is = new FileInputStream(file)) {
    // process
}
```

---

## 资源管理

### try-with-resources
- Java 7+ 特性，自动关闭资源
- 支持多个资源，用分号分隔
- Java 9+ 支持已存在的有效 final 变量

```java
// 多个资源
try (
    Connection conn = dataSource.getConnection();
    PreparedStatement stmt = conn.prepareStatement(sql);
    ResultSet rs = stmt.executeQuery()
) {
    // use resources
}
```

---

## 空安全

### Optional 使用指南

**创建 Optional**:
```java
Optional.of(value)          // value 不能为 null
Optional.ofNullable(value)  // value 可以为 null
Optional.empty()            // 空 Optional
```

**使用模式**:
```java
// 返回默认值
return optional.orElse(defaultValue);

// 惰性计算默认值
return optional.orElseGet(() -> computeDefault());

// 抛出异常
return optional.orElseThrow(() -> new NotFoundException());

// 条件执行
optional.ifPresent(value -> process(value));
```

### 返回集合
- **永远不要返回 null**，返回空集合
- 使用 `Collections.emptyList()`、`Collections.emptySet()`、`Collections.emptyMap()`
- Java 10+ 使用 `List.of()`、`Set.of()`、`Map.of()`

---

## 集合与泛型

### 泛型最佳实践
- **始终使用泛型**，避免原始类型
- 使用通配符提高灵活性：`List<? extends T>`、`List<? super T>`
- 优先使用菱形运算符 `<>`（Java 7+）

```java
// BAD
List list = new ArrayList();

// GOOD
List<String> list = new ArrayList<>();

// 通配符
void process(List<? extends Number> numbers) { }
```

### 不可变集合
- Java 9+: `List.of()`、`Set.of()`、`Map.of()`
- Java 10+: `List.copyOf()`、`Set.copyOf()`、`Map.copyOf()`
- 防御性拷贝保护内部状态

---

## 流与 Lambda

### 何时使用 Stream
✅ **适合使用**:
- 过滤、映射、归约操作
- 需要从集合生成另一个集合
- 复杂的数据处理管道

❌ **避免使用**:
- 简单遍历（使用 for-each）
- 需要中断/返回的情况
- 性能敏感的代码（考虑并行流的开销）

### 反模式避免
```java
// BAD: 副作用
List<String> result = new ArrayList<>();
list.stream().forEach(result::add);

// GOOD: 收集器
List<String> result = list.stream()
    .collect(Collectors.toList());

// BETTER: Java 16+
List<String> result = list.stream().toList();
```

---

## 现代 Java 特性

### Record（Java 16+）
适用于数据传输对象（DTO）：
```java
public record UserDto(String name, int age) {}
// 自动生成：构造函数、getter、equals、hashCode、toString
```

### Switch 表达式（Java 14+）
```java
String status = switch (code) {
    case 200 -> "OK";
    case 404 -> "Not Found";
    default -> "Unknown";
};
```

### 模式匹配 instanceof（Java 16+）
```java
if (obj instanceof User user) {
    // user 自动可用
    System.out.println(user.getName());
}
```

### 文本块（Java 15+）
```java
String json = """
    {
        "name": "John",
        "age": 30
    }
    """;
```

---

## MQ 消息监听规范

### 基本原则
1. **必须捕获异常**: 所有 MQ 监听器方法必须包含 try-catch 块
2. **区分业务异常和系统异常**: 业务异常发送到 DLQ，系统异常抛出重试
3. **设置 Consumer Group**: 防止消息被重复消费
4. **避免阻塞操作**: 使用异步处理避免阻塞消费者线程
5. **记录日志**: 记录消息接收、处理成功/失败日志

### 禁止的模式
- ❌ 空 catch 块
- ❌ 没有 consumer group ID
- ❌ 同步调用外部 HTTP 服务
- ❌ 在监听器中执行数据库事务（太长）
- ❌ 忽略消息确认（ack）

### 推荐模式
- ✅ 所有异常都被捕获
- ✅ 业务异常发送到 DLQ（死信队列）
- ✅ 异步处理长时间任务
- ✅ 使用 CompletableFuture 或 ExecutorService
- ✅ 设置合理的重试策略

---

## Redis Key 命名规范

### 命名格式
```
{service-prefix}:{domain}:{identifier}
```

### 示例
```
user-service:user:123
order-service:order:456
inventory-service:stock:sku-789
```

### 规则
1. **必须设置前缀**: 防止服务间 Key 冲突
2. **使用冒号分隔**: 便于管理和可视化工具分组
3. **必须设置 TTL**: 防止内存泄漏
4. **禁止敏感信息**: 不要在 Key 中包含手机号、身份证号等
5. **集中管理**: 使用常量类管理所有 Key 模板

### 禁止的模式
- ❌ 没有服务前缀: `user:123`
- ❌ 永不过期: 不设置 TTL
- ❌ 敏感数据在 Key: `user:13800138000`
- ❌ 硬编码 Key: `"user:" + id`
- ❌ 包含空格或特殊字符

---

## 单元测试规范

### 测试命名
```
should[ExpectedBehavior]_When[Condition]
```

示例：
- `shouldReturnUser_WhenUserExists`
- `shouldThrowNotFoundException_WhenUserDoesNotExist`
- `shouldRejectInvalidEmail_WhenFormatIsWrong`

### 测试结构 (AAA)
```java
@Test
void shouldDoSomething_WhenCondition() {
    // Arrange (Given)
    when(repository.findById(1L)).thenReturn(Optional.of(user));
    
    // Act (When)
    User result = service.getUser(1L);
    
    // Assert (Then)
    assertThat(result).isNotNull();
    verify(repository).findById(1L);
}
```

### 禁止的模式
- ❌ 没有断言的测试
- ❌ 一个测试验证多个功能
- ❌ 使用 Thread.sleep
- ❌ 依赖真实数据库/外部服务（单元测试）
- ❌ 测试之间相互依赖

### 推荐模式
- ✅ 每个测试一个断言主题
- ✅ 使用 @BeforeEach 初始化
- ✅ 使用 Mockito 模拟依赖
- ✅ 使用 AssertJ 进行断言
- ✅ 使用 @ParameterizedTest 测试边界值
- ✅ 使用 @Timeout 防止测试挂起

---

## 参考链接
- [Oracle Java Code Conventions](https://www.oracle.com/java/technologies/javase/codeconventions-contents.html)
- [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- [Effective Java (Joshua Bloch)](https://www.oreilly.com/library/view/effective-java-3rd/9780134686097/)
- [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/)
- [AssertJ Documentation](https://assertj.github.io/doc/)
- [Mockito Documentation](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html)