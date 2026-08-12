param(
  [switch]$Check
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$nodeScript = Join-Path $scriptDir 'apply-d2-wave3-platform.mjs'

if (-not (Test-Path $nodeScript)) {
  throw "[D2 Wave 3] Missing apply-d2-wave3-platform.mjs next to this wrapper."
}

$argsList = @($nodeScript)
if ($Check) { $argsList += '--check' }

node @argsList
if ($LASTEXITCODE -ne 0) {
  throw "[D2 Wave 3] Node patcher failed with exit code $LASTEXITCODE."
}
