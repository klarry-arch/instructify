Add-Type -AssemblyName System.Drawing

$imgPath = "C:\Users\Kay\.gemini\antigravity-ide\brain\c2d851ae-f291-41df-9fea-03f1f7b7ff41\.user_uploaded\media_1792430440106.jpg"
$src = [System.Drawing.Bitmap]::FromFile($imgPath)

# Bounds of the full logo: X: 140 to 675, Y: 145 to 300
$cropX = 138
$cropY = 144
$cropW = 678 - 138
$cropH = 302 - 144

Write-Host "Crop dimensions: $cropW x $cropH"

$bmpFull = New-Object System.Drawing.Bitmap $cropW, $cropH, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$bmpDark = New-Object System.Drawing.Bitmap $cropW, $cropH, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$bmpIcon = New-Object System.Drawing.Bitmap 140, 155, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Pure element reference colors
# Blue: 0, 88, 206
# Green: 30, 160, 79
# Yellow: 251, 197, 3
# Red: 234, 8, 20
# Grey: 64, 67, 75

for ($y = 0; $y -lt $cropH; $y++) {
    for ($x = 0; $x -lt $cropW; $x++) {
        $srcX = $cropX + $x
        $srcY = $cropY + $y
        $p = $src.GetPixel($srcX, $srcY)
        $r = [double]$p.R; $g = [double]$p.G; $b = [double]$p.B
        $maxC = [Math]::Max($r, [Math]::Max($g, $b))

        if ($maxC -lt 15) {
            # Pure black background -> transparent
            $bmpFull.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            $bmpDark.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            continue
        }

        # Determine element type based on color ratios
        $alpha = 1.0
        $outR = $r; $outG = $g; $outB = $b
        $isKenyaText = ($srcX -ge 285 -and $srcY -ge 255)

        if ($b -gt $r + 30 -and $b -gt $g) {
            # Blue
            $alpha = [Math]::Min(1.0, $b / 206.0)
            if ($alpha -gt 0.05) {
                $outR = [Math]::Min(255, [int]($r / $alpha))
                $outG = [Math]::Min(255, [int]($g / $alpha))
                $outB = [Math]::Min(255, [int]($b / $alpha))
            }
        } elseif ($g -gt $r + 25 -and $g -gt $b) {
            # Green
            $alpha = [Math]::Min(1.0, $g / 160.0)
            if ($alpha -gt 0.05) {
                $outR = [Math]::Min(255, [int]($r / $alpha))
                $outG = [Math]::Min(255, [int]($g / $alpha))
                $outB = [Math]::Min(255, [int]($b / $alpha))
            }
        } elseif ($r -gt 150 -and $g -gt 130 -and $b -lt 80) {
            # Yellow
            $alpha = [Math]::Min(1.0, [Math]::Max($r / 251.0, $g / 197.0))
            if ($alpha -gt 0.05) {
                $outR = [Math]::Min(255, [int]($r / $alpha))
                $outG = [Math]::Min(255, [int]($g / $alpha))
                $outB = [Math]::Min(255, [int]($b / $alpha))
            }
        } elseif ($r -gt $g + 50 -and $r -gt $b + 50) {
            # Red
            $alpha = [Math]::Min(1.0, $r / 234.0)
            if ($alpha -gt 0.05) {
                $outR = [Math]::Min(255, [int]($r / $alpha))
                $outG = [Math]::Min(255, [int]($g / $alpha))
                $outB = [Math]::Min(255, [int]($b / $alpha))
            }
        } elseif ($isKenyaText) {
            # Grey 'KENYA' text
            $alpha = [Math]::Min(1.0, $maxC / 75.0)
            if ($alpha -gt 0.05) {
                $outR = [Math]::Min(255, [int]($r / $alpha))
                $outG = [Math]::Min(255, [int]($g / $alpha))
                $outB = [Math]::Min(255, [int]($b / $alpha))
            }
        } else {
            $alpha = [Math]::Min(1.0, $maxC / 200.0)
        }

        # Clamp alpha to 0..255
        $aInt = [Math]::Max(0, [Math]::Min(255, [int]($alpha * 255)))

        if ($aInt -lt 15) {
            $bmpFull.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            $bmpDark.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
            $colFull = [System.Drawing.Color]::FromArgb($aInt, [int]$outR, [int]$outG, [int]$outB)
            $bmpFull.SetPixel($x, $y, $colFull)

            # For dark version: KENYA text should be light grey/white (#E2E8F0)
            if ($isKenyaText) {
                $colDark = [System.Drawing.Color]::FromArgb($aInt, 226, 232, 240)
                $bmpDark.SetPixel($x, $y, $colDark)
            } else {
                $bmpDark.SetPixel($x, $y, $colFull)
            }
        }
    }
}

# Icon crop (Mark only): X=138 to 278, Y=144 to 299
for ($y = 0; $y -lt 155; $y++) {
    for ($x = 0; $x -lt 140; $x++) {
        $p = $bmpFull.GetPixel($x, $y)
        $bmpIcon.SetPixel($x, $y, $p)
    }
}

# Ensure directory exists
$assetsDir = "c:\instructify\assets\images"
if (-not (Test-Path $assetsDir)) { New-Item -ItemType Directory -Force -Path $assetsDir }

$bmpFull.Save("$assetsDir\instructify-kenya-logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmpFull.Save("$assetsDir\logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmpDark.Save("$assetsDir\instructify-kenya-logo-dark.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmpIcon.Save("$assetsDir\instructify-kenya-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)

Write-Host "Saved logo variants to $assetsDir"

$src.Dispose()
$bmpFull.Dispose()
$bmpDark.Dispose()
$bmpIcon.Dispose()
