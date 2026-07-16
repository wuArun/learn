param(
    [string]$ClassName,
    [string]$Type
)

$pathParts = $ClassName.Split('.')
$fileName = $pathParts[-1]
$packagePath = ($pathParts[0..($pathParts.Length-2)] -join '\')

if ($Type -eq "source") {
    $searchPaths = @(
        ".\src\main\java\$packagePath\$fileName.java",
        ".\src\$packagePath\$fileName.java"
    )
} else {
    $testNames = @("${fileName}Test.java", "${fileName}Tests.java", "Test${fileName}.java")
    $searchPaths = @()
    foreach ($testName in $testNames) {
        $searchPaths += ".\src\test\java\$packagePath\$testName"
    }
}

foreach ($path in $searchPaths) {
    if (Test-Path $path) {
        Write-Output $path
        exit 0
    }
}
Write-Output ""