param(
  [switch]$Check
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$nodeScript = Join-Path $scriptDir 'apply-d21-content-reset.mjs'

if (-not (Test-Path $nodeScript)) {
  throw "[D2.1] Missing apply-d21-content-reset.mjs next to this PowerShell wrapper."
}

$arguments = @($nodeScript)
if ($Check) { $arguments += '--check' }

node @arguments
if ($LASTEXITCODE -ne 0) {
  throw "[D2.1] Node patcher failed with exit code $LASTEXITCODE."
}
