param(
  [string]$OutputFolder = "site-dist"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
& (Join-Path $root "build-site.ps1") -OutputFolder $OutputFolder
