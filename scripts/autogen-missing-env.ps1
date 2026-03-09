$ErrorActionPreference = 'Stop'

function New-RandomSecret([int]$bytes = 32) {
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  $data = New-Object byte[] $bytes
  $rng.GetBytes($data)
  return [Convert]::ToBase64String($data).TrimEnd('=').Replace('+','-').Replace('/','_')
}

$vars = @{
  API_AUTH_KEY = New-RandomSecret 32
  GROQ_API_KEY = ''
  NETLIFY_AUTH_TOKEN = ''
  NETLIFY_SITE_ID = ''
  RENDER_API_KEY = ''
  RENDER_SERVICE_ID = ''
  PUBLIC_BACKEND_URL = ''
  PUBLIC_FRONTEND_URL = ''
}

$lines = @()
foreach($k in $vars.Keys){
  $lines += "$k=$($vars[$k])"
}

$out = Join-Path $PSScriptRoot '..\deploy-secrets.env'
$lines | Set-Content $out
Write-Host "Generated $out"
Write-Host "API_AUTH_KEY generated. External provider credentials remain blank by design."
