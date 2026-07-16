# Java 17 + Spring Boot 代码规范

## 1. 项目结构规范
- src/main/java/com/company/project/
- ├── common/ # 通用模块
- │ ├── constant/ # 常量类
- │ ├── exception/ # 全局异常
- │ ├── config/ # 配置类
- │ └── util/ # 工具类
- ├── module/ # 业务模块（按模块拆分）
- │ ├── order/ # 订单模块
- │ │ ├── controller/ # API层
- │ │ ├── service/ # 业务层
- │ │ │ ├── OrderService.java
- │ │ │ └── impl/
- │ │ ├── mapper/ # MyBatis-Plus DAO层
- │ │ ├── entity/ # 实体类
- │ │ ├── dto/ # 数据传输对象
- │ │ │ ├── request/ # 请求DTO
- │ │ │ └── response/ # 响应DTO
- │ │ └── vo/ # 视图对象
- │ └── workflow/ # Flowable工作流模块
- │ ├── controller/ # 流程相关API
- │ ├── service/ # 流程服务
- │ └── listener/ # 流程监听器
- └── Application.java # 启动类
- src/main/resources/
- ├── mapper/ # MyBatis-Plus XML映射文件
- │ └── order/
- │ └── OrderMapper.xml
- ├── processes/ # Flowable BPMN文件
- │ ├── order_approval.bpmn20.xml
- │ └── leave_request.bpmn20.xml
- ├── application.yml # 主配置文件
- ├── application-dev.yml # 开发环境配置
- └── application-prod.yml # 生产环境配置

## 2. 命名规范

### 2.1 包命名
- 全部小写，点分隔：`com.company.project.module.order`

### 2.2 类命名
- **接口/实现类**：`OrderService` / `OrderServiceImpl`
- **Controller**：`OrderController`（REST风格）
- **Mapper**：`OrderMapper`（继承MyBatis-Plus的BaseMapper）
- **实体类**：`Order`（与表名对应，驼峰命名）
- **DTO**：`OrderCreateRequest`、`OrderQueryResponse`
- **VO**：`OrderDetailVO`、`OrderListVO`
- **常量类**：`OrderConstant`、`SecurityConstant`
- **配置类**：`FlowableConfig`、`DataSourceConfig`
- **工具类**：`DateUtil`、`JsonUtil`（私有构造方法，方法static）

### 2.3 方法命名
- **Controller方法**：使用HTTP动词+资源名
    - `getOrderById` (GET)
    - `createOrder` (POST)
    - `updateOrder` (PUT)
    - `deleteOrder` (DELETE)
- **Service方法**：业务动作清晰
    - `submitOrder`、`cancelOrder`、`queryOrderList`
- **Mapper方法**：MyBatis-Plus内置方法可直接使用，自定义用：
    - `selectByUserId`、`updateStatusByOrderId`

### 2.4 字段命名
- **实体类字段**：驼峰，与数据库下划线自动映射
  ```java
  private Long orderId;        // 对应 order_id
  private String userName;      // 对应 user_name
  private LocalDateTime createTime;

- **常量字段**：大写+下划线
    ```java
    public static final String ORDER_STATUS_PENDING = "PENDING";
    public static final int MAX_ORDER_QUANTITY = 100;
    public static final String DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";

