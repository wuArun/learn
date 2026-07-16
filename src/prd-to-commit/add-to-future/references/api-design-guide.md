# API设计规范指南 (Java 17 + Spring Boot)

## 1. 基础规范

### 1.1 RESTful API原则
- **统一接口**：使用标准HTTP方法（GET/POST/PUT/DELETE/PATCH）
- **无状态**：每个请求包含所有必要信息
- **资源导向**：URL表示资源，动词表示操作
- **可缓存**：适当使用HTTP缓存头
- **分层系统**：客户端无需知道后端实现细节

### 1.2 HTTP方法规范
| 方法 | 用途 | 幂等性 | 安全性 |
|------|------|--------|--------|
| GET | 获取资源 | 是 | 是 |
| POST | 创建资源 | 否 | 否 |
| PUT | 更新整个资源 | 是 | 否 |
| PATCH | 部分更新资源 | 否 | 否 |
| DELETE | 删除资源 | 是 | 否 |

### 1.3 URL设计规范
- 使用名词复数形式：`/users` 而非 `/user`
- 层级关系：`/users/{userId}/orders/{orderId}`
- 使用连字符 `-` 而非下划线 `_`
- 避免在URL中使用动词
- 查询参数用于过滤、排序、分页等操作

## 2. 详细API设计规范

### 2.1 资源命名规范
- **集合资源**：使用复数名词，如 `/api/v1/users`
- **单一资源**：`/api/v1/users/{id}`
- **子资源**：`/api/v1/users/{id}/orders`
- **操作型资源**：使用动词，如 `/api/v1/users/{id}/activate`

### 2.2 版本控制
- URL路径版本：`/api/v1/resource`
- 请求头版本：`Accept: application/vnd.company.v1+json`
- **推荐**：使用URL路径版本，便于调试和缓存

### 2.3 状态码使用
| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 | OK | 成功请求 |
| 201 | Created | 资源创建成功 |
| 204 | No Content | 成功但无返回内容 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突 |
| 422 | Unprocessable Entity | 业务逻辑错误 |
| 429 | Too Many Requests | 请求频率限制 |
| 500 | Internal Server Error | 服务器内部错误 |

## 3. 请求参数规范

### 3.1 路径参数
```java
@GetMapping("/users/{userId}")
public ResponseEntity<UserDTO> getUser(@PathVariable Long userId) {
    // ...
}
```

### 3.2 查询参数
- 使用 `@RequestParam` 注解
- 参数命名使用camelCase
- 可选参数使用 `required = false`
- 分页参数标准：`page`, `size`, `sort`

```java
@GetMapping("/users")
public ResponseEntity<Page<UserDTO>> getUsers(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size,
    @RequestParam(required = false) String name,
    @RequestParam(defaultValue = "id,desc") String sort) {
    // ...
}
```

### 3.3 请求体参数
- 使用DTO类封装请求数据
- 添加 `@Valid` 注解进行校验
- 支持嵌套对象

```java
@PostMapping("/users")
public ResponseEntity<UserDTO> createUser(@Valid @RequestBody CreateUserRequest request) {
    // ...
}
```

### 3.4 文件上传
```java
@PostMapping("/files")
public ResponseEntity<FileDTO> uploadFile(@RequestParam("file") MultipartFile file) {
    // ...
}
```

## 4. 响应规范

### 4.1 统一响应格式
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String code;
    private String message;
    private T data;
    private Long timestamp;
    private String traceId;
    
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
            .success(true)
            .code("SUCCESS")
            .message("操作成功")
            .data(data)
            .timestamp(System.currentTimeMillis())
            .build();
    }
    
    public static ApiResponse<Void> error(String code, String message) {
        return ApiResponse.<Void>builder()
            .success(false)
            .code(code)
            .message(message)
            .timestamp(System.currentTimeMillis())
            .build();
    }
}
```

### 4.2 分页响应
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {
    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;
}
```

