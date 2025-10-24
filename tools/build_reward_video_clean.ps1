<#
  Clean PowerShell helper to build a reward MP4 from storyboard.json using ffmpeg.
  Place this file in the project root and run it after installing ffmpeg.
  It is a safer replacement to the other script and intentionally small.
#>
param(
  [string]$Storyboard = 'storyboard.json',
  [string]$Output = 'reward_video.mp4',
  [int]$Width = 1280,
  [int]$Height = 720
)

if(-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)){
  Write-Error 'ffmpeg is not available in PATH. Install ffmpeg and re-run this script.'
  exit 1
}

if(-not (Test-Path $Storyboard)){
  Write-Error "Storyboard not found: $Storyboard"
  exit 1
}

$json = Get-Content $Storyboard -Raw | ConvertFrom-Json
$tmpDir = Join-Path $env:TEMP ("reward_build_{0}" -f (Get-Random))
New-Item -ItemType Directory -Path $tmpDir | Out-Null

$idx = 0
$concatFile = Join-Path $tmpDir 'concat.txt'

foreach($item in $json){
  $src = $item.src
  $dur = [int]([math]::Round(($item.duration/1000),0))
  if($dur -le 0){ $dur = 5 }
  $type = if($item.type){ $item.type } else { 'img' }
  $out = Join-Path $tmpDir ("slide_{0:D3}.mp4" -f $idx)

  if($type -eq 'img'){
    Write-Host "Rendering image -> video: $src ($dur s)"
    & ffmpeg -y -loop 1 -i $src -vf "scale=${Width}:${Height},format=yuv420p" -t $dur -c:v libx264 -preset veryfast -crf 18 $out
  }else{
    Write-Host "Re-encoding video: $src ($dur s)"
    & ffmpeg -y -i $src -vf "scale=${Width}:${Height},format=yuv420p" -t $dur -c:v libx264 -preset veryfast -crf 18 $out
  }

  Add-Content -Path $concatFile -Value ("file '{0}'" -f $out)
  $idx++
}

$slidesOut = Join-Path $tmpDir 'slides_concat.mp4'
Write-Host 'Concatenating slides...'
& ffmpeg -y -f concat -safe 0 -i $concatFile -c copy $slidesOut

# audio concatenation (if both exist)
$audio1 = 'PANGAKO - Rey Valera (Cover) [JHINO OFFICIAL] Acoustic Live.mp3'
$audio2 = 'Maging Sino Ka Man - Rey Valera [Jhino Bilbao Cover] (Acoustic Live).mp3'
$audioConcat = Join-Path $tmpDir 'audio_concat.mp3'

if(Test-Path $audio1 -and Test-Path $audio2){
  Write-Host 'Concatenating audio tracks...'
  $alist = Join-Path $tmpDir 'alist.txt'
  ("file '{0}'" -f $audio1) | Out-File -Encoding utf8 $alist
  ("file '{0}'" -f $audio2) | Out-File -Encoding utf8 -Append $alist
  & ffmpeg -y -f concat -safe 0 -i $alist -c copy $audioConcat
}

if(Test-Path $audioConcat){
  Write-Host 'Merging audio and slides into final video...'
  & ffmpeg -y -i $slidesOut -i $audioConcat -c:v copy -c:a aac -b:a 192k $Output
}else{
  Copy-Item $slidesOut $Output -Force
}

Write-Host "Done. Output: $Output"
Write-Host "Temporary files: $tmpDir"