- **布尔类型**：使用is前缀（避免使用flag等模糊命名）
    ```java
    private boolean isDeleted;      // 是否删除
    private boolean isActive;       // 是否激活
    private boolean isApproved;     // 是否通过

## 3. 代码规范
- **3.1实体类 (Entity)**：
    ```java
    package com.company.project.module.order.entity;

    import com.baomidou.mybatisplus.annotation.*;
    import lombok.Data;
    import lombok.EqualsAndHashCode;
    import java.math.BigDecimal;
    import java.time.LocalDateTime;
    @Data
    @EqualsAndHashCode(callSuper = false)
    @TableName("t_order")
    public class Order {

        @TableId(type = IdType.ASSIGN_ID)  // 雪花算法ID
        private Long orderId;
    
        @TableField("order_no")
        private String orderNo;
    
        @TableField("user_id")
        private Long userId;
    
        private String userName;
    
        @TableField("total_amount")
        private BigDecimal totalAmount;
    
        @TableField("order_status")
        private String orderStatus;
    
        @TableField("pay_time")
        private LocalDateTime payTime;
    
        @TableField("remark")
        private String remark;
    
        @Version  // 乐观锁
        private Integer version;
    
        @TableLogic  // 逻辑删除
        private Integer deleted;
    
        @TableField(fill = FieldFill.INSERT)
        private LocalDateTime createTime;
    
        @TableField(fill = FieldFill.INSERT_UPDATE)
        private LocalDateTime updateTime;
    
        @TableField("create_by")
        private String createBy;
    
        @TableField("update_by")
        private String updateBy;
    }
- **3.2 DTO规范**：
    ```java
    package com.company.project.module.order.dto.request;

    import io.swagger.v3.oas.annotations.media.Schema;
    import jakarta.validation.constraints.*;
    import lombok.Data;
    import java.math.BigDecimal;
    import java.util.List;
    
    /**
    * 创建订单请求DTO
    *
    * @author authorName
    * @since 2024-01-01
    */
    @Data
    @Schema(description = "创建订单请求")
    public class OrderCreateRequest {

        @NotNull(message = "用户ID不能为空")
        @Schema(description = "用户ID", requiredMode = Schema.RequiredMode.REQUIRED)
        private Long userId;
    
        @NotBlank(message = "订单号不能为空")
        @Size(max = 32, message = "订单号长度不能超过32")
        @Pattern(regexp = "^ORD\\d{10}$", message = "订单号格式不正确")
        @Schema(description = "订单号", example = "ORD2024001001")
        private String orderNo;
    
        @NotNull(message = "订单项不能为空")
        @Size(min = 1, message = "至少有一个订单项")
        @Valid  // 嵌套验证
        @Schema(description = "订单项列表")
        private List<OrderItemRequest> items;
    
        @NotNull(message = "总金额不能为空")
        @DecimalMin(value = "0.01", message = "金额必须大于0")
        @Digits(integer = 10, fraction = 2, message = "金额格式不正确")
        @Schema(description = "订单总金额", example = "299.50")
        private BigDecimal totalAmount;
    
        @Size(max = 200, message = "备注长度不能超过200")
        @Schema(description = "备注")
        private String remark;
    }
- **3.3 Controller层**：
    ```java
    package com.company.project.module.order.controller;

    import com.company.project.common.domain.ApiResponse;
    import com.company.project.common.domain.PageResult;
    import com.company.project.module.order.dto.request.OrderCreateRequest;
    import com.company.project.module.order.dto.request.OrderQueryRequest;
    import com.company.project.module.order.dto.response.OrderDetailResponse;
    import com.company.project.module.order.dto.response.OrderListResponse;
    import com.company.project.module.order.service.OrderService;
    import io.swagger.v3.oas.annotations.Operation;
    import io.swagger.v3.oas.annotations.Parameter;
    import io.swagger.v3.oas.annotations.tags.Tag;
    import jakarta.validation.Valid;
    import lombok.RequiredArgsConstructor;
    import lombok.extern.slf4j.Slf4j;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;

    /**
    * 订单控制器
    *
    * @author authorName
    * @since 2024-01-01
    */
    @Slf4j
    @RestController
    @RequestMapping("/api/v1/orders")
    @RequiredArgsConstructor
    @Tag(name = "订单管理", description = "订单相关API")
    public class OrderController {
        private final OrderService orderService;
    
    
        @PostMapping
        @Operation(summary = "创建订单", description = "创建新的订单")
        public ResponseEntity<ApiResponse<OrderDetailResponse>> createOrder(
              @Valid @RequestBody OrderCreateRequest request) {
            log.info("创建订单请求: {}", request);
            OrderDetailResponse response = orderService.createOrder(request);
            return ApiResponse.success(response);
        }
  
  
        @GetMapping
        @Operation(summary = "分页查询订单", description = "根据条件分页查询订单列表")
        public ResponseEntity<ApiResponse<PageResult<OrderListResponse>>> queryOrders(
                @Valid OrderQueryRequest request) {
            log.info("分页查询订单: {}", request);
            PageResult<OrderListResponse> page = orderService.queryPage(request);
            return ApiResponse.success(page);
        }
    }