### 4.3 错误响应
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private String code;
    private String message;
    private String path;
    private Long timestamp;
    private Map<String, Object> details;
}
```

## 5. 数据验证规范

### 5.1 Bean Validation注解
```java
@Data
public class CreateUserRequest {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 50, message = "用户名长度必须在3-50之间")
    private String username;
    
    @Email(message = "邮箱格式不正确")
    @NotBlank(message = "邮箱不能为空")
    private String email;
    
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$", 
             message = "密码必须包含大小写字母和数字，长度至少8位")
    private String password;
    
    @Min(value = 18, message = "年龄必须大于等于18")
    @Max(value = 150, message = "年龄必须小于等于150")
    private Integer age;
    
    @Future(message = "生效时间必须是将来时间")
    private LocalDateTime effectiveTime;
}
```

### 5.2 自定义验证器
```java
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PhoneNumberValidator.class)
public @interface PhoneNumber {
    String message() default "手机号格式不正确";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class PhoneNumberValidator implements ConstraintValidator<PhoneNumber, String> {
    private static final Pattern PHONE_PATTERN = Pattern.compile("^1[3-9]\\d{9}$");
    
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // 使用@NotNull处理空值
        }
        return PHONE_PATTERN.matcher(value).matches();
    }
}
```

## 6. 异常处理规范

### 6.1 全局异常处理器
```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(
            MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.toList());
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error("VALIDATION_ERROR", String.join("; ", errors)));
    }
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(
            BusinessException ex) {
        log.error("业务异常: {}", ex.getMessage(), ex);
        return ResponseEntity.status(ex.getHttpStatus())
            .body(ApiResponse.error(ex.getCode(), ex.getMessage()));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        log.error("系统异常: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error("INTERNAL_ERROR", "系统内部错误"));
    }
}
```

### 6.2 自定义业务异常
```java
@Getter
public class BusinessException extends RuntimeException {
    private final String code;
    private final HttpStatus httpStatus;
    
    public BusinessException(String code, String message) {
        this(code, message, HttpStatus.BAD_REQUEST);
    }
    
    public BusinessException(String code, String message, HttpStatus httpStatus) {
        super(message);
        this.code = code;
        this.httpStatus = httpStatus;
    }
}

// 使用示例
public class UserNotFoundException extends BusinessException {
    public UserNotFoundException(Long userId) {
        super("USER_NOT_FOUND", "用户不存在: " + userId, HttpStatus.NOT_FOUND);
    }
}
```

## 7. API文档规范

### 7.1 OpenAPI 3.0规范
```java
@Configuration
public class OpenApiConfig {
    
