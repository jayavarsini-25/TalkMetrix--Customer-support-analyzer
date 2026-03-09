param(
  [Parameter(Mandatory = $true)][string]$FrontendUrl,
  [Parameter(Mandatory = $true)][string]$BackendUrl
)

$ErrorActionPreference = 'Stop'

function Assert-Status {
  param([string]$Url, [int]$Expected = 200)
  $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 30
  if ($resp.StatusCode -ne $Expected) {
    throw "Expected $Expected from $Url but got $($resp.StatusCode)"
  }
  Write-Host "OK $Url -> $($resp.StatusCode)"
}

Assert-Status -Url $FrontendUrl
Assert-Status -Url ("{0}/healthz" -f $BackendUrl.TrimEnd('/'))

$summary = Invoke-RestMethod -Uri ("{0}/dashboard/summary" -f $BackendUrl.TrimEnd('/')) -Method Get -TimeoutSec 30
if ($null -eq $summary.avgScore) {
  throw 'Dashboard summary missing avgScore'
}
Write-Host "OK dashboard summary avgScore=$($summary.avgScore)"

$preflight = Invoke-WebRequest -Uri ("{0}/dashboard/summary" -f $BackendUrl.TrimEnd('/')) `
  -Method Options `
  -Headers @{
    Origin = $FrontendUrl.TrimEnd('/')
    "Access-Control-Request-Method" = "GET"
  } `
  -UseBasicParsing `
  -TimeoutSec 30
if (-not $preflight.Headers["Access-Control-Allow-Origin"]) {
  throw 'CORS preflight missing access-control-allow-origin'
}
Write-Host 'OK CORS preflight'

Write-Host 'Smoke tests passed.'