- **3.4 Service层**：
    ```java
    package com.company.project.module.order.service;

    import com.company.project.common.domain.PageResult;
    import com.company.project.module.order.dto.request.OrderCreateRequest;
    import com.company.project.module.order.dto.request.OrderQueryRequest;
    import com.company.project.module.order.dto.response.OrderDetailResponse;
    import com.company.project.module.order.dto.response.OrderListResponse;

    public interface OrderService {


      OrderDetailResponse createOrder(OrderCreateRequest request);


      OrderDetailResponse getOrderById(Long orderId);


      PageResult<OrderListResponse> queryPage(OrderQueryRequest request);

      void cancelOrder(Long orderId, String reason);

      void deleteOrder(Long orderId);
    }

- **3.5 ServiceImpl层**：
    ```java
    package com.company.project.module.order.service.impl;

    import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
    import com.baomidou.mybatisplus.core.metadata.IPage;
    import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
    import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
    import com.company.project.common.domain.PageResult;
    import com.company.project.common.exception.BusinessException;
    import com.company.project.common.exception.ErrorCode;
    import com.company.project.module.order.constant.OrderConstant;
    import com.company.project.module.order.dto.request.OrderCreateRequest;
    import com.company.project.module.order.dto.request.OrderQueryRequest;
    import com.company.project.module.order.dto.response.OrderDetailResponse;
    import com.company.project.module.order.dto.response.OrderListResponse;
    import com.company.project.module.order.entity.Order;
    import com.company.project.module.order.mapper.OrderMapper;
    import com.company.project.module.order.service.OrderService;
    import lombok.RequiredArgsConstructor;
    import lombok.extern.slf4j.Slf4j;
    import org.springframework.stereotype.Service;
    import org.springframework.transaction.annotation.Transactional;
    import org.springframework.beans.BeanUtils;
    import java.time.LocalDateTime;
    import java.util.List;
    import java.util.stream.Collectors;

    /**
    * 订单服务实现类
    *
    * @author authorName
    * @since 2024-01-01
      */
  @Slf4j
  @Service
  @RequiredArgsConstructor
  @Transactional(rollbackFor = Exception.class)
  public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> implements OrderService {

  private final OrderMapper orderMapper;

  @Override
  public OrderDetailResponse createOrder(OrderCreateRequest request) {
  log.info("开始创建订单: userId={}, orderNo={}", request.getUserId(), request.getOrderNo());

       // 1. 校验订单号是否重复
       LambdaQueryWrapper<Order> wrapper = new LambdaQueryWrapper<>();
       wrapper.eq(Order::getOrderNo, request.getOrderNo());
       if (this.count(wrapper) > 0) {
           throw new BusinessException(ErrorCode.ORDER_NO_EXISTS);
       }
       
       // 2. 创建订单实体
       Order order = new Order();
       BeanUtils.copyProperties(request, order);
       order.setOrderStatus(OrderConstant.STATUS_CREATED);
       order.setCreateTime(LocalDateTime.now());
       
       // 3. 保存订单
       this.save(order);
       log.info("订单创建成功: orderId={}", order.getOrderId());
       
       // 4. 返回结果
       return this.convertToDetailResponse(order);
  }

  @Override
  public OrderDetailResponse getOrderById(Long orderId) {
  log.debug("查询订单: orderId={}", orderId);

       Order order = this.getById(orderId);
       if (order == null) {
           throw new BusinessException(ErrorCode.ORDER_NOT_FOUND);
       }
       
       return this.convertToDetailResponse(order);
  }

  @Override
  public PageResult<OrderListResponse> queryPage(OrderQueryRequest request) {
  log.debug("分页查询订单: {}", request);

       // 构建分页条件
       Page<Order> page = new Page<>(request.getPage(), request.getSize());
       
       // 构建查询条件
       LambdaQueryWrapper<Order> wrapper = new LambdaQueryWrapper<>();
       wrapper.eq(request.getUserId() != null, Order::getUserId, request.getUserId())
              .eq(request.getOrderStatus() != null, Order::getOrderStatus, request.getOrderStatus())
              .ge(request.getStartTime() != null, Order::getCreateTime, request.getStartTime())
              .le(request.getEndTime() != null, Order::getCreateTime, request.getEndTime())
              .orderByDesc(Order::getCreateTime);
       
       // 执行查询
       IPage<Order> iPage = this.page(page, wrapper);
       
       // 转换结果
       List<OrderListResponse> records = iPage.getRecords().stream()
               .map(this::convertToListResponse)
               .collect(Collectors.toList());
       
       return PageResult.<OrderListResponse>builder()
               .total(iPage.getTotal())
               .records(records)
               .page(request.getPage())
               .size(request.getSize())
               .build();
  }

  @Override
  public void cancelOrder(Long orderId, String reason) {
  log.info("取消订单: orderId={}, reason={}", orderId, reason);

       Order order = this.getById(orderId);
       if (order == null) {
           throw new BusinessException(ErrorCode.ORDER_NOT_FOUND);
       }
       
       // 校验订单状态
       if (!OrderConstant.STATUS_CREATED.equals(order.getOrderStatus())) {
           throw new BusinessException(ErrorCode.ORDER_CANNOT_CANCEL);
       }
       
       // 更新订单状态
       order.setOrderStatus(OrderConstant.STATUS_CANCELLED);
       order.setRemark(reason);
       this.updateById(order);
       
       log.info("订单取消成功: orderId={}", orderId);
  }

  @Override
  public void deleteOrder(Long orderId) {
  log.info("删除订单: orderId={}", orderId);

       Order order = this.getById(orderId);
       if (order == null) {
           throw new BusinessException(ErrorCode.ORDER_NOT_FOUND);
       }
       
       // 逻辑删除
       this.removeById(orderId);
       log.info("订单删除成功: orderId={}", orderId);
  }

  /**
    * 转换为详情响应
      */
      private OrderDetailResponse convertToDetailResponse(Order order) {
      OrderDetailResponse response = new OrderDetailResponse();
      BeanUtils.copyProperties(order, response);

      // 转换状态描述
      response.setOrderStatusDesc(OrderConstant.getStatusDesc(order.getOrderStatus()));

      // 格式化时间
      if (order.getCreateTime() != null) {
      response.setCreateTime(DateUtil.format(order.getCreateTime()));
      }

      return response;
      }

  /**
    * 转换为列表响应
      */
      private OrderListResponse convertToListResponse(Order order) {
      OrderListResponse response = new OrderListResponse();
      BeanUtils.copyProperties(order, response);
      return response;
      }
      }

