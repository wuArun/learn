# 代码模板目录

本目录包含 gdqa-apqp-domain 项目的标准代码模板，严格遵循项目编码规范。

## 模板列表

| 模板文件 | 用途 | 所在模块 |
|----------|------|---------|
| [controller-template.java](controller-template.java) | RESTful Controller | catl-api |
| [service-interface-template.java](service-interface-template.java) | Service 接口 | catl-app |
| [service-impl-template.java](service-impl-template.java) | Service 实现 | catl-app |
| [mapper-interface-template.java](mapper-interface-template.java) | Mapper 接口（禁止注解 SQL） | catl-infra-dal |
| [mapper-xml-template.xml](mapper-xml-template.xml) | MyBatis XML（所有 SQL 必须在此） | catl-infra-dal |
| [entity-template.java](entity-template.java) | 实体类 | catl-domain |

## 使用说明

1. 复制对应模板文件到目标模块的源码目录
2. 替换全部占位符（见下方说明）
3. 根据实际业务需求调整代码逻辑
4. 参考 [编码风格报告](../../code-style-report.html) 了解更多规范细节

## 占位符说明

| 占位符 | 说明 | 示例值 |
|--------|------|--------|
| `{module}` | 模块子包名（小写） | `quality`, `process`, `project` |
| `{ResourceName}` | 资源名称（PascalCase） | `QualityGate`, `ProcessInstance` |
| `{resourceName}` | 资源名称（camelCase） | `qualityGate`, `processInstance` |
| `{resource-path}` | URL 路径（kebab-case） | `quality-gate`, `process-instance` |
| `{resourcePrefix}` | 表字段前缀（camelCase） | `qualityGate`, `processInstance` |
| `{table_prefix}` | 表字段前缀（snake_case） | `quality_gate`, `process_instance` |
| `{table_name}` | 数据库表名 | `quality_gate_instance` |
| `{功能描述}` | 中文功能描述 | `质量门`、`流程实例` |
| `{author}` | 作者名称 | `wurunxiang` |
| `{date}` | 日期（格式：yyyy-MM-dd） | `2025-09-19` |

## 编码规范要点

### Controller 层
- 类注解：`@RestController` + `@RequestMapping("/v1/{resource}")` + `@Slf4j` + `@RequiredArgsConstructor`
- 响应封装：`ResultVoUtil.success(data)` / `ResultVoUtil.success(message, data)`
- 参数：`@Valid @RequestBody` 用于复杂对象，`@RequestParam` 用于简单参数
- 审计：写操作加 `@OperatorAudit("描述")`
- 翻译：列表查询加 `@TranslateQueryList(databaseSchema = "apqp", resultNodeName = "list")`
- Swagger：`@Operation(summary = "描述")` + 类级别 `@Tag`

### Service 接口
- 继承 `MPJBaseService<Entity>` 获得通用 CRUD 能力
- 方法命名：`page`, `getById`, `add`, `update`, `deleteById`, `listByXxx`
- 参数使用具体 DTO/ReqVO，禁止 `Map<String, Object>`
- 必须编写 Javadoc

### ServiceImpl
- 类注解：`@Slf4j` + `@Service` + `@RequiredArgsConstructor`
- 继承 `MPJBaseServiceImpl<Mapper, Entity>`
- 注入方式：`private final` + 构造函数注入（首选）或 `@Autowired`
- 事务：写操作加 `@Transactional(rollbackFor = Exception.class)`
- 异常：仅允许 `CommonException`，使用 i18n key 格式
- 日志：`log.info("[methodName] 描述, param: {}")` + 步骤计时
- 代码组织：校验 → 权限检查 → 数据准备 → 主逻辑 → 后处理
- **循环规范：禁止在 for/forEach 循环中调用外部接口或中间件（数据库、Feign、Redis 等），必须先批量获取全部数据 → 转为 Map → 循环中用 Map 匹配**

### Mapper 接口
- 继承 `MPJBaseMapper<Entity>` 获得通用 CRUD
- **禁止使用 `@Select` / `@Update` / `@Insert` / `@Delete` 注解定义 SQL**
- 所有自定义 SQL 必须写在对应的 XML 文件中
- 参数使用 `@Param` 命名

### MyBatis XML
- ResultMap 命名：`BaseResultMap`
- SQL 片段：`<sql id="Base_Column_List">`
- 参数：统一 `#{param}`，禁止 `${param}`
- LIKE：`CONCAT('%', #{param}, '%')`
- 软删除：所有查询加 `delete_flag = 0`
- 批量操作：`<foreach collection="list" item="item">`

### Entity
- 注解：`@Data` + `@NoArgsConstructor` + `@AllArgsConstructor` + `@Builder`
- 表映射：`@TableName("table_name")`
- 主键：`@TableId(value = "col_id", type = IdType.ASSIGN_ID)`
- 继承 `BaseEntity` 获得审计字段（creationDate, createdBy, lastUpdatedBy, lastUpdateDate, deleteFlag）
- 字段注释：`@Schema(description = "字段说明")`
- 序列化：`@JsonInclude(JsonInclude.Include.NON_NULL)` + `implements Serializable`