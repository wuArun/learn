# Java Coding Standards - Code Examples

This file contains all code examples referenced by the java-coding-standards-checker skill.

## Table of Contents

1. [Exception Handling](#1-exception-handling)
2. [Mutable Static Fields](#2-mutable-static-fields)
3. [Raw Types (No Generics)](#3-raw-types-no-generics)
4. [Resource Management](#4-resource-management)
5. [Collection Null Returns](#5-collection-null-returns)
6. [String Concatenation in Loops](#6-string-concatenation-in-loops)
7. [Stream Anti-patterns](#7-stream-anti-patterns)
8. [MQ Listener Patterns](#8-mq-listener-patterns)
9. [Redis Key Naming](#9-redis-key-naming)
10. [Missing @Override](#10-missing-override)
11. [Modern Java Features (17+)](#11-modern-java-features-17)
12. [Unit Testing Best Practices](#12-unit-testing-best-practices)
13. [Null Safety Annotations](#13-null-safety-annotations)
14. [Bean Validation Annotations](#14-bean-validation-annotations)
15. [Structured Logging](#15-structured-logging)
16. [Magic Numbers](#16-magic-numbers)
17. [Long Parameter Lists](#17-long-parameter-lists)
18. [Deep Nesting & Guard Clause](#18-deep-nesting--guard-clause)
19. [Member Ordering](#19-member-ordering)
20. [Transaction Management](#20-transaction-management)
21. [SQL & MyBatis](#21-sql--mybatis)
22. [Sensitive Data Exposure](#22-sensitive-data-exposure)
23. [Thread Safety & Concurrency](#23-thread-safety--concurrency)
24. [Date & Time Handling](#24-date--time-handling)
25. [API Design (RESTful)](#25-api-design-restful)
26. [Cross-Service Call Patterns](#26-cross-service-call-patterns)
27. [Enum vs Magic Strings](#27-enum-vs-magic-strings)
28. [Serialization Best Practices](#28-serialization-best-practices)
29. [BigDecimal Construction](#29-bigdecimal-construction)
30. [Logging Desensitization](#30-logging-desensitization)
31. [Regex Catastrophic Backtracking](#31-regex-catastrophic-backtracking)
32. [Internationalization (i18n)](#32-internationalization-i18n)
33. [Assertions in Production](#33-assertions-in-production)

---

## 1. Exception Handling

### Empty Catch Block (CRITICAL)

```java
// BAD: Empty catch block
try {
    parseFile(path);
} catch (IOException e) {
    // Silent failure - CRITICAL
}

// GOOD: Specific exception handling
try {
    parseFile(path);
} catch (FileNotFoundException e) {
    log.warn("File not found: {}", path);
    return Optional.empty();
} catch (IOException e) {
    log.error("Failed to read file: {}", path, e);
    throw new ProcessingException("File read error", e);
}
```

### Catching Too Broad Exception (HIGH)

```java
// BAD: Catch all Exception
try {
    process();
} catch (Exception e) {
    log.error("Error", e);  // Too broad
}

// GOOD: Specific exceptions
try {
    compute();
} catch (Exception e) {
    log.error("Processing failed", e);
    throw new ServiceException(e);
}
```

### Catching Throwable (CRITICAL)

```java
// BAD: Catching Throwable
try {
    compute();
} catch (Throwable t) {  // Catches OutOfMemoryError, StackOverflowError
    log.error("Error", t);
}

// GOOD: Catch Exception, let Errors propagate
try {
    compute();
} catch (Exception e) {
    log.error("Processing failed", e);
    throw new ServiceException(e);
}
```

---

## 2. Mutable Static Fields

### Mutable Static Fields (CRITICAL)

```java
// BAD: Mutable static field
public class Config {
    public static String apiUrl;  // CRITICAL: Thread-unsafe
    public static List<String> allowedHosts = new ArrayList<>();  // CRITICAL
}

// GOOD: Immutable static
public class Config {
    public static final String API_URL = "https://api.example.com";
    public static final List<String> ALLOWED_HOSTS = List.of("a.com", "b.com");
}

// BAD: Static DateFormat (not thread-safe)
public class DateUtils {
    private static final SimpleDateFormat FORMAT = new SimpleDateFormat("yyyy-MM-dd");
}

// GOOD: ThreadLocal or DateTimeFormatter
public class DateUtils {
    private static final DateTimeFormatter FORMAT =
        DateTimeFormatter.ofPattern("yyyy-MM-dd");
}
```

---

## 3. Raw Types (No Generics)

### Raw Types (MEDIUM)

```java
// BAD: Raw types
List users = new ArrayList();
users.add("string");  // No compile error, runtime issue
User user = (User) users.get(0);  // ClassCastException

// GOOD: Generics
List<User> users = new ArrayList<>();
users.add(new User("John"));  // Type-safe
User user = users.get(0);  // No cast needed

// BAD: Raw Map
Map config = new HashMap();
config.put("key", 123);
String value = (String) config.get("key");  // ClassCastException

// GOOD: Typed Map
Map<String, Object> config = new HashMap<>();
// Or better:
Map<String, String> stringConfig = new HashMap<>();
```

---

## 4. Resource Management

### try-with-resources (HIGH/CRITICAL)

```java
// BAD: Manual resource management
InputStream is = null;
try {
    is = new FileInputStream(file);
    process(is);
} finally {
    is.close();  // NPE if exception in constructor
}

// GOOD: try-with-resources
try (InputStream is = new FileInputStream(file)) {
    process(is);
}  // Auto-closed, even on exception

// GOOD: Multiple resources
try (
    Connection conn = dataSource.getConnection();
    PreparedStatement stmt = conn.prepareStatement(sql);
    ResultSet rs = stmt.executeQuery()
) {
    while (rs.next()) {
        process(rs);
    }
}

// Java 9+: Effectively final variables
InputStream is = new FileInputStream(file);
try (is) {  // Can use existing variable
    process(is);
}
```

### Resource Leak: close() in Wrong Position (CRITICAL)

```java
// BAD: close() after try-catch (leak on exception)
FileInputStream fis = null;
try {
    fis = new FileInputStream(file);
} catch (IOException e) {
    log.error("Error", e);
}
fis.close();  // CRITICAL: if exception in try, fis may be null

// GOOD: try-with-resources
try (FileInputStream fis = new FileInputStream(file)) {
    // use fis
} catch (IOException e) {
    log.error("Error", e);
}
```

### Apache POI Resource Leak (HIGH)

```java
// BAD: POI resource leak
XWPFDocument doc = new XWPFDocument(inputStream);
// process doc but never close - HIGH

// GOOD: try-with-resources for POI
try (XWPFDocument doc = new XWPFDocument(inputStream)) {
    // process doc
}
```

### JDBC Resource Leak (CRITICAL)

```java
// BAD: JDBC resource leak
Connection conn = dataSource.getConnection();
Statement stmt = conn.createStatement();
ResultSet rs = stmt.executeQuery(sql);
// No close() anywhere - CRITICAL

// GOOD: try-with-resources for JDBC
try (
    Connection conn = dataSource.getConnection();
    PreparedStatement stmt = conn.prepareStatement(sql);
    ResultSet rs = stmt.executeQuery()
) {
    while (rs.next()) { process(rs); }
}
```

### Temporary File Cleanup (MEDIUM)

```java
// BAD: Temporary file not deleted
File tempFile = File.createTempFile("prefix", ".tmp");
// use tempFile but never delete - MEDIUM

// GOOD: deleteOnExit or manual cleanup
File tempFile = File.createTempFile("prefix", ".tmp");
tempFile.deleteOnExit();
// or delete after use
if (tempFile.exists()) { tempFile.delete(); }
```

### ThreadLocal Cleanup (HIGH)

```java
// BAD: ThreadLocal without remove in thread pool
private static ThreadLocal<Context> contextHolder = new ThreadLocal<>();
// ... set value but never remove in finally block - HIGH

// GOOD: Always remove in finally
try {
    contextHolder.set(ctx);
    // process
} finally {
    contextHolder.remove();
}
```

---

## 5. Collection Null Returns

### Return null for Empty (HIGH)

```java
// BAD: Return null for empty
public List<User> findUsers(String query) {
    List<User> results = repository.search(query);
    if (results.isEmpty()) {
        return null;  // Client must null-check
    }
    return results;
}

// GOOD: Return empty collection
public List<User> findUsers(String query) {
    List<User> results = repository.search(query);
    return results != null ? results : Collections.emptyList();
}

// BETTER: Use Optional for single values
public Optional<User> findUser(String id) {
    return Optional.ofNullable(repository.findById(id));
}

// BAD: No defensive copy
public List<String> getItems() {
    return items;  // Caller can modify
}

// GOOD: Defensive copy or unmodifiable
public List<String> getItems() {
    return List.copyOf(items);  // Java 10+
    // or: return Collections.unmodifiableList(items);
}
```

---

## 6. String Concatenation in Loops

### String Concatenation in Loop (MEDIUM)

```java
// BAD: String concatenation in loop
String result = "";
for (String item : items) {
    result += item + ",";  // Creates new String each iteration
}

// GOOD: StringBuilder
StringBuilder sb = new StringBuilder();
for (String item : items) {
    sb.append(item).append(",");
}
String result = sb.toString();

// BETTER: String.join (Java 8+)
String result = String.join(",", items);

// BEST: Collectors.joining (streams)
String result = items.stream()
    .collect(Collectors.joining(","));
```

---

## 7. Stream Anti-patterns

### forEach with Side Effects (MEDIUM)

```java
// BAD: forEach with mutation
List<User> activeUsers = new ArrayList<>();
users.stream()
    .filter(User::isActive)
    .forEach(activeUsers::add);  // Side effect

// GOOD: Collect
List<User> activeUsers = users.stream()
    .filter(User::isActive)
    .collect(Collectors.toList());

// Java 16+: toList()
List<User> activeUsers = users.stream()
    .filter(User::isActive)
    .toList();
```

### Unnecessary Parallel Stream (LOW)

```java
// BAD: Unnecessary parallel
users.parallelStream()  // Only 10 users
    .map(User::getName)
    .collect(Collectors.toList());

// GOOD: Sequential for small collections
users.stream()
    .map(User::getName)
    .collect(Collectors.toList());
```

---

## 8. MQ Listener Patterns

### Missing try-catch in MQ Listener (CRITICAL)

```java
// BAD: No try-catch in MQ listener
@Service
public class OrderListener {
    @StreamListener("order-topic")
    public void handleOrder(OrderMessage message) {
        // CRITICAL: No exception handling - crashes consumer
        processOrder(message);
        orderService.save(message);
    }
}

// GOOD: Proper exception handling with DLQ
@Service
public class OrderListener {
    private static final Logger log = LoggerFactory.getLogger(OrderListener.class);

    @StreamListener("order-topic")
    public void handleOrder(OrderMessage message) {
        try {
            log.info("Received order: {}", message.getOrderId());
            processOrder(message);
            orderService.save(message);
        } catch (BusinessException e) {
            log.error("Business error processing order: {}", message.getOrderId(), e);
            dlqSender.send(message, e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error processing order: {}", message.getOrderId(), e);
            throw e; // Let container handle retry
        }
    }
}
```

### Missing Group ID (CRITICAL)

```java
// BAD: Missing group ID (Kafka)
@KafkaListener(topics = "order-topic")
public void consume(OrderMessage message) {
    // HIGH: All instances will consume same message
}

// GOOD: With consumer group
@KafkaListener(topics = "order-topic", groupId = "order-service-group")
public void consume(OrderMessage message) {
    // Only one instance processes message
}
```

### Blocking Operation in Listener (HIGH)

```java
// BAD: Long-running blocking operation
@StreamListener("order-topic")
public void handle(OrderMessage msg) {
    httpClient.callExternalService(msg); // Blocks consumer thread
}

// GOOD: Async processing
@StreamListener("order-topic")
public void handle(OrderMessage msg) {
    CompletableFuture.runAsync(() -> {
        processAsync(msg);
    });
}
```

---

## 9. Redis Key Naming

### Missing Prefix (HIGH)

```java
// BAD: No prefix
redisTemplate.opsForValue().set("user:123", user); // HIGH: Collision risk

// GOOD: Service-scoped prefix with TTL
@Component
public class UserCache {
    private static final String PREFIX = "user-service";
    private static final long TTL_HOURS = 24;

    public void cacheUser(Long userId, User user) {
        String key = String.format("%s:user:%d", PREFIX, userId);
        redisTemplate.opsForValue().set(key, user, TTL_HOURS, TimeUnit.HOURS);
    }
}
```

### Missing TTL (CRITICAL)

```java
// BAD: No TTL - memory leak
redisTemplate.opsForValue().set("temp:data", data);

// GOOD: Always set expiration
redisTemplate.opsForValue().set(
    "temp:data",
    data,
    30,  // CRITICAL: Set TTL
    TimeUnit.MINUTES
);
```

### Sensitive Data in Key (CRITICAL)

```java
// BAD: Sensitive data in key name
redisTemplate.opsForValue().set("user:" + phoneNumber, user); // CRITICAL

// GOOD: Use ID only, encrypt sensitive data
redisTemplate.opsForValue().set("user:" + userId, encryptedUser);
```

### Centralized Key Management (MEDIUM)

```java
// GOOD: Centralized key management
@Component
public class CacheKeys {
    public static final String USER_PREFIX = "user-service:user";
    public static final String ORDER_PREFIX = "user-service:order";

    public static String userKey(Long userId) {
        return String.format("%s:%d", USER_PREFIX, userId);
    }
}
```

---

## 10. Missing @Override

### Missing @Override (LOW)

```java
// BAD: Missing @Override
public class User {
    public boolean equals(Object obj) {  // Typo not caught
        // ...
    }
}

// GOOD: With @Override
public class User {
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        User user = (User) obj;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
```

---

## 11. Modern Java Features (17+)

### Pattern Matching instanceof (Java 16+)

```java
// OLD: instanceof + cast
if (obj instanceof User) {
    User user = (User) obj;
    process(user.getName());
}

// NEW: Pattern matching (Java 16+)
if (obj instanceof User user) {
    process(user.getName());
}
```

### Switch Expression (Java 14+)

```java
// OLD: Switch statement
String status;
switch (code) {
    case 200:
        status = "OK";
        break;
    case 404:
        status = "Not Found";
        break;
    default:
        status = "Unknown";
}

// NEW: Switch expression (Java 14+)
String status = switch (code) {
    case 200 -> "OK";
    case 404 -> "Not Found";
    default -> "Unknown";
};
```

### Records (Java 16+)

```java
// OLD: Verbose DTO
public class UserDto {
    private final String name;
    private final int age;
    // constructor, getters, equals, hashCode, toString
}

// NEW: Record (Java 16+)
public record UserDto(String name, int age) {}
```

### Text Blocks (Java 15+)

```java
// Text blocks (Java 15+)
String json = """
    {
        "name": "John",
        "age": 30
    }
    """;
```

---

## 12. Unit Testing Best Practices

### Missing Assertions (CRITICAL)

```java
// BAD: Missing assertion
@Test
public void testUser() {
    userService.getUser(1L); // CRITICAL: No assertion
}

// GOOD: Proper assertion
@Test
public void shouldReturnUser_WhenUserExists() {
    Optional<User> result = userService.getUser(1L);

    assertThat(result).isPresent();
    assertThat(result.get().getId()).isEqualTo(1L);
}
```

### Testing Multiple Concerns (MEDIUM)

```java
// BAD: Testing multiple things
@Test
public void testEverything() { // MEDIUM: Too broad
    userService.createUser(user);
    userService.updateUser(user);
    userService.deleteUser(1L);
    assertThat(true).isTrue();
}

// GOOD: One concern per test
@Test
public void shouldCreateUser_WhenValidData() {
    UserDto result = userService.createUser(validUserDto);

    assertThat(result.getId()).isNotNull();
    verify(userRepository).save(any(User.class));
}
```

### Using Real Dependencies (MEDIUM)

```java
// BAD: Using real database
@Test
public void testWithRealDb() {
    userService.save(user); // SLOW: Hits real database
}

// GOOD: Using mocks
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void shouldReturnUser_WhenUserExists() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        Optional<User> result = userService.getUser(1L);

        assertThat(result).isPresent();
        verify(userRepository).findById(1L);
    }
}
```

### Thread.sleep in Tests (HIGH)

```java
// BAD: Thread.sleep in tests
@Test
public void testAsyncOperation() throws InterruptedException {
    asyncService.process();
    Thread.sleep(1000); // HIGH: Flaky, slow
    assertThat(asyncService.isComplete()).isTrue();
}

// GOOD: Use CompletableFuture or Awaitility
@Test
public void testAsyncOperation() {
    CompletableFuture<Void> future = asyncService.process();

    await()
        .atMost(Duration.ofSeconds(5))
        .untilAsserted(() -> {
            assertThat(asyncService.isComplete()).isTrue();
        });
}
```

### Test Naming Convention

```java
// GOOD: Test naming convention - should[Expected]_When[Condition]
@Test
void shouldThrowNotFoundException_WhenUserDoesNotExist() {
    when(userRepository.findById(any())).thenReturn(Optional.empty());

    assertThatThrownBy(() -> userService.getUser(999L))
        .isInstanceOf(NotFoundException.class)
        .hasMessageContaining("User not found");
}
```

### Parameterized Tests

```java
// GOOD: Parameterized tests for boundaries
@ParameterizedTest
@ValueSource(strings = {"", "a", "ab"}) // Too short
void shouldRejectPassword_WhenTooShort(String password) {
    assertThat(validator.isValid(password)).isFalse();
}

@ParameterizedTest
@ValueSource(strings = {"strongpass123", "ValidPass!@#"})
void shouldAcceptPassword_WhenValid(String password) {
    assertThat(validator.isValid(password)).isTrue();
}
```

---

## 13. Null Safety Annotations

### Missing @Nullable/@NonNull (MEDIUM)

```java
// BAD: Unclear nullability
public class UserService {
    public User findUser(String id) {  // Can return null?
        return repository.findById(id).orElse(null);
    }

    public void process(User user) {  // Accepts null?
        // ...
    }
}

// GOOD: Clear null annotations
public class UserService {
    @Nullable
    public User findUser(@NonNull String id) {
        return repository.findById(id).orElse(null);
    }

    public void process(@NonNull User user) {
        // null-safe processing
    }
}
```

---

## 14. Bean Validation Annotations

### Missing @Valid (HIGH)

```java
// BAD: No validation annotations
@PostMapping("/users")
public ResponseEntity<UserDto> createUser(
    @RequestBody UserDto userDto) {  // HIGH: No validation
    return ResponseEntity.ok(service.create(userDto));
}

// GOOD: Proper validation annotations
@PostMapping("/users")
public ResponseEntity<UserDto> createUser(
    @Valid @RequestBody @NotNull UserDto userDto) {
    return ResponseEntity.ok(service.create(userDto));
}

// DTO with validation
public record UserDto(
    @NotBlank @Size(max = 100) String name,
    @NotBlank @Email String email,
    @NotNull @Min(0) Integer age,
    @Size(max = 10) List<String> tags
) {}
```

---

## 15. Structured Logging

### String Concatenation in Log (LOW)

```java
// BAD: String concatenation
log.info("Processing order for user: " + userId + " with amount: " + amount);

// BAD: Missing context
log.error("Failed");  // What failed?

// GOOD: Structured logging with placeholders
log.info("process_order userId={} amount={}", userId, amount);
log.error("process_order_failed userId={} error={}", userId, e.getMessage(), e);

// GOOD: Consistent key=value format
log.info("fetch_market slug={}", slug);
log.error("failed_fetch_market slug={} error_type={}", slug, e.getClass().getSimpleName(), e);
```

---

## 16. Magic Numbers

### Hardcoded Numbers (MEDIUM)

```java
// BAD: Magic numbers
public class OrderService {
    public boolean isValid(Order order) {
        return order.getItems().size() <= 100  // What is 100?
            && order.getAmount().compareTo(new BigDecimal("9999.99")) <= 0;
    }

    public void process() {
        Thread.sleep(3000);  // Why 3 seconds?
    }
}

// GOOD: Named constants
public class OrderService {
    private static final int MAX_ITEMS_PER_ORDER = 100;
    private static final BigDecimal MAX_ORDER_AMOUNT = new BigDecimal("9999.99");
    private static final int PROCESSING_TIMEOUT_MS = 3000;

    public boolean isValid(Order order) {
        return order.getItems().size() <= MAX_ITEMS_PER_ORDER
            && order.getAmount().compareTo(MAX_ORDER_AMOUNT) <= 0;
    }

    public void process() throws InterruptedException {
        Thread.sleep(PROCESSING_TIMEOUT_MS);
    }
}
```

---

## 17. Long Parameter Lists

### Too Many Parameters (MEDIUM)

```java
// BAD: Too many parameters
public void createOrder(
    String customerId,
    String productId,
    int quantity,
    BigDecimal price,
    String shippingAddress,
    String billingAddress,
    boolean expressShipping
) { }

// GOOD: Use DTO/Builder
public void createOrder(@NotNull CreateOrderRequest request) { }

public record CreateOrderRequest(
    String customerId,
    String productId,
    int quantity,
    BigDecimal price,
    Address shippingAddress,
    Address billingAddress,
    ShippingType shippingType  // Enum instead of boolean
) {}
```

### Boolean Parameters (HIGH)

```java
// BAD: Boolean parameter (unclear at call site)
processOrder(orderId, true);  // What does true mean?

// GOOD: Enum or separate methods
processOrder(orderId, ProcessingMode.EXPRESS);
// or
processOrderExpress(orderId);
```

---

## 18. Deep Nesting & Guard Clause

### Deep Nesting (Arrow Code) (MEDIUM)

```java
// BAD: Deep nesting (arrow code)
public void processOrders(List<Order> orders) {
    for (Order order : orders) {
        if (order.isActive()) {
            if (order.hasItems()) {
                if (order.isPaid()) {
                    process(order);
                } else {
                    log.warn("Unpaid order: {}", order.getId());
                }
            }
        }
    }
}

// GOOD: Early returns (guard clauses)
public void processOrders(List<Order> orders) {
    for (Order order : orders) {
        if (!order.isActive()) continue;
        if (!order.hasItems()) continue;
        if (!order.isPaid()) {
            log.warn("Unpaid order: {}", order.getId());
            continue;
        }
        process(order);
    }
}

// BETTER: Stream with filter
public void processOrders(List<Order> orders) {
    orders.stream()
        .filter(Order::isActive)
        .filter(Order::hasItems)
        .filter(Order::isPaid)
        .forEach(this::process);
}
```

### Guard Clause for Validation (MEDIUM)

```java
// BAD: Nested validation without guard clauses
public void createUser(UserDto dto) {
    if (dto != null) {
        if (StringUtils.isNotBlank(dto.getName())) {
            if (dto.getAge() != null) {
                if (dto.getAge() >= 18) {
                    if (StringUtils.isNotBlank(dto.getEmail())) {
                        userService.create(dto);
                    } else {
                        throw new ValidationException("Email is required");
                    }
                } else {
                    throw new ValidationException("User must be adult");
                }
            } else {
                throw new ValidationException("Age is required");
            }
        } else {
            throw new ValidationException("Name is required");
        }
    } else {
        throw new ValidationException("User data is required");
    }
}

// GOOD: Guard clauses for validation
public void createUser(UserDto dto) {
    if (dto == null) {
        throw new ValidationException("User data is required");
    }
    if (StringUtils.isBlank(dto.getName())) {
        throw new ValidationException("Name is required");
    }
    if (dto.getAge() == null) {
        throw new ValidationException("Age is required");
    }
    if (dto.getAge() < 18) {
        throw new ValidationException("User must be adult");
    }
    if (StringUtils.isBlank(dto.getEmail())) {
        throw new ValidationException("Email is required");
    }
    // Main logic at top level, no nesting
    userService.create(dto);
}
```

### Guard Clause for Business Logic (MEDIUM)

```java
// BAD: Business logic without guard clauses
public BigDecimal calculateDiscount(Order order) {
    BigDecimal discount = BigDecimal.ZERO;
    if (order != null) {
        if (order.getCustomer() != null) {
            if (order.getOrderDate() != null) {
                if (order.getCustomer().isVIP()) {
                    if (order.getItems().size() > 0) {
                        discount = calculateVIPDiscount(order);
                    }
                } else {
                    if (order.getItems().size() > 0) {
                        discount = calculateRegularDiscount(order);
                    }
                }
            }
        }
    }
    return discount;
}

// GOOD: Guard clauses for business logic
public BigDecimal calculateDiscount(Order order) {
    if (order == null) return BigDecimal.ZERO;
    if (order.getCustomer() == null) return BigDecimal.ZERO;
    if (order.getOrderDate() == null) return BigDecimal.ZERO;
    if (order.getItems().isEmpty()) return BigDecimal.ZERO;

    if (order.getCustomer().isVIP()) {
        return calculateVIPDiscount(order);
    } else {
        return calculateRegularDiscount(order);
    }
}
```

### Optional Chain vs Guard Clauses

```java
// BAD: Optional chain without guard
public String getUserCity(User user) {
    if (user != null) {
        Customer customer = user.getCustomer();
        if (customer != null) {
            Address address = customer.getAddress();
            if (address != null) {
                City city = address.getCity();
                if (city != null) {
                    return city.getName();
                }
            }
        }
    }
    return "Unknown";
}

// GOOD: Guard clauses
public String getUserCity(User user) {
    if (user == null) return "Unknown";
    Customer customer = user.getCustomer();
    if (customer == null) return "Unknown";
    Address address = customer.getAddress();
    if (address == null) return "Unknown";
    City city = address.getCity();
    if (city == null) return "Unknown";
    return city.getName();
}

// BETTER: Optional API (Java 8+)
public String getUserCity(User user) {
    return Optional.ofNullable(user)
        .map(User::getCustomer)
        .map(Customer::getAddress)
        .map(Address::getCity)
        .map(City::getName)
        .orElse("Unknown");
}
```

### Loop with Guard Clause

```java
// BAD: Loop without guard clause
public void processOrders(List<Order> orders) {
    if (orders != null) {
        if (!orders.isEmpty()) {
            for (Order order : orders) {
                if (order.isActive()) {
                    if (order.hasItems()) {
                        process(order);
                    }
                }
            }
        }
    }
}

// GOOD: Guard clause for empty collection
public void processOrders(List<Order> orders) {
    if (orders == null || orders.isEmpty()) {
        return;  // Early exit
    }
    for (Order order : orders) {
        if (!order.isActive()) continue;
        if (!order.hasItems()) continue;
        process(order);
    }
}
```

---

## 19. Member Ordering

### Random Member Order (LOW)

```java
// BAD: Random ordering
public class BadOrder {
    public void process() { }
    private String id;
    public static final int MAX_SIZE = 100;
    private List<Item> items;
    public BadOrder(String id) { }
    private static Logger log = LoggerFactory.getLogger(BadOrder.class);
}

// GOOD: Conventional ordering
public class GoodOrder {
    // 1. Constants
    public static final int MAX_SIZE = 100;
    private static final Logger log = LoggerFactory.getLogger(GoodOrder.class);

    // 2. Static fields
    private static int instanceCount = 0;

    // 3. Instance fields
    private final String id;
    private List<Item> items;

    // 4. Constructors
    public GoodOrder(String id) {
        this.id = id;
        this.items = new ArrayList<>();
        instanceCount++;
    }

    // 5. Public methods
    public void process() {
        validate();
        execute();
    }

    // 6. Protected methods
    protected void validate() { }

    // 7. Private methods
    private void execute() { }
}
```

---

## 20. Transaction Management

### Private @Transactional (CRITICAL)

```java
// BAD: Private method with @Transactional - never applied
@Transactional
private void updateUser(User user) {  // CRITICAL - never works
    userRepository.save(user);
}
```

### Missing rollbackFor (HIGH)

```java
// BAD: No rollbackFor = Exception.class - only RuntimeExceptions roll back
@Transactional
public void processOrder(Order order) throws BusinessException {
    orderRepository.save(order);
    if (order.isInvalid()) {
        throw new BusinessException("Invalid");  // WON'T rollback! Checked exception
    }
}

// GOOD: Always specify rollbackFor = Exception.class
@Transactional(rollbackFor = Exception.class)
public void processOrder(Order order) throws BusinessException {
    orderRepository.save(order);
    if (order.isInvalid()) {
        throw new BusinessException("Invalid");  // Rolls back correctly
    }
}
```

### readOnly Optimization

```java
// GOOD: For read-only operations, set readOnly = true
@Transactional(readOnly = true)
public Order getOrder(Long id) {
    return orderMapper.selectById(id);
}
```

### Long Transaction - IO in Transaction

```java
// BAD: IO operation inside transaction
@Transactional(rollbackFor = Exception.class)
public Boolean saveReport(ReportDTO dto) {
    Long reportId = reportDomainService.save(dto);           // DB
    parseFile(dto.getTemplateId(), reportId, dto.getFileId()); // IO in TX!
    return reportId > 0;
}

// GOOD: IO moved outside transaction
public Boolean saveReport(ReportDTO dto) {
    Long reportId = reportDomainService.save(dto);           // TX: pure DB
    // IO outside transaction
    parseFile(dto.getTemplateId(), reportId, dto.getFileId());
    return reportId > 0;
}
```

### Long Transaction - Batch Processing

```java
// BAD: Batch processing in single transaction
@Transactional(rollbackFor = Exception.class)
public void batchProcess(List<Data> list) {
    for (Data data : list) {
        process(data);  // All in one transaction
    }
}

// GOOD: TransactionTemplate for batch
@Autowired
private TransactionTemplate transactionTemplate;

private static final int BATCH_SIZE = 500;

public void batchProcess(List<Data> list) {
    if (CollectionUtils.isEmpty(list)) return;

    List<List<Data>> partitions = Lists.partition(list, BATCH_SIZE);
    for (List<Data> batch : partitions) {
        try {
            transactionTemplate.executeWithoutResult(status -> {
                for (Data data : batch) {
                    process(data);
                }
            });
        } catch (Exception e) {
            log.error("Batch failed, skip to next, batchSize={}, err={}",
                      batch.size(), e.getMessage(), e);
            failedRecords.addAll(batch);
        }
    }
}
```

### Long Transaction - External RPC

```java
// BAD: External API call inside transaction
@Transactional(rollbackFor = Exception.class)
public void syncMaterial(Long materialId) {
    Material material = materialMapper.selectById(materialId);   // DB
    srmClient.sync(material);                                     // External API
    material.setSynced(true);
    materialMapper.updateById(material);                          // DB
}

// GOOD: External API call outside transaction
public void syncMaterial(Long materialId) {
    Material material = materialMapper.selectById(materialId);
    material.setSynced(true);
    materialDomainService.updateSyncedStatus(materialId);         // TX: pure DB
    try {
        srmClient.sync(material);
    } catch (Exception e) {
        log.error("Sync failed, materialId={}, manual compensation needed", materialId, e);
    }
}
```

### Transaction + Compensation for File Upload

```java
// BAD: File upload then DB - DB failure leaves orphan file
public void uploadFile(FileUploadReq req) {
    String filePath = fileService.uploadToStorage(req.getFile());
    saveFileRecord(filePath);  // May fail, file already uploaded
}

// GOOD: TransactionTemplate + compensation
public void uploadFile(FileUploadReq req) {
    String filePath = fileService.uploadToStorage(req.getFile()); // 1. IO outside TX
    try {
        transactionTemplate.executeWithoutResult(status -> {      // 2. TX: DB
            saveFileRecord(filePath);
        });
    } catch (Exception e) {
        fileService.deleteFromStorage(filePath);                  // 3. Compensate
        throw new BusinessException("Upload failed", e);
    }
}
```

### afterCommit Callback

```java
// Using TransactionSynchronizationManager
@Transactional(rollbackFor = Exception.class)
public void saveAndNotify(Data data) {
    save(data);
    TransactionSynchronizationManager.registerSynchronization(
        new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                log.info("Transaction committed, sending notification");
                try {
                    notificationService.send(data.getId());
                } catch (Exception e) {
                    log.error("Notify failed, dataId={}, manual compensation needed", data.getId(), e);
                }
            }
        }
    );
}

// Or using @TransactionalEventListener (declarative)
@Component
public class DataEventListener {
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleDataSaved(DataSavedEvent event) {
        notificationService.send(event.getDataId());
    }
}
```

### Self-invocation (CRITICAL)

```java
// BAD: Self-invocation - transaction bypassed
@Service
public class OrderService {
    @Transactional(rollbackFor = Exception.class)
    public void createOrder(Order order) { ... }

    public void batchCreate(List<Order> orders) {
        for (Order o : orders) {
            createOrder(o);  // No transaction! Self-invocation bypasses proxy
        }
    }
}

// GOOD: Self-injection or proxy
@Service
public class OrderService {
    @Autowired
    private OrderService self;

    public void batchCreate(List<Order> orders) {
        for (Order o : orders) {
            self.createOrder(o);  // Transaction works via proxy
        }
    }
}
```

### Transaction Timeout

```java
// BAD: No timeout configured
@Transactional(rollbackFor = Exception.class)
public void slowOperation() {
    // If DB hangs, this holds connection indefinitely
}

// GOOD: Configure timeout
@Transactional(rollbackFor = Exception.class, timeout = 30)
public void slowOperation() {
    // Times out after 30 seconds
}
```

---

## 21. SQL & MyBatis

### N+1 Query in Loop (HIGH)

```java
// BAD: N+1 query in loop
public List<Order> getOrdersWithDetails(List<Long> orderIds) {
    List<Order> orders = new ArrayList<>();
    for (Long id : orderIds) {
        Order order = orderMapper.selectById(id);  // N+1: one query per ID
        orders.add(order);
    }
    return orders;
}

// GOOD: Batch query
public List<Order> getOrdersWithDetails(List<Long> orderIds) {
    if (CollectionUtils.isEmpty(orderIds)) {
        return Collections.emptyList();
    }
    return orderMapper.selectBatchIds(orderIds);  // Single query with IN clause
}
```

### SELECT * (MEDIUM)

```java
// BAD: SELECT * in Mapper XML
// <select id="findByUserId" resultType="User">
//   SELECT * FROM user WHERE user_id = #{userId}
// </select>

// GOOD: Explicit column list
// <select id="findByUserId" resultType="User">
//   SELECT id, user_name, email, create_time
//   FROM user WHERE user_id = #{userId}
// </select>
```

### Long Transaction with Network Call (CRITICAL)

```java
// BAD: Long transaction with network call
@Transactional
public void processOrder(Long orderId) {
    Order order = orderMapper.selectById(orderId);
    restTemplate.getForObject("http://external/api", String.class);  // holds DB connection
    orderMapper.updateById(order);
}

// GOOD: Keep transactions short
public void processOrder(Long orderId) {
    Order order = orderMapper.selectById(orderId);
    String externalData = restTemplate.getForObject("http://external/api", String.class);
    updateOrderWithExternalData(orderId, externalData);  // Transaction only here
}

@Transactional
public void updateOrderWithExternalData(Long orderId, String data) {
    orderMapper.updateData(orderId, data);
}
```

### Missing @Param (MEDIUM)

```java
// BAD: Missing @Param in MyBatis Mapper
// List<User> findUsers(String name, Integer age);
// <select>...WHERE name = #{name} AND age = #{age}</select>  // MyBatis cannot resolve

// GOOD: Explicit @Param
// List<User> findUsers(@Param("name") String name, @Param("age") Integer age);
// <select>...WHERE name = #{name} AND age = #{age}</select>
```

### Missing WHERE Clause (CRITICAL)

```java
// BAD: Missing WHERE clause in update/delete
// <update id="updateAll">UPDATE user SET status = 1</update>  // Updates ALL rows!
// <delete id="deleteAll">DELETE FROM user</delete>  // Deletes ALL rows!

// GOOD: Always verify WHERE clause exists
// <update id="updateByCondition">
//   UPDATE user SET status = #{status} WHERE id = #{id}
// </update>
```

---

## 22. Sensitive Data Exposure

### Logging Sensitive Info (CRITICAL)

```java
// BAD: Logging sensitive information
log.info("User login: username={}, password={}", username, password);  // CRITICAL

// GOOD: Omit or desensitize
log.info("User login: username={}", username);
log.info("User login: phone={}", DesensitizationUtils.maskPhone(phone));
```

### Hardcoded Secrets (CRITICAL)

```java
// BAD: Hardcoded secret
private static final String API_SECRET = "1234567890";  // CRITICAL

// GOOD: Externalized configuration
@Value("${app.api.secret}")
private String apiSecret;
```

### Sensitive Fields in Response (CRITICAL)

```java
// BAD: Sensitive fields in response
public class UserResponse {
    private String passwordHash;   // CRITICAL
    private String idNumber;
}

// GOOD: Exclude with @JsonIgnore
public class UserResponse {
    @JsonIgnore
    private String passwordHash;
    private String name;
}
```

---

## 23. Thread Safety & Concurrency

### SimpleDateFormat (CRITICAL)

```java
// BAD: Static SimpleDateFormat - NOT thread-safe
private static final SimpleDateFormat FORMAT = new SimpleDateFormat("yyyy-MM-dd");  // CRITICAL

// GOOD: Thread-safe DateTimeFormatter
private static final DateTimeFormatter FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
```

### Unsynchronized Shared Collection (HIGH)

```java
// BAD: Unsynchronized shared collection
private List<String> names = new ArrayList<>();
public void addName(String name) { names.add(name); }  // HIGH

// GOOD: Thread-safe wrapper or concurrent collection
private List<String> names = Collections.synchronizedList(new ArrayList<>());
// or use CopyOnWriteArrayList for read-heavy
```

---

## 24. Date & Time Handling

### Timezone Issues (HIGH)

```java
// BAD: No timezone - server-local
LocalDateTime now = LocalDateTime.now();  // HIGH - what zone?

// GOOD: Explicit zone or UTC
ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Shanghai"));
Instant nowUtc = Instant.now();
```

### Parsing Without Format (MEDIUM)

```java
// BAD: Parsing without format
String dateStr = "2025-01-01";
LocalDate date = LocalDate.parse(dateStr);  // Works only for ISO

// GOOD: Explicit format for non-standard patterns
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
LocalDate date = LocalDate.parse("01/01/2025", formatter);
```

---

## 25. API Design (RESTful)

### GET Used for Mutation (HIGH)

```java
// BAD: GET used for mutation
@GetMapping("/delete/{id}")
public void delete(@PathVariable Long id) {  // HIGH
    userService.delete(id);
}

// GOOD: DELETE method
@DeleteMapping("/{id}")
public void delete(@PathVariable Long id) { }
```

### Always 200 OK (HIGH)

```java
// BAD: Always 200 OK
@PostMapping("/order")
public ResponseEntity<?> create(@RequestBody Order order) {
    try {
        return ResponseEntity.ok(service.create(order));
    } catch (Exception e) {
        return ResponseEntity.ok(ErrorResponse.of(e));  // HIGH - should be 4xx/5xx
    }
}

// GOOD: Proper status codes
@PostMapping("/order")
public ResponseEntity<?> create(@Valid @RequestBody Order order) {
    OrderDto result = service.create(order);
    return ResponseEntity.status(HttpStatus.CREATED).body(result);
}
```

---

## 26. Cross-Service Call Patterns

### No Timeout (CRITICAL)

```java
// BAD: No timeout - can block forever
restTemplate.getForObject(url, String.class);  // CRITICAL

// GOOD: Configure timeouts
@Bean
public RestTemplate restTemplate() {
    return new RestTemplateBuilder()
        .setConnectTimeout(Duration.ofSeconds(3))
        .setReadTimeout(Duration.ofSeconds(5))
        .build();
}
```

### No Circuit Breaker (HIGH)

```java
// BAD: No circuit breaker
public String callExternal() {
    return restTemplate.getForObject(url, String.class);
}

// GOOD: Use resilience4j or similar
@CircuitBreaker(name = "externalService")
@Retry(name = "externalService")
public String callExternal() {
    return restTemplate.getForObject(url, String.class);
}
```

---

## 27. Enum vs Magic Strings

### Magic Strings (MEDIUM)

```java
// BAD: Magic strings
if ("ACTIVE".equals(status)) {  // MEDIUM - typo possible
    processActive();
}

// GOOD: Enum
public enum OrderStatus {
    ACTIVE, PENDING, CLOSED
}

if (status == OrderStatus.ACTIVE) {
    processActive();
}
```

---

## 28. Serialization Best Practices

### Missing serialVersionUID (MEDIUM)

```java
// BAD: No serialVersionUID - brittle
public class User implements Serializable {
    private String name;
}

// GOOD: Explicit UID
public class User implements Serializable {
    private static final long serialVersionUID = 1L;
    private String name;
}
```

### Sensitive Fields Serialized (HIGH)

```java
// BAD: Sensitive fields serialized
public class User implements Serializable {
    private static final long serialVersionUID = 1L;
    private String password;  // HIGH - leaked in serialized form
}

// GOOD: Transient for sensitive data
public class User implements Serializable {
    private static final long serialVersionUID = 1L;
    private transient String password;  // Not serialized
}
```

---

## 29. BigDecimal Construction

### Double Constructor Precision Loss (MEDIUM/HIGH)

```java
// BAD: Double constructor - precision loss
BigDecimal value = new BigDecimal(0.1);  // 0.100000000000000005551...

// GOOD: String constructor or valueOf
BigDecimal value = new BigDecimal("0.1");
BigDecimal value2 = BigDecimal.valueOf(0.1);

// BAD: Division without rounding mode
BigDecimal result = a.divide(b);  // May throw if non-terminating

// GOOD: Specify rounding
BigDecimal result = a.divide(b, 2, RoundingMode.HALF_UP);
```

---

## 30. Logging Desensitization

### Whole Object Logged (MEDIUM)

```java
// BAD: Whole object logged - may contain sensitive fields
log.info("Created user: {}", user);  // MEDIUM

// GOOD: Custom toString with masking
public class User {
    @ToString.Exclude  // Lombok
    private String phone;

    private String name;

    @Override
    public String toString() {
        return String.format("User(name=%s, phone=%s)", name, maskPhone(phone));
    }
}

// Or use structured logging with explicit safe fields
log.info("user_created name={} userId={}", name, userId);
```

---

## 31. Regex Catastrophic Backtracking

### Nested Quantifiers (MEDIUM)

```java
// BAD: Catastrophic backtracking risk
Pattern.compile("(a+)+b");  // Input "aaaaaaaaaaaaaaaaac" will backtrack exponentially

// GOOD: Use possessive quantifiers
Pattern.compile("(a++)+b");  // Possessive quantifier prevents backtracking
```

---

## 32. Internationalization (i18n)

### Hardcoded User-facing Strings (LOW)

```java
// BAD: Hardcoded English
throw new ValidationException("Invalid email address");  // LOW

// GOOD: Use message properties
throw new ValidationException(MessageKeys.INVALID_EMAIL);

// BAD: Concatenated message
String message = "Order " + orderId + " has been " + status;

// GOOD: Parameterized with resource bundle
String message = messageSource.getMessage("order.status", new Object[]{orderId, status}, locale);
```

---

## 33. Assertions in Production

### assert Disabled in Production (HIGH)

```java
// BAD: assert - disabled in production
assert amount > 0 : "Amount must be positive";  // HIGH - does nothing in prod

// GOOD: Use explicit checks
if (amount <= 0) {
    throw new IllegalArgumentException("Amount must be positive");
}
```