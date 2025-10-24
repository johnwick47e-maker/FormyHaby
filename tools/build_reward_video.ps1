# PowerShell script to stitch slideshow + audio into a single MP4 using ffmpeg
# Usage: run from project folder where media files and storyboard.json exist
# Example: powershell -ExecutionPolicy Bypass -File .\tools\build_reward_video.ps1
# PowerShell script to stitch slideshow + audio into a single MP4 using ffmpeg
# Usage: run from project folder where media files and storyboard.json exist
# Example: powershell -ExecutionPolicy Bypass -File .\tools\build_reward_video.ps1
param(
    [string]$Storyboard = 'storyboard.json',
    [string]$Output = 'reward_video.mp4',
    [int]$Width = 1280,
    [int]$Height = 720
)
if(!(Get-Command ffmpeg -ErrorAction SilentlyContinue)){
    Write-Error "ffmpeg not found in PATH. Please install ffmpeg and try again."
    exit 1
}
try{
    $json = Get-Content $Storyboard -Raw | ConvertFrom-Json
}catch{
    Write-Error "Could not read storyboard: $Storyboard"
    exit 1
}

$tmpDir = Join-Path $env:TEMP ("reward_build_{0}" -f (Get-Random))
New-Item -ItemType Directory -Path $tmpDir | Out-Null

$index = 0
$concatList = Join-Path $tmpDir "concat.txt"

foreach($item in $json){
    $src = $item.src
    $dur = [int]([math]::Round(($item.duration/1000),0))
    if($dur -le 0){ $dur = 5 }
    $type = if($item.type){ $item.type } else { 'img' }
    $tmpfile = Join-Path $tmpDir ("slide_{0:D3}.mp4" -f $index)

    $vf = ("scale={0}:{1},format=yuv420p" -f $Width,$Height)
    if($type -eq 'img'){
        # create video from static image
        $argList = @('-y','-loop','1','-i',$src,'-vf',$vf,'-t',$dur.ToString(),'-c:v','libx264','-preset','veryfast','-crf','18',$tmpfile)
        Write-Host "Running: ffmpeg $($argList -join ' ')"
        Start-Process -FilePath ffmpeg -ArgumentList $argList -NoNewWindow -Wait
    }else{
        # re-encode/trim video
        $argList = @('-y','-i',$src,'-vf',$vf,'-t',$dur.ToString(),'-c:v','libx264','-preset','veryfast','-crf','18',$tmpfile)
        Write-Host "Running: ffmpeg $($argList -join ' ')"
        Start-Process -FilePath ffmpeg -ArgumentList $argList -NoNewWindow -Wait
    }

    Add-Content -Path $concatList -Value ("file '{0}'" -f $tmpfile)
    $index++
}

# Concatenate slides into one video
$finalTmp = Join-Path $tmpDir "slides_concat.mp4"
Start-Process -FilePath ffmpeg -ArgumentList @('-y','-f','concat','-safe','0','-i',$concatList,'-c','copy',$finalTmp) -NoNewWindow -Wait

# Concatenate audio tracks if more than one (edit names if necessary)
$audio1 = 'PANGAKO - Rey Valera (Cover) [JHINO OFFICIAL] Acoustic Live.mp3'
$audio2 = 'Maging Sino Ka Man - Rey Valera [Jhino Bilbao Cover] (Acoustic Live).mp3'
$audioConcat = Join-Path $tmpDir 'audio_concat.mp3'

if(Test-Path $audio1 -and Test-Path $audio2){
    $alist = Join-Path $tmpDir 'alist.txt'
    "file '{0}'" -f $audio1 | Out-File -Encoding utf8 $alist
    "file '{0}'" -f $audio2 | Out-File -Encoding utf8 -Append $alist
    Start-Process -FilePath ffmpeg -ArgumentList @('-y','-f','concat','-safe','0','-i',$alist,'-c','copy',$audioConcat) -NoNewWindow -Wait
}

# Merge audio and video
if(Test-Path $audioConcat){
    Start-Process -FilePath ffmpeg -ArgumentList @('-y','-i',$finalTmp,'-i',$audioConcat,'-c:v','copy','-c:a','aac','-b:a','192k',$Output) -NoNewWindow -Wait
}else{
    Copy-Item $finalTmp $Output -Force
}

Write-Host "Output created: $Output"
Write-Host "Temporary files in: $tmpDir (you can remove them when done)"
try{
    $json = Get-Content $Storyboard -Raw | ConvertFrom-Json
}catch{
    Write-Error "Could not read storyboard: $Storyboard"
    exit 1
}
$tmpDir = Join-Path $env:TEMP ("reward_build_{0}" -f (Get-Random))
New-Item -ItemType Directory -Path $tmpDir | Out-Null

