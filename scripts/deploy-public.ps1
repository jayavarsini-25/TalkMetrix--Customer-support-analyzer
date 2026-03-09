$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$backendDir = Join-Path $root 'talkmetrix-backend'
$frontendDir = Join-Path $root 'talkmetrix-insights'

function Require-Env([string]$Name) {
  if (-not (Test-Path "Env:$Name") -or [string]::IsNullOrWhiteSpace((Get-Item "Env:$Name").Value)) {
    throw "Missing required environment variable: $Name"
  }
}

Require-Env 'NETLIFY_AUTH_TOKEN'
Require-Env 'NETLIFY_SITE_ID'
Require-Env 'RENDER_API_KEY'
Require-Env 'RENDER_SERVICE_ID'
Require-Env 'PUBLIC_BACKEND_URL'

$backendUrl = $env:PUBLIC_BACKEND_URL.TrimEnd('/')

Write-Host 'Building frontend...'
Push-Location $frontendDir
$env:VITE_API_BASE_URL = $backendUrl
npm ci
npm run build

Write-Host 'Deploying frontend to Netlify...'
npx --yes netlify-cli deploy --prod --dir dist --site $env:NETLIFY_SITE_ID --auth $env:NETLIFY_AUTH_TOKEN --message 'Automated production deploy'
Pop-Location

Write-Host 'Triggering backend deploy on Render...'
$headers = @{
  Authorization = "Bearer $($env:RENDER_API_KEY)"
  Accept = 'application/json'
  'Content-Type' = 'application/json'
}
$deployResp = Invoke-RestMethod -Method Post -Uri "https://api.render.com/v1/services/$($env:RENDER_SERVICE_ID)/deploys" -Headers $headers -Body '{}'
$deployId = $deployResp.id
if (-not $deployId) {
  throw 'Render deploy trigger failed (no deploy id returned).'
}
Write-Host "Render deploy id: $deployId"

$maxAttempts = 60
for ($i = 1; $i -le $maxAttempts; $i++) {
  Start-Sleep -Seconds 10
  $statusResp = Invoke-RestMethod -Method Get -Uri "https://api.render.com/v1/services/$($env:RENDER_SERVICE_ID)/deploys/$deployId" -Headers $headers
  $status = $statusResp.status
  Write-Host "Render deploy status: $status (attempt $i/$maxAttempts)"
  if ($status -eq 'live') { break }
  if ($status -in @('build_failed', 'update_failed', 'canceled')) {
    throw "Render deployment failed with status: $status"
  }
  if ($i -eq $maxAttempts) {
    throw 'Render deployment timed out.'
  }
}

Write-Host 'Running smoke tests...'
Push-Location $root
if (-not (Test-Path Env:PUBLIC_FRONTEND_URL) -or [string]::IsNullOrWhiteSpace((Get-Item Env:PUBLIC_FRONTEND_URL).Value)) {
  throw 'Missing required environment variable: PUBLIC_FRONTEND_URL'
}
./scripts/smoke-test.ps1 -FrontendUrl $env:PUBLIC_FRONTEND_URL -BackendUrl $backendUrl
Pop-Location

Write-Host 'Public deployment complete.'
