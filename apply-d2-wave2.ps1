$ErrorActionPreference = 'Stop'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$argsList = @()
if (($args -contains '--check') -or ($args -contains '-check')) { $argsList += '--check' }
node (Join-Path $scriptDir 'apply-d2-wave2.mjs') @argsList