$index = 0
$concatList = Join-Path $tmpDir "concat.txt"

foreach($item in $json){
    $src = $item.src
    $dur = [int]([math]::Round(($item.duration/1000),0))
    if($dur -le 0){ $dur = 5 }
    $type = if($item.type){ $item.type } else { 'img' }
    $tmpfile = Join-Path $tmpDir ("slide_{0:D3}.mp4" -f $index)
    $vf = ("scale={0}:{1},format=yuv420p" -f $Width,$Height)
    if($type -eq 'img'){
        # create video from static image
    $argList = @('-y','-loop','1','-i',$src,'-vf',$vf,'-t',$dur.ToString(),'-c:v','libx264','-preset','veryfast','-crf','18',$tmpfile)
    Write-Host "Running: ffmpeg $($argList -join ' ')"
    Start-Process -FilePath ffmpeg -ArgumentList $argList -NoNewWindow -Wait
    }else{
        # re-encode/trim video
        $argList = @('-y','-i',$src,'-vf',$vf,'-t',$dur.ToString(),'-c:v','libx264','-preset','veryfast','-crf','18',$tmpfile)
        Write-Host "Running: ffmpeg $($argList -join ' ')"
        Start-Process -FilePath ffmpeg -ArgumentList $argList -NoNewWindow -Wait
    }
    Add-Content -Path $concatList -Value ("file '{0}'" -f $tmpfile)
    $index++
}
# Concatenate slides into one video
$finalTmp = Join-Path $tmpDir "slides_concat.mp4"
Start-Process -FilePath ffmpeg -ArgumentList @('-y','-f','concat','-safe','0','-i',$concatList,'-c','copy',$finalTmp) -NoNewWindow -Wait
# Concatenate audio tracks if more than one (edit names if necessary)
$audio1 = 'PANGAKO - Rey Valera (Cover) [JHINO OFFICIAL] Acoustic Live.mp3'
$audio2 = 'Maging Sino Ka Man - Rey Valera [Jhino Bilbao Cover] (Acoustic Live).mp3'
$audioConcat = Join-Path $tmpDir 'audio_concat.mp3'

if(Test-Path $audio1 -and Test-Path $audio2){
    $alist = Join-Path $tmpDir 'alist.txt'
    "file '{0}'" -f $audio1 | Out-File -Encoding utf8 $alist
    "file '{0}'" -f $audio2 | Out-File -Encoding utf8 -Append $alist
    Start-Process -FilePath ffmpeg -ArgumentList @('-y','-f','concat','-safe','0','-i',$alist,'-c','copy',$audioConcat) -NoNewWindow -Wait
}

# Merge audio and video
if(Test-Path $audioConcat){
    Start-Process -FilePath ffmpeg -ArgumentList @('-y','-i',$finalTmp,'-i',$audioConcat,'-c:v','copy','-c:a','aac','-b:a','192k',$Output) -NoNewWindow -Wait
}else{
    Copy-Item $finalTmp $Output -Force
}

Write-Host "Output created: $Output"
Write-Host "Temporary files in: $tmpDir (you can remove them when done)"
# PowerShell script to stitch slideshow + audio into a single MP4 using ffmpeg
# Usage: run from project folder where media files and storyboard.json exist
# Example: powershell -ExecutionPolicy Bypass -File .\tools\build_reward_video.ps1

param(
    [string]$Storyboard = 'storyboard.json',
    [string]$Output = 'reward_video.mp4',
    [int]$Width = 1280,
    [int]$Height = 720
)

if(!(Get-Command ffmpeg -ErrorAction SilentlyContinue)){
    Write-Error "ffmpeg not found in PATH. Please install ffmpeg and try again."
    exit 1
}

$json = Get-Content $Storyboard -Raw | ConvertFrom-Json
$tmpDir = Join-Path $env:TEMP "reward_build_$(Get-Random)"
New-Item -ItemType Directory -Path $tmpDir | Out-Null

$index = 0
$inputs = @()
$filters = @()
$concatList = Join-Path $tmpDir "concat.txt"

