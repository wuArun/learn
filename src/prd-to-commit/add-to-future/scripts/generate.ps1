param([string]$ClassName, [string]$JavaFile, [string]$TestFile, [string]$Covered, [string]$Uncovered)

$uncoveredMethods = $Uncovered.Split(',', [StringSplitOptions]::RemoveEmptyEntries)
if ($ClassName -match '(.+)\.([^\.]+)$') { $package = $matches[1]; $simpleName = $matches[2] } 
else { $package = ""; $simpleName = $ClassName }

if (-not $TestFile -or -not (Test-Path $TestFile)) {
    # 生成新测试类
    @"
package $package;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ${simpleName}Test {

    @Test
    void testExample() {
        // TODO: 实现测试
        assertTrue(true);
    }
$(foreach ($m in $uncoveredMethods) {
@"

    @Test
    void test${m}_Success() {
        // TODO: 测试 $m
    }
"@
})

}
"@
} else {
    # 只为未覆盖方法生成代码片段
    if ($uncoveredMethods.Count -eq 0) { Write-Output "所有方法已覆盖，无需生成"; exit }
    $result = @"
// 为以下方法生成的测试代码：
$(foreach ($m in $uncoveredMethods) { "// - $m`n" })

"@
    foreach ($m in $uncoveredMethods) {
        $result += @"
    @Test
    void test${m}_Success() {
        // 准备
        // 执行
        // 验证
    }

"@
    }
    Write-Output $result
}