    @Bean
    public OpenAPI springShopOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("APQP质量管理系统API")
                .description("APQP质量管理系统REST API文档")
                .version("v1.0.0")
                .contact(new Contact()
                    .name("技术团队")
                    .email("tech@example.com")))
            .externalDocs(new ExternalDocumentation()
                .description("项目Wiki")
                .url("https://wiki.example.com"))
            .addSecurityItem(new SecurityRequirement().addList("BearerAuth"))
            .components(new Components()
                .addSecuritySchemes("BearerAuth",
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")));
    }
}
```

### 7.2 Controller文档示例
```java
@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "用户管理", description = "用户相关操作API")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    @Operation(summary = "获取用户列表", description = "分页获取用户列表，支持筛选和排序")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "成功获取用户列表"),
        @ApiResponse(responseCode = "401", description = "未认证"),
        @ApiResponse(responseCode = "403", description = "无权限")
    })
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<UserDTO>>> getUsers(
            @Parameter(description = "页码，从0开始") 
            @RequestParam(defaultValue = "0") int page,
            
            @Parameter(description = "每页大小") 
            @RequestParam(defaultValue = "20") int size,
            
            @Parameter(description = "用户名（模糊查询）") 
            @RequestParam(required = false) String username,
            
            @Parameter(description = "排序字段，格式：field,asc|desc") 
            @RequestParam(defaultValue = "createdTime,desc") String sort) {
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(sort));
        Page<UserDTO> userPage = userService.findUsers(username, pageRequest);
        
        return ResponseEntity.ok(ApiResponse.success(
            PageResponse.<UserDTO>builder()
                .content(userPage.getContent())
                .pageNumber(userPage.getNumber())
                .pageSize(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .first(userPage.isFirst())
                .last(userPage.isLast())
                .build()
        ));
    }
    
    @Operation(summary = "创建用户", description = "创建新用户")
    @PostMapping
    public ResponseEntity<ApiResponse<UserDTO>> createUser(
            @Valid @RequestBody CreateUserRequest request) {
        UserDTO user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(user));
    }
}
```

## 8. 安全规范

### 8.1 认证与授权
- 使用JWT进行认证
- 基于角色的访问控制（RBAC）
- 细粒度权限控制
- 会话管理

### 8.2 安全防护
- 防止SQL注入
- 防止XSS攻击
- CSRF防护
- 请求频率限制
- 敏感数据加密

### 8.3 安全配置示例
```java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/v1/users/**").hasAnyRole("USER", "ADMIN")
                .anyRequest().authenticated())
            .addFilterBefore(jwtAuthenticationFilter, 
                UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(new JwtAuthenticationEntryPoint())
                .accessDeniedHandler(new JwtAccessDeniedHandler()))
            .build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

## 9. 性能优化规范

### 9.1 缓存策略
```java
@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {
    
    private final ProductService productService;
    
    @Cacheable(value = "products", key = "#id", unless = "#result == null")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> getProduct(@PathVariable Long id) {
        ProductDTO product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(product));
    }
    
    @CacheEvict(value = "products", key = "#id")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductRequest request) {
        ProductDTO product = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success(product));
    }
}
```

### 9.2 数据库优化
- 合理使用索引
- 避免N+1查询问题
- 使用分页查询
- 批量操作优化

### 9.3 异步处理
```java
@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {
    
    private final AsyncService asyncService;
    
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<String>> generateReport(
            @Valid @RequestBody GenerateReportRequest request) {
        String taskId = asyncService.generateReport(request);
        return ResponseEntity.accepted()
            .body(ApiResponse.success(taskId));
    }
    
    @GetMapping("/status/{taskId}")
    public ResponseEntity<ApiResponse<ReportStatusDTO>> getReportStatus(
            @PathVariable String taskId) {
        ReportStatusDTO status = asyncService.getReportStatus(taskId);
        return ResponseEntity.ok(ApiResponse.success(status));
    }
}
```

## 10. 版本控制规范

### 10.1 URL版本控制
```java
@RestController
@RequestMapping("/api/v1/users")
public class UserControllerV1 {
    // v1版本实现
}

@RestController
@RequestMapping("/api/v2/users")
public class UserControllerV2 {
    // v2版本实现，保持v1兼容
}
```

### 10.2 请求头版本控制
```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @GetMapping
    @RequestMapping(headers = "API-Version=1")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getUsersV1() {
        // v1版本实现
    }
    
    @GetMapping
    @RequestMapping(headers = "API-Version=2")
    public ResponseEntity<ApiResponse<PageResponse<UserDTO>>> getUsersV2(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        // v2版本实现（分页）
    }
}
```

## 11. 监控与日志规范

### 11.1 结构化日志
```java
@Slf4j
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> getUser(
            @PathVariable Long id,
            HttpServletRequest request) {
        MDC.put("userId", String.valueOf(id));
        MDC.put("requestId", request.getHeader("X-Request-ID"));
        
        log.info("开始查询用户信息，用户ID: {}", id);
        
        try {
            UserDTO user = userService.getUserById(id);
            log.info("查询用户信息成功，用户ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success(user));
        } catch (UserNotFoundException e) {
            log.warn("用户不存在，用户ID: {}", id);
            throw e;
        } finally {
            MDC.clear();
        }
    }
}
```

### 11.2 监控指标
- 请求响应时间
- 请求成功率
- 错误率统计
- 业务指标监控

## 12. API设计检查清单

### 12.1 设计阶段检查
- [ ] URL是否符合RESTful规范
- [ ] HTTP方法使用是否正确
- [ ] 状态码使用是否恰当
- [ ] 请求/响应格式是否统一
- [ ] 是否考虑了版本控制
- [ ] 是否支持分页和排序
- [ ] 数据验证规则是否完整
- [ ] 错误处理机制是否完善
- [ ] 安全防护措施是否到位

### 12.2 实现阶段检查
- [ ] 参数验证是否完备
- [ ] 异常处理是否统一
- [ ] 日志记录是否完整
- [ ] 性能优化是否考虑
- [ ] 缓存策略是否合理
- [ ] 数据库查询是否优化
- [ ] 线程安全是否保证
- [ ] 并发处理是否考虑

### 12.3 文档阶段检查
- [ ] API文档是否完整
- [ ] 接口描述是否清晰
- [ ] 参数说明是否详细
- [ ] 示例代码是否提供
- [ ] 错误码说明是否完整
- [ ] 版本变更记录是否维护

## 13. 完整示例

### 13.1 用户管理API示例
```java
package com.example.apqp.controller;

import com.example.apqp.dto.*;
import com.example.apqp.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "用户管理", description = "用户相关操作API")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    @Operation(summary = "获取用户列表", description = "分页获取用户列表，支持筛选和排序")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "成功获取用户列表"),
        @ApiResponse(responseCode = "400", description = "请求参数错误"),
        @ApiResponse(responseCode = "401", description = "未认证"),
        @ApiResponse(responseCode = "403", description = "无权限")
    })
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<UserDTO>>> getUsers(
            @Parameter(description = "页码，从0开始") 
            @RequestParam(defaultValue = "0") int page,
            
            @Parameter(description = "每页大小") 
            @RequestParam(defaultValue = "20") int size,
            
            @Parameter(description = "用户名（模糊查询）") 
            @RequestParam(required = false) String username,
            
            @Parameter(description = "邮箱（模糊查询）") 
            @RequestParam(required = false) String email,
            
            @Parameter(description = "状态：0-禁用，1-启用") 
            @RequestParam(required = false) Integer status,
            
            @Parameter(description = "排序字段，格式：field,asc|desc，多个字段用逗号分隔") 
            @RequestParam(defaultValue = "createdTime,desc") String sort) {
        
        log.info("查询用户列表，参数: page={}, size={}, username={}, email={}, status={}, sort={}", 
                page, size, username, email, status, sort);
        
        // 解析排序参数
        Sort sortObj = parseSortParameter(sort);
        PageRequest pageRequest = PageRequest.of(page, size, sortObj);
        
        // 查询用户
        Page<UserDTO> userPage = userService.findUsers(username, email, status, pageRequest);
        
        // 构建响应
        PageResponse<UserDTO> response = PageResponse.<UserDTO>builder()
                .content(userPage.getContent())
                .pageNumber(userPage.getNumber())
                .pageSize(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .first(userPage.isFirst())
                .last(userPage.isLast())
                .build();
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "获取用户详情", description = "根据用户ID获取用户详情")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "成功获取用户详情"),
        @ApiResponse(responseCode = "404", description = "用户不存在")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDetailDTO>> getUserById(
            @Parameter(description = "用户ID") @PathVariable Long id) {
        
        log.info("查询用户详情，用户ID: {}", id);
        UserDetailDTO userDetail = userService.getUserDetailById(id);
        return ResponseEntity.ok(ApiResponse.success(userDetail));
    }

    @Operation(summary = "创建用户", description = "创建新用户")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "用户创建成功"),
        @ApiResponse(responseCode = "400", description = "请求参数错误"),
        @ApiResponse(responseCode = "409", description = "用户名或邮箱已存在")
    })
    @PostMapping
    public ResponseEntity<ApiResponse<UserDTO>> createUser(
            @Valid @RequestBody CreateUserRequest request) {
        
        log.info("创建用户，用户名: {}, 邮箱: {}", request.getUsername(), request.getEmail());
        UserDTO user = userService.createUser(request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(user));
    }

    @Operation(summary = "更新用户", description = "更新用户信息")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "用户更新成功"),
        @ApiResponse(responseCode = "400", description = "请求参数错误"),
        @ApiResponse(responseCode = "404", description = "用户不存在"),
        @ApiResponse(responseCode = "409", description = "邮箱已存在")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(
            @Parameter(description = "用户ID") @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        
        log.info("更新用户，用户ID: {}", id);
        UserDTO user = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @Operation(summary = "部分更新用户", description = "部分更新用户信息")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "用户更新成功"),
        @ApiResponse(responseCode = "404", description = "用户不存在")
    })
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> patchUser(
            @Parameter(description = "用户ID") @PathVariable Long id,
            @RequestBody PatchUserRequest request) {
        
        log.info("部分更新用户，用户ID: {}", id);
        UserDTO user = userService.patchUser(id, request);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @Operation(summary = "删除用户", description = "删除用户（逻辑删除）")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "用户删除成功"),
        @ApiResponse(responseCode = "404", description = "用户不存在")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "用户ID") @PathVariable Long id) {
        
        log.info("删除用户，用户ID: {}", id);
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "启用用户", description = "启用已禁用的用户")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "用户启用成功"),
        @ApiResponse(responseCode = "404", description = "用户不存在")
    })
    @PostMapping("/{id}/enable")
    public ResponseEntity<ApiResponse<Void>> enableUser(
            @Parameter(description = "用户ID") @PathVariable Long id) {
        
        log.info("启用用户，用户ID: {}", id);
        userService.enableUser(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "禁用用户", description = "禁用用户")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "用户禁用成功"),
        @ApiResponse(responseCode = "404", description = "用户不存在")
    })
    @PostMapping("/{id}/disable")
    public ResponseEntity<ApiResponse<Void>> disableUser(
            @Parameter(description = "用户ID") @PathVariable Long id) {
        
        log.info("禁用用户，用户ID: {}", id);
        userService.disableUser(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 解析排序参数
     */
    private Sort parseSortParameter(String sort) {
        if (sort == null || sort.trim().isEmpty()) {
            return Sort.unsorted();
        }
        
        try {
            String[] sortParts = sort.split(",");
            List<Sort.Order> orders = new java.util.ArrayList<>();
            
            for (String sortPart : sortParts) {
                String[] fieldAndDirection = sortPart.trim().split(":");
                if (fieldAndDirection.length == 2) {
                    String field = fieldAndDirection[0].trim();
                    Sort.Direction direction = Sort.Direction.fromString(
                        fieldAndDirection[1].trim().toLowerCase());
                    orders.add(new Sort.Order(direction, field));
                } else {
                    // 默认升序
                    orders.add(new Sort.Order(Sort.Direction.ASC, sortPart.trim()));
                }
            }
            
            return Sort.by(orders);
        } catch (Exception e) {
            log.warn("排序参数解析失败，使用默认排序: {}", e.getMessage());
            return Sort.by("id").descending();
        }
    }
}
```

### 13.2 DTO示例
```java
package com.example.apqp.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Schema(description = "创建用户请求")
public class CreateUserRequest {
    
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 50, message = "用户名长度必须在3-50之间")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "用户名只能包含字母、数字和下划线")
    @Schema(description = "用户名", example = "john_doe", requiredMode = Schema.RequiredMode.REQUIRED)
    private String username;
    
    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    @Schema(description = "邮箱", example = "john.doe@example.com", requiredMode = Schema.RequiredMode.REQUIRED)
    private String email;
    
    @NotBlank(message = "密码不能为空")
    @Size(min = 8, max = 100, message = "密码长度必须在8-100之间")
    @Schema(description = "密码", example = "Password123!", requiredMode = Schema.RequiredMode.REQUIRED)
    private String password;
    
    @NotBlank(message = "姓名不能为空")
    @Size(max = 100, message = "姓名长度不能超过100")
    @Schema(description = "姓名", example = "John Doe", requiredMode = Schema.RequiredMode.REQUIRED)
    private String fullName;
    
    @Size(max = 20, message = "手机号长度不能超过20")
    @Schema(description = "手机号", example = "13800138000")
    private String phone;
    
    @NotNull(message = "部门ID不能为空")
    @Schema(description = "部门ID", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long departmentId;
    
    @Schema(description = "角色ID列表")
    private List<Long> roleIds;
    
    @Schema(description = "备注")
    @Size(max = 500, message = "备注长度不能超过500")
    private String remark;
}