foreach($item in $json){
    $src = $item.src
    $dur = [int]([math]::Round(($item.duration/1000),0))
    $type = $item.type
    $tmpfile = Join-Path $tmpDir ("slide_{0:D3}.mp4" -f $index)
    if($type -eq 'img'){
        # create a video from image for $dur seconds with pan/zoom
        $cmd = "-y -loop 1 -i `"$src`" -vf \"scale=$Width:$Height,format=yuv420p\" -t $dur -c:v libx264 -preset veryfast -crf 18 `"$tmpfile`""
        $inputs += $cmd
    }else{
        # re-encode video to match size and trim/pad to duration
        $cmd = "-y -i `"$src`" -vf \"scale=$Width:$Height,format=yuv420p\" -t $dur -c:v libx264 -preset veryfast -crf 18 `"$tmpfile`""
        $inputs += $cmd
    }
    # add to concat list
    Add-Content -Path $concatList -Value "file '$tmpfile'"
    $index++
}

# Run ffmpeg per input command (this is simplistic but works on many setups)
foreach($c in $inputs){
    Write-Host "Running: ffmpeg $c"
    ffmpeg $c
}

# Concatenate slides
$finalTmp = Join-Path $tmpDir "slides_concat.mp4"
ffmpeg -y -f concat -safe 0 -i `"$concatList`" -c copy `"$finalTmp`"

# Concatenate audio tracks if multiple
$audio1 = 'PANGAKO - Rey Valera (Cover) [JHINO OFFICIAL] Acoustic Live.mp3'
$audio2 = 'Maging Sino Ka Man - Rey Valera [Jhino Bilbao Cover] (Acoustic Live).mp3'
$audioConcat = Join-Path $tmpDir 'audio_concat.mp3'

if(Test-Path $audio1 -and Test-Path $audio2){
    $alist = Join-Path $tmpDir 'alist.txt'
    "file '$audio1'" | Out-File -Encoding utf8 $alist
    "file '$audio2'" | Out-File -Encoding utf8 -Append $alist
    ffmpeg -y -f concat -safe 0 -i `"$alist`" -c copy `"$audioConcat`"
}

# Merge audio and video
# PowerShell script to stitch slideshow + audio into a single MP4 using ffmpeg
# Usage: run from project folder where media files and storyboard.json exist
# Example: powershell -ExecutionPolicy Bypass -File .\tools\build_reward_video.ps1

param(
    [string]$Storyboard = 'storyboard.json',
    [string]$Output = 'reward_video.mp4',
    [int]$Width = 1280,
    [int]$Height = 720
)

if(!(Get-Command ffmpeg -ErrorAction SilentlyContinue)){
    Write-Error "ffmpeg not found in PATH. Please install ffmpeg and try again."
    exit 1
}

$json = Get-Content $Storyboard -Raw | ConvertFrom-Json
$tmpDir = Join-Path $env:TEMP ("reward_build_{0}" -f (Get-Random))
New-Item -ItemType Directory -Path $tmpDir | Out-Null

$index = 0
$concatList = Join-Path $tmpDir "concat.txt"

foreach($item in $json){
    $src = $item.src
    $dur = [int]([math]::Round(($item.duration/1000),0))
    if($dur -le 0){ $dur = 5 }
    $type = $item.type
    $tmpfile = Join-Path $tmpDir ("slide_{0:D3}.mp4" -f $index)

    $vf = ("scale={0}:{1},format=yuv420p" -f $Width,$Height)
    if($type -eq 'img'){
        # create a video from image for $dur seconds
        $argList = @('-y','-loop','1','-i',$src,'-vf',$vf,'-t',$dur.ToString(),'-c:v','libx264','-preset','veryfast','-crf','18',$tmpfile)
        Write-Host "Running: ffmpeg $($argList -join ' ')"
        Start-Process -FilePath ffmpeg -ArgumentList $argList -NoNewWindow -Wait
    }else{
        # re-encode video to match size and trim/pad to duration
        $argList = @('-y','-i',$src,'-vf',$vf,'-t',$dur.ToString(),'-c:v','libx264','-preset','veryfast','-crf','18',$tmpfile)
        Write-Host "Running: ffmpeg $($argList -join ' ')"
        Start-Process -FilePath ffmpeg -ArgumentList $argList -NoNewWindow -Wait
    }

    Add-Content -Path $concatList -Value ("file '{0}'" -f $tmpfile)
    $index++
}

# Concatenate slides
$finalTmp = Join-Path $tmpDir "slides_concat.mp4"
Start-Process -FilePath ffmpeg -ArgumentList @('-y','-f','concat','-safe','0','-i',$concatList,'-c','copy',$finalTmp) -NoNewWindow -Wait

# Concatenate audio tracks if multiple (edit names if your files differ)
$audio1 = 'PANGAKO - Rey Valera (Cover) [JHINO OFFICIAL] Acoustic Live.mp3'
$audio2 = 'Maging Sino Ka Man - Rey Valera [Jhino Bilbao Cover] (Acoustic Live).mp3'
$audioConcat = Join-Path $tmpDir 'audio_concat.mp3'

