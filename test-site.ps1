param(
  [string]$RootFolder = "."
)

$ErrorActionPreference = "Stop"

$root = (Resolve-Path $RootFolder).Path
$errors = New-Object System.Collections.Generic.List[string]
$warnings = New-Object System.Collections.Generic.List[string]

function Add-ErrorMessage([string]$message) {
  $errors.Add($message) | Out-Null
}

function Add-WarningMessage([string]$message) {
  $warnings.Add($message) | Out-Null
}

function Resolve-SitePath([string]$baseFolder, [string]$relativePath) {
  $cleanPath = $relativePath.Split("?")[0].Split("#")[0]
  if ([string]::IsNullOrWhiteSpace($cleanPath)) {
    return $null
  }

  $decodedPath = [Uri]::UnescapeDataString($cleanPath)
  return Join-Path $baseFolder ($decodedPath -replace "/", [IO.Path]::DirectorySeparatorChar)
}

$requiredFiles = @("index.html", "styles.css", "script.js")
foreach ($file in $requiredFiles) {
  if (-not (Test-Path (Join-Path $root $file))) {
    Add-ErrorMessage "Missing required file: $file"
  }
}

$indexPath = Join-Path $root "index.html"
if (Test-Path $indexPath) {
  $html = Get-Content -Raw -LiteralPath $indexPath

  if ($html -match "C:\\|file://") {
    Add-ErrorMessage "index.html contains a local computer path. Use a relative assets/ path instead."
  }

  if ($html -notmatch '<meta\s+charset=["'']?UTF-8["'']?') {
    Add-WarningMessage "index.html should include a UTF-8 charset meta tag."
  }

  if ($html -notmatch '<meta\s+name=["'']viewport["'']') {
    Add-WarningMessage "index.html should include a responsive viewport meta tag."
  }

  $linkPattern = '(?i)(?:src|href)=["'']([^"'']+)["'']'
  foreach ($match in [regex]::Matches($html, $linkPattern)) {
    $url = $match.Groups[1].Value.Trim()
    if (
      $url -eq "" -or
      $url.StartsWith("#") -or
      $url -match "^(https?:|mailto:|tel:|javascript:|data:)"
    ) {
      continue
    }

    $target = Resolve-SitePath $root $url
    if ($target -and -not (Test-Path $target)) {
      Add-ErrorMessage "Broken file reference in index.html: $url"
    }
  }
}

$cssPath = Join-Path $root "styles.css"
if (Test-Path $cssPath) {
  $css = Get-Content -Raw -LiteralPath $cssPath
  if ($css -match "C:\\|file://") {
    Add-ErrorMessage "styles.css contains a local computer path. Use a relative assets/ path instead."
  }

  foreach ($match in [regex]::Matches($css, '(?i)url\(([^)]+)\)')) {
    $url = $match.Groups[1].Value.Trim().Trim("'").Trim('"')
    if ($url -eq "" -or $url -match "^(https?:|data:)") {
      continue
    }

    $target = Resolve-SitePath $root $url
    if ($target -and -not (Test-Path $target)) {
      Add-ErrorMessage "Broken file reference in styles.css: $url"
    }
  }
}

$jsPath = Join-Path $root "script.js"
if (Test-Path $jsPath) {
  $js = Get-Content -Raw -LiteralPath $jsPath
  if ($js -match "C:\\|file://") {
    Add-ErrorMessage "script.js contains a local computer path. Use a relative assets/ path instead."
  }
}

if ($warnings.Count -gt 0) {
  Write-Host "Warnings:"
  foreach ($warning in $warnings) {
    Write-Host " - $warning"
  }
}

if ($errors.Count -gt 0) {
  Write-Host "Test failed:"
  foreach ($errorMessage in $errors) {
    Write-Host " - $errorMessage"
  }
  exit 1
}

Write-Host "Site tests passed."
