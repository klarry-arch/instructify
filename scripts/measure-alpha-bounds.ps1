Add-Type -AssemblyName System.Drawing

$png = [System.Drawing.Bitmap]::FromFile("c:\instructify\assets\images\instructify-kenya-logo.png")
$minX = 999; $maxX = 0; $minY = 999; $maxY = 0

for ($y = 0; $y -lt $png.Height; $y++) {
    for ($x = 0; $x -lt $png.Width; $x++) {
        $p = $png.GetPixel($x, $y)
        if ($p.A -gt 10) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Host "Non-zero Alpha Bounds: X=[$minX, $maxX], Y=[$minY, $maxY]"
Write-Host "Content Width: $($maxX - $minX + 1), Height: $($maxY - $minY + 1)"
Write-Host "Image Size: $($png.Width) x $($png.Height)"

$png.Dispose()