- **3.5 Mapper层 (MyBatis-Plus)**：
    ```java
    package com.company.project.module.order.mapper;

    import com.baomidou.mybatisplus.core.mapper.BaseMapper;
    import com.company.project.module.order.entity.Order;
    import org.apache.ibatis.annotations.Mapper;
    import org.apache.ibatis.annotations.Param;
    import org.apache.ibatis.annotations.Select;
    import org.apache.ibatis.annotations.Update;
    import java.util.List;

    /**
    * 订单Mapper接口
    *
    * @author authorName
    * @since 2024-01-01
      */
    @Mapper
    public interface OrderMapper extends BaseMapper<Order> {

    /**
    * 根据用户ID和状态查询订单
    */
      @Select("SELECT * FROM t_order WHERE user_id = #{userId} AND order_status = #{status} ORDER BY create_time DESC")
      List<Order> selectByUserAndStatus(@Param("userId") Long userId, @Param("status") String status);

  /**
    * 更新订单状态
      */
      @Update("UPDATE t_order SET order_status = #{status}, update_time = NOW() WHERE order_id = #{orderId}")
      int updateStatus(@Param("orderId") Long orderId, @Param("status") String status);

  /**
    * 批量更新订单状态
      */
      int batchUpdateStatus(@Param("orderIds") List<Long> orderIds, @Param("status") String status);
      }

- 对应的XML文件 resources/mapper/order/OrderMapper.xml：
    ```xml
        <?xml version="1.0" encoding="UTF-8"?>
        <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" 
            "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
        <mapper namespace="com.company.project.module.order.mapper.OrderMapper">

    <!-- 批量更新订单状态 -->
    <update id="batchUpdateStatus">
        UPDATE t_order 
        SET order_status = #{status}, 
            update_time = NOW() 
        WHERE order_id IN 
        <foreach collection="orderIds" item="orderId" open="(" separator="," close=")">
            #{orderId}
        </foreach>
    </update>
    
    <!-- 复杂查询示例 -->
    <select id="selectComplexOrderList" resultType="com.company.project.module.order.vo.OrderVO">
        SELECT 
            o.order_id,
            o.order_no,
            o.user_id,
            u.user_name,
            o.total_amount,
            o.order_status,
            o.create_time
        FROM t_order o
        LEFT JOIN t_user u ON o.user_id = u.user_id
        <where>
            <if test="query.userId != null">
                AND o.user_id = #{query.userId}
            </if>
            <if test="query.orderStatus != null and query.orderStatus != ''">
                AND o.order_status = #{query.orderStatus}
            </if>
            <if test="query.startTime != null">
                AND o.create_time >= #{query.startTime}
            </if>
            <if test="query.endTime != null">
                AND o.create_time &lt;= #{query.endTime}
            </if>
        </where>
        ORDER BY o.create_time DESC
    </select>
