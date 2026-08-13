param(
  [switch]$Verify
)

$ErrorActionPreference = "Stop"
$Bundle = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "== Apply D2.11 authority + inheritance rework V3.1 =="
node "$Bundle\apply-family-authority-inheritance-v3.mjs"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

foreach ($Saga in @("family_marine", "family_pirate", "family_royal")) {
  Write-Host ""
  Write-Host "== Compile $Saga =="
  npx jiti scripts/saga-content.ts compile $Saga
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

  Write-Host ""
  Write-Host "== Check $Saga =="
  npx jiti scripts/saga-content.ts check $Saga
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

if ($Verify) {
  Write-Host ""
  Write-Host "== Tests =="
  npm test
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

  Write-Host ""
  Write-Host "== Content validation =="
  npm run validate-content
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

  Write-Host ""
  Write-Host "== Build =="
  npm run build
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host ""
Write-Host "D2.11 Family authority + inheritance rework V3.1 completed successfully."
