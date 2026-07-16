param([string]$ClassFile, [string]$TestFile)

$srcMethods = @()
if (Test-Path $ClassFile) {
    $content = Get-Content $ClassFile -Raw
    $matches = [regex]::Matches($content, 'public\s+(\w+)\s+(\w+)\s*\([^)]*\)\s*{')
    foreach ($match in $matches) { $srcMethods += $match.Groups[2].Value }
}

$testMethods = @()
if ($TestFile -and (Test-Path $TestFile)) {
    $content = Get-Content $TestFile -Raw
    $matches = [regex]::Matches($content, '@Test\s+public\s+void\s+(\w+)\s*\(')
    foreach ($match in $matches) { $testMethods += $match.Groups[1].Value }
}

$covered = @(); $uncovered = @()
foreach ($method in $srcMethods) {
    $found = $false
    foreach ($tm in $testMethods) {
        if ($tm -like "*$method*") { $found = $true; break }
    }
    if ($found) { $covered += $method } else { $uncovered += $method }
}
Write-Output "$($covered -join ',')|$($uncovered -join ',')"