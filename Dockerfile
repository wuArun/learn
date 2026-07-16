FROM openjdk:17-jdk-slim

LABEL maintainer="arun"
LABEL description="Spring AI Alibaba Agent Application"

WORKDIR /app

# 复制 maven 编译结果
COPY target/learn-1.0.0.jar app.jar

# 暴露端口
EXPOSE 8080

# 启动应用
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/api/agent/health || exit 1
