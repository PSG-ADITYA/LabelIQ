param(
  [string]$url,
  [string]$output,
  [string]$dimensions = "1400,950"
)

$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$args = @(
  "--headless",
  "--disable-gpu",
  "--run-all-compositor-stages-before-draw",
  "--virtual-time-budget=3000",
  "--window-size=$dimensions",
  "--screenshot=$output",
  $url
)

$proc = Start-Process -FilePath $chrome -ArgumentList $args -PassThru
$exited = $proc.WaitForExit(10000)
if (!$exited) {
  Stop-Process -Id $proc.Id -Force
}
if (Test-Path $output) {
  Write-Host "Success: Captured $output"
} else {
  Write-Host "Failed to capture $output"
}
