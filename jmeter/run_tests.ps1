# PowerShell Runner for JMeter Performance & Load Tests
param (
    [string]$Target = "all",
    [int]$Users = 5,
    [int]$Duration = 60,
    [int]$LoopCount = 3,
    [string]$TodoistToken = "demo_token_placeholder"
)

$ErrorActionPreference = "Stop"

$workspaceRoot = Split-Path -Parent $PSScriptRoot
$jmeterDir = "$workspaceRoot\jmeter"
$resultsDir = "$jmeterDir\results"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

if (!(Test-Path $resultsDir)) {
    New-Item -ItemType Directory -Path $resultsDir -Force | Out-Null
}

$planMap = @{
    "all"      = "$jmeterDir\test-plans\Full_Multi_API_Performance_Suite.jmx"
    "heroku"   = "$jmeterDir\test-plans\Herokuapp_Performance_Test.jmx"
    "petstore" = "$jmeterDir\test-plans\Petstore_Performance_Test.jmx"
    "reqres"   = "$jmeterDir\test-plans\ReqRes_Performance_Test.jmx"
    "todoist"  = "$jmeterDir\test-plans\Todoist_Performance_Test.jmx"
}

if (-not $planMap.ContainsKey($Target.ToLower())) {
    Write-Host "[ERROR] Target '$Target' is invalid. Choose one of: all, heroku, petstore, reqres, todoist" -ForegroundColor Red
    exit 1
}

$jmxFile = $planMap[$Target.ToLower()]
$jtlFile = "$resultsDir\${Target}_${timestamp}.jtl"
$htmlReportDir = "$resultsDir\html_${Target}_${timestamp}"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "[START] JMETER PERFORMANCE TEST" -ForegroundColor Green
Write-Host "Target API   : $Target"
Write-Host "JMX File     : $jmxFile"
Write-Host "Virtual Users: $Users"
Write-Host "Duration     : $Duration s"
Write-Host "Output JTL   : $jtlFile"
Write-Host "HTML Report  : $htmlReportDir"
Write-Host "==========================================================" -ForegroundColor Cyan

$cmd = "jmeter -n -t `"$jmxFile`" -JUSERS=$Users -JDURATION=$Duration -JLOOP_COUNT=$LoopCount -JTODOIST_TOKEN=`"$TodoistToken`" -l `"$jtlFile`" -e -o `"$htmlReportDir`""

Write-Host "Running: $cmd" -ForegroundColor Yellow
Invoke-Expression $cmd

Write-Host ""
Write-Host "[SUCCESS] JMeter run finished successfully!" -ForegroundColor Green
$reportIndex = "$htmlReportDir\index.html"
Write-Host "[REPORT] HTML Dashboard: $reportIndex" -ForegroundColor Yellow
