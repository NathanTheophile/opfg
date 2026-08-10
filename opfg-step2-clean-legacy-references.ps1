$ErrorActionPreference = "Stop"

$ExpectedHead = "ea78befe061fdf83fa58af6690deb037a7cc3dcd"

$head = (git rev-parse HEAD).Trim()
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if ($head -ne $ExpectedHead) {
    Write-Host "ABORT : HEAD attendu $ExpectedHead, HEAD actuel $head" -ForegroundColor Red
    exit 1
}

$tracked = git status --porcelain --untracked-files=no
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if ($tracked) {
    Write-Host "ABORT : le working tree suivi par Git n'est pas propre :" -ForegroundColor Red
    $tracked
    exit 1
}

Write-Host "[1/4] Nettoyage de origin_to_childhood.json..." -ForegroundColor Cyan

$originPath = ".\src\game\content\events\origins\origin_to_childhood.json"
$origin = Get-Content $originPath -Raw | ConvertFrom-Json

$outcome = $origin.choices[0].resolution.outcome
$outcome.effects = @(
    [pscustomobject]@{
        type = "setCareerPhase"
        phase = "childhood"
    }
)

$origin | ConvertTo-Json -Depth 100 | Set-Content $originPath -Encoding UTF8

Write-Host "[2/4] Mise à jour de eventCatalog.test.ts..." -ForegroundColor Cyan

$eventCatalogPath = ".\tests\eventCatalog.test.ts"
$text = Get-Content $eventCatalogPath -Raw

# Retire childhood_memory de la liste principale.
$text = $text.Replace("      'childhood_memory',`r`n", "")
$text = $text.Replace("      'childhood_memory',`n", "")

# Supprime le test entier des 20 fixtures.
$text = [regex]::Replace(
    $text,
    "(?ms)\r?\n  it\('contains all twenty explicit Childhood fixtures', \(\) => \{.*?\r?\n  \}\);\r?\n",
    "`r`n"
)

# childhood_memory ne doit plus être attendu parmi les Scheduled.
$text = $text.Replace("        'childhood_memory',`r`n", "")
$text = $text.Replace("        'childhood_memory',`n", "")

Set-Content $eventCatalogPath $text -Encoding UTF8

Write-Host "[3/4] Mise à jour de contentValidation.test.ts..." -ForegroundColor Cyan

$contentValidationPath = ".\tests\contentValidation.test.ts"
$text = Get-Content $contentValidationPath -Raw

$oldSea = "    eventById(catalog, 'childhood_middle').eligibility.conditions[3].conditions[0].seaId = 'missing_sea';"
$newSea = "    eventById(catalog, 'origin_name').eligibility = { type: 'originSeaIs', seaId: 'missing_sea' };"

if (-not $text.Contains($oldSea)) {
    Write-Host "ABORT : référence childhood_middle attendue introuvable dans contentValidation.test.ts" -ForegroundColor Red
    exit 1
}
$text = $text.Replace($oldSea, $newSea)

$text = $text.Replace(
    "    eventById(catalog, 'childhood_memory').scheduledReach = 'teleport';",
    "    eventById(catalog, 'mira_returns_favor').scheduledReach = 'teleport';"
)
$text = $text.Replace(
    "    eventById(catalog, 'childhood_memory').fallbackEventId = 'departure';",
    "    eventById(catalog, 'mira_returns_favor').fallbackEventId = 'departure';"
)

Set-Content $contentValidationPath $text -Encoding UTF8

Write-Host "[4/4] Contrôle des résidus legacy..." -ForegroundColor Cyan

$pattern = 'childhood_fixture_|childhood_(early|middle|late|final|memory|to_active)'
$roots = @(".\src", ".\tests", ".\scripts") | Where-Object { Test-Path $_ }

$hits = Get-ChildItem $roots -Recurse -File |
    Select-String -Pattern $pattern

if ($hits) {
    Write-Host ""
    Write-Host "ERREUR : références legacy restantes :" -ForegroundColor Red
    $hits | Select-Object Path, LineNumber, Line | Format-Table -AutoSize
    exit 1
}

Write-Host ""
Write-Host "Aucune référence legacy restante dans src/tests/scripts." -ForegroundColor Green

Write-Host ""
Write-Host "=== validate-content ===" -ForegroundColor Cyan
& npm.cmd run validate-content
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Étape 2 terminée. Aucun test gameplay complet lancé pour l'instant." -ForegroundColor Green
Write-Host "Les prochains échecs éventuels de npm test seront traités séparément comme problèmes de couverture/comportement, pas comme résidus legacy." -ForegroundColor Yellow
