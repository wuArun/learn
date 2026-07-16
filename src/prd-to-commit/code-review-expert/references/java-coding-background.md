# Java Coding Standards - Background Information

This file contains supplementary background information for the java-coding-standards-checker skill.

## Purpose

The Java Coding Standards Checker is designed to automatically detect and report common Java coding standard violations in enterprise Spring Boot applications. It focuses on production-critical issues including:

- **Exception handling patterns**: Empty catch blocks, overly broad exceptions
- **Resource management**: try-with-resources, proper close() patterns
- **Thread safety**: Mutable static fields, concurrent collection usage
- **Code quality**: Deep nesting, magic numbers, long parameter lists
- **Framework-specific**: MQ listeners, Redis keys, transaction management
- **Security**: Sensitive data exposure, hardcoded secrets

## When to Use

This skill should be activated when:

1. **Code Review**: Before merging pull requests to catch common issues
2. **Refactoring**: Identifying technical debt in legacy code
3. **Onboarding**: Ensuring new team members follow conventions
4. **Audit**: Periodic code quality assessment

## Best Practices Summary

1. **Fail Fast**: Validate inputs early to prevent error propagation
2. **Immutability**: Prefer final fields and record classes
3. **Null Safety**: Use Optional with @Nullable/@NonNull annotations
4. **Modern APIs**: Use java.time, List.of, Map.of, Stream APIs
5. **Checked Exceptions**: Use cautiously, consider wrapping in runtime exceptions

## Transaction Strategy Decision Guide

| Scenario | Recommended Approach |
|----------|---------------------|
| Simple CRUD | `@Transactional(rollbackFor = Exception.class)` |
| IO + DB mixed | TransactionTemplate + compensation |
| Batch processing (partial success ok) | TransactionTemplate batch commit |
| Batch processing (all-or-nothing) | REQUIRES_NEW + PlatformTransactionManager |
| Post-commit notification/sync | TransactionSynchronizationManager.afterCommit() |

## Guard Clause Principles

1. **Precondition validation**: Validate parameters at method entry
2. **Early exit**: Use return/continue/break to reduce else branches
3. **Negative check first**: Handle edge/error cases before normal logic
4. **Single responsibility**: Each guard clause checks exactly one condition
5. **Keep flat**: Main logic stays at minimal nesting level

## Guard Clause Detection Patterns

| Scenario | Pattern |
|----------|---------|
| Parameter validation | `if (param == null) throw new IllegalArgumentException()` |
| Boundary condition | `if (list.isEmpty()) return;` |
| Permission check | `if (!hasPermission()) throw new SecurityException();` |
| State validation | `if (!object.isValid()) throw new BusinessException();` |
| Early return | `if (condition) return value;` |

## Best Practices (Enterprise)

- **Transactional boundaries**: Keep short, avoid network calls inside
- **Secrets**: Use vault/configuration server, never commit
- **Concurrency**: Prefer immutable objects and concurrent collections
- **Time**: Store UTC (Instant) in DB, convert at presentation layer
- **API**: Follow HTTP semantics, version from day one
- **Serialization**: Prefer JSON/Protobuf over Java serialization
- **Logging**: Audit log for sensitive operations, mask PII

## Integration

This skill works alongside:
- `spring-boot-reviewer`: Spring-specific pattern checking
- `orm-reviewer`: JPA/Hibernate pattern checking
- `code-reviewer`: General code quality checking
- `security-scanner`: Security audit

## Configuration

| Config | Default | Description |
|:-------|:--------|:------------|
| `JAVA_CHECK_TIMEOUT` | 30 | File read timeout (seconds) |
| `JAVA_CHECK_MAX_FILE_SIZE` | 100 | Max file size (KB) |
| `JAVA_CHECK_SKIP_DIRS` | target,build,.git | Directories to skip |

## Notes

- Based on Java 17+ best practices
- Encourages adoption of modern Java features
- Compatible with Maven and Gradle projects
- Supports Lombok and other code generators
- Rules follow progressive enhancement (backward compatible with older Java)

## Version History

### v1.4.0 (2026-07-09)
- New SQL & MyBatis detection rules (N+1 queries, SELECT *, missing indexes, long transaction with network calls, 15 rules)
- New resource/memory leak detection (IO streams, Apache POI/PDF/JDBC/EasyExcel leaks, ThreadLocal, static collections)
- Enhanced transaction detection: missing `rollbackFor = Exception.class`
- New large transaction detection: network calls in transaction, batch processing, missing timeout
- New read-only transaction `readOnly = true` detection, multi-datasource transaction detection
- Metadata: new tags for sql, mybatis, resource-leak, memory-leak, transaction

### v1.3.0 (2026-07-08)
- New Guard Clause optimization rules
- Detection patterns for deep nesting, parameter validation, early exit
- Guard clause applicable scenarios and principles

### v1.2.0 (2026-04-02)
- 9 new enterprise-level code standard check rules
- Transaction management (CRITICAL/HIGH)
- Sensitive data security (CRITICAL/HIGH)
- Thread safety & concurrency (CRITICAL/HIGH/MEDIUM)
- Date/time handling (HIGH/MEDIUM/LOW)
- RESTful API design (HIGH/MEDIUM)
- Cross-service call patterns (CRITICAL/HIGH/MEDIUM)
- Enum vs magic strings (MEDIUM/LOW)
- Serialization best practices (MEDIUM/HIGH)
- BigDecimal construction (HIGH/MEDIUM)
- Regex backtracking (MEDIUM/HIGH)
- i18n (LOW)
- Production assertions (HIGH/CRITICAL)

### v1.1.0 (2026-04-02)
- 8 new code standard check rules
- MQ listener patterns (CRITICAL/HIGH/MEDIUM)
- Redis key naming (CRITICAL/HIGH/MEDIUM/LOW)
- Unit testing best practices (CRITICAL/HIGH/MEDIUM/LOW)
- Null safety annotations (HIGH)
- Bean Validation annotations (HIGH)
- Structured logging (MEDIUM)
- Magic numbers (MEDIUM)
- Long parameter lists (MEDIUM)
- Deep nesting (MEDIUM)
- Member ordering (LOW)

### v1.0.0 (2026-04-02)
- Initial release
- 6 check categories (Critical/High/Medium/Low)
- Exception handling, resource management, null safety, streams, modern Java features
- Complete inspection workflow
- Maven and Gradle project support