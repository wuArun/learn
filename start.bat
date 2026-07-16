@echo off
REM Spring AI Alibaba Agent 应用启动脚本 (Windows)

echo ================================
echo Spring AI Alibaba Agent 应用
echo ================================
echo.

REM 检查 Java
echo 🔍 检查 Java 版本...
java -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Java 未安装，请先安装 Java 17+
    pause
    exit /b 1
)
echo ✅ Java 已安装
echo.

REM 检查 Maven
echo 🔍 检查 Maven 安装...
mvn -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Maven 未安装
    pause
    exit /b 1
)
echo ✅ Maven 已安装
echo.

REM 编译项目
echo 📦 正在编译项目...
call mvn clean package -q
if errorlevel 1 (
    echo ❌ 编译失败
    pause
    exit /b 1
)
echo ✅ 编译成功
echo.

REM 启动应用
echo 🚀 正在启动应用...
echo.
echo 📱 访问地址: http://localhost:8080
echo 🛑 按 Ctrl+C 停止应用
echo.

java -jar target\learn-1.0.0.jar

pause