</mapper>

- **3.6 统一响应格式**
    ```java
        package com.company.project.common.domain;

        import io.swagger.v3.oas.annotations.media.Schema;
        import lombok.AllArgsConstructor;
        import lombok.Data;
        import lombok.NoArgsConstructor;
        import org.springframework.http.HttpStatus;
        import org.springframework.http.ResponseEntity;

     /**
     * 统一API响应格式
     *
     * @author authorName
     * @since 2024-01-01
       */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  @Schema(description = "统一响应格式")
  public class ApiResponse<T> {

  @Schema(description = "状态码", example = "200")
  private Integer code;

  @Schema(description = "消息", example = "success")
  private String message;

  @Schema(description = "数据")
  private T data;

  /**
    * 成功响应（带数据）
      */
      public static <T> ResponseEntity<ApiResponse<T>> success(T data) {
      ApiResponse<T> response = new ApiResponse<>(200, "success", data);
      return ResponseEntity.ok(response);
      }

  /**
    * 成功响应（无数据）
      */
      public static <T> ResponseEntity<ApiResponse<T>> success() {
      return success(null);
      }

  /**
    * 失败响应
      */
      public static <T> ResponseEntity<ApiResponse<T>> error(Integer code, String message) {
      ApiResponse<T> response = new ApiResponse<>(code, message, null);
      return ResponseEntity.status(code).body(response);
      }

  /**
    * 失败响应（带HttpStatus）
      */
      public static <T> ResponseEntity<ApiResponse<T>> error(HttpStatus status, String message) {
      return error(status.value(), message);
      }
      }

- **3.7 分页结果封装**
    ```java
    package com.company.project.common.domain;

    import io.swagger.v3.oas.annotations.media.Schema;
    import lombok.AllArgsConstructor;
    import lombok.Builder;
    import lombok.Data;
    import lombok.NoArgsConstructor;
    import java.util.Collections;
    import java.util.List;

    /**
    * 分页结果封装
    *
    * @author authorName
    * @since 2024-01-01
      */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @Schema(description = "分页结果")
  public class PageResult<T> {

  @Schema(description = "总记录数")
  private Long total;

  @Schema(description = "当前页数据")
  private List<T> records;

  @Schema(description = "当前页码")
  private Integer page;

  @Schema(description = "每页大小")
  private Integer size;

  /**
    * 空分页结果
      */
      public static <T> PageResult<T> empty() {
      return PageResult.<T>builder()
      .total(0L)
      .records(Collections.emptyList())
      .page(1)
      .size(10)
      .build();
      }

  /**
    * 获取总页数
      */
      public Long getTotalPages() {
      if (total == null || size == null || size <= 0) {
      return 0L;
      }
      return (total + size - 1) / size;
      }

  /**
    * 是否有下一页
      */
      public boolean hasNext() {
      if (page == null || size == null || total == null) {
      return false;
      }
      return page < getTotalPages();
      }
      }    
  