@Data
@Schema(description = "用户详情响应")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDetailDTO {
    
    @Schema(description = "用户ID", example = "1")
    private Long id;
    
    @Schema(description = "用户名", example = "john_doe")
    private String username;
    
    @Schema(description = "邮箱", example = "john.doe@example.com")
    private String email;
    
    @Schema(description = "姓名", example = "John Doe")
    private String fullName;
    
    @Schema(description = "手机号", example = "13800138000")
    private String phone;
    
    @Schema(description = "状态：0-禁用，1-启用", example = "1")
    private Integer status;
    
    @Schema(description = "部门信息")
    private DepartmentDTO department;
    
    @Schema(description = "角色列表")
    private List<RoleDTO> roles;
    
    @Schema(description = "创建时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdTime;
    
    @Schema(description = "更新时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedTime;
    
    @Schema(description = "最后登录时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastLoginTime;
}
```

## 14. 最佳实践总结

### 14.1 设计原则
1. **KISS原则**：保持简单直接
2. **一致性原则**：保持API设计风格一致
3. **向后兼容**：避免破坏性变更
4. **适度抽象**：避免过度设计
5. **文档驱动**：先设计文档，后实现代码

### 14.2 技术选型推荐
- **Web框架**：Spring Boot 3.x
- **文档工具**：SpringDoc OpenAPI 3
- **验证框架**：Jakarta Bean Validation 3.0
- **序列化**：Jackson
- **测试框架**：JUnit 5 + Mockito
- **性能监控**：Micrometer + Prometheus

### 14.3 团队协作建议
1. 建立API设计评审机制
2. 使用契约测试保证接口一致性
3. 维护API变更日志
4. 定期进行API性能测试
5. 建立API治理流程

---

**版本记录**
- v1.0.0 (2025-03-11)：初始版本，基于Java 17 + Spring Boot 3.x