Add-Type -AssemblyName System.Drawing

$imgPath = "C:\Users\Kay\.gemini\antigravity-ide\brain\c2d851ae-f291-41df-9fea-03f1f7b7ff41\.user_uploaded\media_1792430440106.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)

# Check background brightness at margins
$marginBrightness = @()
for ($x = 0; $x -lt 100; $x += 10) {
    for ($y = 0; $y -lt 100; $y += 10) {
        $p = $bmp.GetPixel($x, $y)
        $marginBrightness += [Math]::Max($p.R, [Math]::Max($p.G, $p.B))
    }
}
$maxMarg = ($marginBrightness | Measure-Object -Maximum).Maximum
Write-Host "Max margin brightness: $maxMarg"

# Check pixels near logo bounding box (e.g. X=130, Y=220)
$p1 = $bmp.GetPixel(130, 220)
Write-Host "Pixel at (130, 220): R=$($p1.R), G=$($p1.G), B=$($p1.B)"
$p2 = $bmp.GetPixel(140, 220)
Write-Host "Pixel at (140, 220): R=$($p2.R), G=$($p2.G), B=$($p2.B)"
$p3 = $bmp.GetPixel(144, 220)
Write-Host "Pixel at (144, 220): R=$($p3.R), G=$($p3.G), B=$($p3.B)"

$bmp.Dispose()
