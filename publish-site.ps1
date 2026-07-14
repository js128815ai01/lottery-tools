param(
  [string]$OutputFolder = "site-dist"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Running site tests..."
& (Join-Path $root "test-site.ps1") -RootFolder $root

Write-Host "Building publish folder..."
& (Join-Path $root "build-site.ps1") -OutputFolder $OutputFolder

Write-Host "Publish package is ready."
