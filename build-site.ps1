param(
  [string]$OutputFolder = "site-dist"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$output = Join-Path $root $OutputFolder

$requiredFiles = @("index.html", "styles.css", "script.js")
$optionalRootFiles = @("robots.txt", "sitemap.xml", ".nojekyll")

foreach ($file in $requiredFiles) {
  $path = Join-Path $root $file
  if (-not (Test-Path $path)) {
    throw "Missing required file: $file"
  }
}

$resolvedRoot = (Resolve-Path $root).Path
$resolvedOutputParent = (Resolve-Path (Split-Path -Parent $output)).Path
if ($resolvedOutputParent -ne $resolvedRoot) {
  throw "Output folder must be inside the website folder."
}

if (Test-Path $output) {
  Remove-Item -LiteralPath $output -Recurse -Force
}

New-Item -ItemType Directory -Path $output | Out-Null

foreach ($file in $requiredFiles) {
  Copy-Item -LiteralPath (Join-Path $root $file) -Destination $output
}

foreach ($file in $optionalRootFiles) {
  $path = Join-Path $root $file
  if (Test-Path $path) {
    Copy-Item -LiteralPath $path -Destination $output
  }
}

$assetsPath = Join-Path $root "assets"
if (Test-Path $assetsPath) {
  Copy-Item -LiteralPath $assetsPath -Destination $output -Recurse
}

Get-ChildItem -LiteralPath $root -File -Filter "*.md" | ForEach-Object {
  Copy-Item -LiteralPath $_.FullName -Destination $output
}

Write-Host "Created publish folder: $output"
