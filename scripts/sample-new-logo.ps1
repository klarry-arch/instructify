Add-Type -AssemblyName System.Drawing

$imgPath = "C:\Users\Kay\.gemini\antigravity-ide\brain\c2d851ae-f291-41df-9fea-03f1f7b7ff41\.user_uploaded\media_1792430440106.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)

Write-Host "Image Size: $($bmp.Width) x $($bmp.Height)"

# Let's find non-black bounding box and sample colors
$minX = $bmp.Width
$maxX = 0
$minY = $bmp.Height
$maxY = 0

# Sample pixels
for ($y = 0; $y -lt $bmp.Height; $y += 4) {
    for ($x = 0; $x -lt $bmp.Width; $x += 4) {
        $pixel = $bmp.GetPixel($x, $y)
        # If not pure black / dark grey background (brightness > 20)
        if ($pixel.R -gt 25 -or $pixel.G -gt 25 -or $pixel.B -gt 25) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Host "Logo Bounding Box: X=[$minX, $maxX], Y=[$minY, $maxY]"
Write-Host "Logo Width: $($maxX - $minX), Height: $($maxY - $minY)"

# Let's find key colors in the logo:
# 1. Blue: find pixel with max Blue and B > R+50 and B > G
# 2. Green: find pixel with max Green and G > R+40 and G > B+40
# 3. Yellow: find pixel with high R & G and low B
# 4. Red: find pixel with high R and low G & B
# 5. Grey (Kenya text): pixel with R~G~B in range 50..120

$colors = @{}

for ($y = $minY; $y -le $maxY; $y += 2) {
    for ($x = $minX; $x -le $maxX; $x += 2) {
        $p = $bmp.GetPixel($x, $y)
        $r = $p.R; $g = $p.G; $b = $p.B
        
        # Pure blue candidate (dot or stem or text)
        if ($b -gt 150 -and $r -lt 60 -and $g -lt 120) {
            if (-not $colors["Blue"] -or $b -gt $colors["Blue"].B) {
                $colors["Blue"] = @{ R = $r; G = $g; B = $b; X = $x; Y = $y }
            }
        }
        
        # Green candidate (top wing)
        if ($g -gt 130 -and $r -lt 80 -and $b -lt 100) {
            if (-not $colors["Green"] -or $g -gt $colors["Green"].G) {
                $colors["Green"] = @{ R = $r; G = $g; B = $b; X = $x; Y = $y }
            }
        }
        
        # Yellow candidate (middle wing)
        if ($r -gt 180 -and $g -gt 150 -and $b -lt 60) {
            if (-not $colors["Yellow"] -or ($r + $g) -gt ($colors["Yellow"].R + $colors["Yellow"].G)) {
                $colors["Yellow"] = @{ R = $r; G = $g; B = $b; X = $x; Y = $y }
            }
        }
        
        # Red candidate (bottom wing)
        if ($r -gt 180 -and $g -lt 50 -and $b -lt 50) {
            if (-not $colors["Red"] -or $r -gt $colors["Red"].R) {
                $colors["Red"] = @{ R = $r; G = $g; B = $b; X = $x; Y = $y }
            }
        }
        
        # Dark Grey (KENYA text)
        if ($x -gt ($minX + 100) -and $y -gt ($minY + 30)) {
            if ($r -gt 40 -and $r -lt 120 -and [Math]::Abs($r - $g) -lt 15 -and [Math]::Abs($r - $b) -lt 15) {
                if (-not $colors["Grey"] -or $r -gt $colors["Grey"].R) {
                    $colors["Grey"] = @{ R = $r; G = $g; B = $b; X = $x; Y = $y }
                }
            }
        }
    }
}

foreach ($k in $colors.Keys) {
    $c = $colors[$k]
    $hex = "#{0:X2}{1:X2}{2:X2}" -f $c.R, $c.G, $c.B
    Write-Host "$($k): $hex (RGB: $($c.R), $($c.G), $($c.B)) at ($($c.X), $($c.Y))"
}

$bmp.Dispose()