## 5. 注释规范

- **5.1 类注释**
    ```java
    /**
    * 订单服务实现类
    * <p>
    * 提供订单的增删改查功能，包含业务逻辑校验和异常处理
    * </p>
    *
    * @author Zhang San
    * @version 1.0.0
    * @see OrderService
    * @since 2024-01-01
      */
  
- **5.2 方法注释**
    ```java
        /**
        * 创建订单
        * <p>
        * 根据请求参数创建新订单，包含以下步骤：
        * 1. 校验参数合法性
        * 2. 检查订单号是否重复
        * 3. 保存订单信息
        * 4. 返回订单详情
        * </p>
        *
        * @param request 创建订单请求对象，不能为null
        * @return 订单详情响应对象
        * @throws BusinessException 当订单号已存在时抛出
        * @throws IllegalArgumentException 当请求参数无效时抛出
          */
  
- **5.3 字段注释**
    ```java
        /**
        * 订单状态
        * <p>
        * 可选值：
        * - CREATED: 已创建
        * - PAID: 已支付
        * - SHIPPED: 已发货
        * - COMPLETED: 已完成
        * - CANCELLED: 已取消
        * </p>
        */
        private String orderStatus;
  
- **5.4 关键逻辑注释**
    ```java
        // 使用雪花算法生成订单号，保证分布式环境下的唯一性
        order.setOrderNo(generateOrderNo());
        
        // 校验订单状态，只有"已创建"状态的订单才能取消
        if (!OrderConstant.STATUS_CREATED.equals(order.getOrderStatus())) {
        throw new BusinessException(ErrorCode.ORDER_CANNOT_CANCEL);
        }
        
        // TODO: 后续需要添加库存扣减逻辑
        // FIXME: 高并发场景下可能会有超卖问题，需要优化

        /**
        * 注意：这里使用乐观锁机制避免并发更新问题
        * 数据库版本号会自动递增，更新时校验version字段
          */
    
  
## 6. 日志规范

- **6.1 日志级别**
  - 
      ERROR：影响业务流程的异常

      WARN：不影响流程但值得关注的异常

      INFO：关键业务流程节点

      DEBUG：开发调试信息

- **6.2 日志格式**
  ```java
    // 业务开始
    log.info("开始处理订单: orderId={}, userId={}", orderId, userId);
    
    // 业务成功
    log.info("订单处理成功: orderId={}, 耗时={}ms", orderId, costTime);
    
    // 业务失败
    log.error("订单处理失败: orderId={}, error={}", orderId, e.getMessage(), e);
    
    // 调试信息
    log.debug("订单详情: {}", JsonUtil.toJson(order));
    
  
- **6.3 MDC 链路追踪**
  ```java
    // 在请求入口设置
    MDC.put("traceId", TraceIdUtil.generate());
    MDC.put("userId", userId);
    
    // 在日志中自动输出
    // 2024-01-01 10:00:00 INFO [traceId=123,userId=456] 订单处理成功
    
    // 请求结束后清理
    MDC.clear();