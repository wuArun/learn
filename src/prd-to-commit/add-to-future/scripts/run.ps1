param(
    [string]$ClassName
)

# 设置控制台编码为UTF-8
chcp 65001 > $null

Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "          Java单元测试生成器" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host ""

if (-not $ClassName) {
    Write-Host "❌ 错误: 请指定Java类名" -ForegroundColor Red
    Write-Host "用法: run.ps1 com.example.service.UserService" -ForegroundColor Yellow
    exit 1
}

Write-Host "📌 正在分析类: $ClassName" -ForegroundColor Yellow
Write-Host ""

# 步骤1: 查找Java源文件
Write-Host "[1/5] 查找Java源文件..." -ForegroundColor Cyan
$javaFile = & "$PSScriptRoot\find_class.ps1" -ClassName $ClassName -Type source
if (-not $javaFile) {
    Write-Host "❌ 找不到Java源文件: $ClassName" -ForegroundColor Red
    Write-Host "请在Java项目根目录运行此命令" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ 找到源文件: $javaFile" -ForegroundColor Green

# 步骤2: 查找测试文件
Write-Host "[2/5] 查找测试文件..." -ForegroundColor Cyan
$testFile = & "$PSScriptRoot\find_class.ps1" -ClassName $ClassName -Type test
if ($testFile) {
    Write-Host "✅ 找到测试文件: $testFile" -ForegroundColor Green
} else {
    Write-Host "ℹ️ 未找到测试文件，将创建新的测试类" -ForegroundColor Yellow
}

# 步骤3: 分析覆盖情况
Write-Host "[3/5] 分析测试覆盖情况..." -ForegroundColor Cyan
$coverage = & "$PSScriptRoot\analyze.ps1" -ClassFile $javaFile -TestFile $testFile
$covered = $coverage.split('|')[0]
$uncovered = $coverage.split('|')[1]

Write-Host "已覆盖方法: $covered" -ForegroundColor Green
Write-Host "未覆盖方法: $uncovered" -ForegroundColor Yellow

# 步骤4: 生成测试代码
Write-Host "[4/5] 生成测试代码..." -ForegroundColor Cyan
Write-Host ""
$testCode = & "$PSScriptRoot\generate.ps1" -ClassName $ClassName -JavaFile $javaFile -TestFile $testFile -Covered $covered -Uncovered $uncovered

Write-Host "============== 生成的测试代码 ==============" -ForegroundColor Magenta
Write-Host $testCode
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""

# 步骤5: 询问是否保存
$saveTest = Read-Host "💾 是否保存测试代码？(y/n)"
if ($saveTest -eq 'y' -or $saveTest -eq 'Y') {
    if (-not $testFile) {
        # 生成测试文件路径
        $testFile = $javaFile -replace 'main\\java', 'test\java'
        $testFile = $testFile -replace '\.java$', 'Test.java'
        $testDir = Split-Path $testFile -Parent
        if (-not (Test-Path $testDir)) {
            New-Item -ItemType Directory -Path $testDir -Force | Out-Null
        }
    }
    
    $testCode | Out-File -FilePath $testFile -Encoding utf8
    Write-Host "✅ 测试代码已保存到: $testFile" -ForegroundColor Green
    
    $runTest = Read-Host "🚀 是否运行测试？(y/n)"
    if ($runTest -eq 'y' -or $runTest -eq 'Y') {
        Write-Host "[5/5] 运行测试..." -ForegroundColor Cyan
        & "$PSScriptRoot\run_test.ps1" -TestClass "$($ClassName)Test"
    }
} else {
    Write-Host "测试代码未保存，您可以直接复制上面的代码" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ 分析完成！" -ForegroundColor Green