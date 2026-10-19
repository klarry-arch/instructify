Add-Type -AssemblyName System.Drawing

$imgPath = "C:\Users\Kay\.gemini\antigravity-ide\brain\c2d851ae-f291-41df-9fea-03f1f7b7ff41\.user_uploaded\media_1792430440106.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)

# Sample the background color from top-left (e.g. 10, 10)
$bg = $bmp.GetPixel(10, 10)
Write-Host "Background color: R=$($bg.R), G=$($bg.G), B=$($bg.B)"

# Find the exact tight bounds of the mark and text
# Mark is from X=140 to X=275
$markMinX = 999; $markMaxX = 0; $markMinY = 999; $markMaxY = 0

for ($y = 140; $y -le 300; $y++) {
    for ($x = 140; $x -le 280; $x++) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.R -gt 25 -or $p.G -gt 25 -or $p.B -gt 25) {
            if ($x -lt $markMinX) { $markMinX = $x }
            if ($x -gt $markMaxX) { $markMaxX = $x }
            if ($y -lt $markMinY) { $markMinY = $y }
            if ($y -gt $markMaxY) { $markMaxY = $y }
        }
    }
}
Write-Host "Mark Bounds: X=[$markMinX, $markMaxX], Y=[$markMinY, $markMaxY], W=$($markMaxX - $markMinX), H=$($markMaxY - $markMinY)"

# Text "INSTRUCTIFY"
$tMinX = 999; $tMaxX = 0; $tMinY = 999; $tMaxY = 0
for ($y = 180; $y -le 260; $y++) {
    for ($x = 280; $x -le 680; $x++) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.B -gt 100 -and $p.B -gt ($p.R + 40)) {
            if ($x -lt $tMinX) { $tMinX = $x }
            if ($x -gt $tMaxX) { $tMaxX = $x }
            if ($y -lt $tMinY) { $tMinY = $y }
            if ($y -gt $tMaxY) { $tMaxY = $y }
        }
    }
}
Write-Host "INSTRUCTIFY Text Bounds: X=[$tMinX, $tMaxX], Y=[$tMinY, $tMaxY], W=$($tMaxX - $tMinX), H=$($tMaxY - $tMinY)"

# Text "KENYA"
$kMinX = 999; $kMaxX = 0; $kMinY = 999; $kMaxY = 0
for ($y = 250; $y -le 300; $y++) {
    for ($x = 280; $x -le 500; $x++) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.R -gt 35 -and $p.G -gt 35 -and $p.B -gt 35 -and [Math]::Abs($p.R - $p.B) -lt 25) {
            if ($x -lt $kMinX) { $kMinX = $x }
            if ($x -gt $kMaxX) { $kMaxX = $x }
            if ($y -lt $kMinY) { $kMinY = $y }
            if ($y -gt $kMaxY) { $kMaxY = $y }
        }
    }
}
Write-Host "KENYA Text Bounds: X=[$kMinX, $kMaxX], Y=[$kMinY, $kMaxY], W=$($kMaxX - $kMinX), H=$($kMaxY - $kMinY)"

$bmp.Dispose()