if(Test-Path $audio1 -and Test-Path $audio2){
    $alist = Join-Path $tmpDir 'alist.txt'
    "file '{0}'" -f $audio1 | Out-File -Encoding utf8 $alist
    "file '{0}'" -f $audio2 | Out-File -Encoding utf8 -Append $alist
    Start-Process -FilePath ffmpeg -ArgumentList @('-y','-f','concat','-safe','0','-i',$alist,'-c','copy',$audioConcat) -NoNewWindow -Wait
}

# Merge audio and video
# PowerShell script to stitch slideshow + audio into a single MP4 using ffmpeg
# Usage: run from the project folder where media files and storyboard.json exist
# Example: powershell -ExecutionPolicy Bypass -File .\tools\build_reward_video.ps1

param(
    [string]$Storyboard = 'storyboard.json',
    [string]$Output = 'reward_video.mp4',
    [int]$Width = 1280,
    [int]$Height = 720
)

if(!(Get-Command ffmpeg -ErrorAction SilentlyContinue)){
    Write-Error "ffmpeg not found in PATH. Please install ffmpeg and try again."
    exit 1
}

$json = Get-Content $Storyboard -Raw | ConvertFrom-Json
$tmpDir = Join-Path $env:TEMP ("reward_build_{0}" -f (Get-Random))
New-Item -ItemType Directory -Path $tmpDir | Out-Null

$index = 0
$concatList = Join-Path $tmpDir "concat.txt"

foreach($item in $json){
    $src = $item.src
    $dur = [int]([math]::Round(($item.duration/1000),0))
    if($dur -le 0){ $dur = 5 }
    $type = $item.type
    $tmpfile = Join-Path $tmpDir ("slide_{0:D3}.mp4" -f $index)

    $vf = ("scale={0}:{1},format=yuv420p" -f $Width,$Height)
    if($type -eq 'img'){
        # create a video from image for $dur seconds
        $argList = @('-y','-loop','1','-i',$src,'-vf',$vf,'-t',$dur.ToString(),'-c:v','libx264','-preset','veryfast','-crf','18',$tmpfile)
        Write-Host "Running: ffmpeg $($argList -join ' ')"
        Start-Process -FilePath ffmpeg -ArgumentList $argList -NoNewWindow -Wait
    }else{
        # re-encode video to match size and trim/pad to duration
        $argList = @('-y','-i',$src,'-vf',$vf,'-t',$dur.ToString(),'-c:v','libx264','-preset','veryfast','-crf','18',$tmpfile)
        Write-Host "Running: ffmpeg $($argList -join ' ')"
        Start-Process -FilePath ffmpeg -ArgumentList $argList -NoNewWindow -Wait
    }

    Add-Content -Path $concatList -Value ("file '{0}'" -f $tmpfile)
    $index++
}

# Concatenate slides
$finalTmp = Join-Path $tmpDir "slides_concat.mp4"
Start-Process -FilePath ffmpeg -ArgumentList @('-y','-f','concat','-safe','0','-i',$concatList,'-c','copy',$finalTmp) -NoNewWindow -Wait

# Concatenate audio tracks if multiple (edit names if your files differ)
$audio1 = 'PANGAKO - Rey Valera (Cover) [JHINO OFFICIAL] Acoustic Live.mp3'
$audio2 = 'Maging Sino Ka Man - Rey Valera [Jhino Bilbao Cover] (Acoustic Live).mp3'
$audioConcat = Join-Path $tmpDir 'audio_concat.mp3'

if(Test-Path $audio1 -and Test-Path $audio2){
    $alist = Join-Path $tmpDir 'alist.txt'
    "file '{0}'" -f $audio1 | Out-File -Encoding utf8 $alist
    "file '{0}'" -f $audio2 | Out-File -Encoding utf8 -Append $alist
    Start-Process -FilePath ffmpeg -ArgumentList @('-y','-f','concat','-safe','0','-i',$alist,'-c','copy',$audioConcat) -NoNewWindow -Wait
}

# Merge audio and video
if(Test-Path $audioConcat){
    Start-Process -FilePath ffmpeg -ArgumentList @('-y','-i',$finalTmp,'-i',$audioConcat,'-c:v','copy','-c:a','aac','-b:a','192k',$Output) -NoNewWindow -Wait
}else{
    Copy-Item $finalTmp $Output -Force
}

Write-Host "Output created: $Output"
Write-Host "Temporary files in: $tmpDir (you can remove them when done)"
