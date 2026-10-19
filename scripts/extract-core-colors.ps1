Add-Type -AssemblyName System.Drawing

$imgPath = "C:\Users\Kay\.gemini\antigravity-ide\brain\c2d851ae-f291-41df-9fea-03f1f7b7ff41\.user_uploaded\media_1792430440106.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)

# Sample interior pixels of each element where color is solid & uniform:
# 1. Blue 'i' dot: Center is around X=158, Y=172
$blueDotSamples = @()
for ($x = 155; $x -le 162; $x++) {
    for ($y = 168; $y -le 175; $y++) {
        $p = $bmp.GetPixel($x, $y)
        $blueDotSamples += $p
    }
}
$avgBlueDotR = [int](($blueDotSamples | Measure-Object -Property R -Average).Average)
$avgBlueDotG = [int](($blueDotSamples | Measure-Object -Property G -Average).Average)
$avgBlueDotB = [int](($blueDotSamples | Measure-Object -Property B -Average).Average)
$hexBlueDot = "#{0:X2}{1:X2}{2:X2}" -f $avgBlueDotR, $avgBlueDotG, $avgBlueDotB

# 2. Blue 'i' stem: Center is around X=158, Y=230
$blueStemSamples = @()
for ($x = 150; $x -le 165; $x++) {
    for ($y = 210; $y -le 270; $y++) {
        $p = $bmp.GetPixel($x, $y)
        $blueStemSamples += $p
    }
}
$avgBlueStemR = [int](($blueStemSamples | Measure-Object -Property R -Average).Average)
$avgBlueStemG = [int](($blueStemSamples | Measure-Object -Property G -Average).Average)
$avgBlueStemB = [int](($blueStemSamples | Measure-Object -Property B -Average).Average)
$hexBlueStem = "#{0:X2}{1:X2}{2:X2}" -f $avgBlueStemR, $avgBlueStemG, $avgBlueStemB

# 3. Green top facet: Center is around X=225, Y=175
$greenSamples = @()
for ($x = 220; $x -le 235; $x++) {
    for ($y = 170; $y -le 180; $y++) {
        $p = $bmp.GetPixel($x, $y)
        $greenSamples += $p
    }
}
$avgGreenR = [int](($greenSamples | Measure-Object -Property R -Average).Average)
$avgGreenG = [int](($greenSamples | Measure-Object -Property G -Average).Average)
$avgGreenB = [int](($greenSamples | Measure-Object -Property B -Average).Average)
$hexGreen = "#{0:X2}{1:X2}{2:X2}" -f $avgGreenR, $avgGreenG, $avgGreenB

# 4. Yellow middle facet: Center is around X=205, Y=235
$yellowSamples = @()
for ($x = 198; $x -le 210; $x++) {
    for ($y = 230; $y -le 240; $y++) {
        $p = $bmp.GetPixel($x, $y)
        $yellowSamples += $p
    }
}
$avgYellowR = [int](($yellowSamples | Measure-Object -Property R -Average).Average)
$avgYellowG = [int](($yellowSamples | Measure-Object -Property G -Average).Average)
$avgYellowB = [int](($yellowSamples | Measure-Object -Property B -Average).Average)
$hexYellow = "#{0:X2}{1:X2}{2:X2}" -f $avgYellowR, $avgYellowG, $avgYellowB

# 5. Red bottom facet: Center is around X=230, Y=265
$redSamples = @()
for ($x = 220; $x -le 238; $x++) {
    for ($y = 260; $y -le 270; $y++) {
        $p = $bmp.GetPixel($x, $y)
        $redSamples += $p
    }
}
$avgRedR = [int](($redSamples | Measure-Object -Property R -Average).Average)
$avgRedG = [int](($redSamples | Measure-Object -Property G -Average).Average)
$avgRedB = [int](($redSamples | Measure-Object -Property B -Average).Average)
$hexRed = "#{0:X2}{1:X2}{2:X2}" -f $avgRedR, $avgRedG, $avgRedB

# 6. Blue text 'INSTRUCTIFY': Center of letter 'I' or 'N' (around X=330, Y=220)
$blueTextSamples = @()
for ($x = 325; $x -le 345; $x++) {
    for ($y = 215; $y -le 235; $y++) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.B -gt 150) {
            $blueTextSamples += $p
        }
    }
}
$avgTextBlueR = [int](($blueTextSamples | Measure-Object -Property R -Average).Average)
$avgTextBlueG = [int](($blueTextSamples | Measure-Object -Property G -Average).Average)
$avgTextBlueB = [int](($blueTextSamples | Measure-Object -Property B -Average).Average)
$hexTextBlue = "#{0:X2}{1:X2}{2:X2}" -f $avgTextBlueR, $avgTextBlueG, $avgTextBlueB

# 7. Grey text 'KENYA': Center of letters (around X=310, Y=275)
$greyTextSamples = @()
for ($x = 300; $x -le 420; $x++) {
    for ($y = 270; $y -le 285; $y++) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.R -gt 40 -and [Math]::Abs($p.R - $p.B) -lt 20) {
            $greyTextSamples += $p
        }
    }
}
$avgGreyR = [int](($greyTextSamples | Measure-Object -Property R -Average).Average)
$avgGreyG = [int](($greyTextSamples | Measure-Object -Property G -Average).Average)
$avgGreyB = [int](($greyTextSamples | Measure-Object -Property B -Average).Average)
$hexGrey = "#{0:X2}{1:X2}{2:X2}" -f $avgGreyR, $avgGreyG, $avgGreyB

Write-Host "--- EXACT COLOR VALUES SAMPLED DIRECTLY FROM ORIGINAL LOGO ---"
Write-Host "Blue Dot:       $hexBlueDot (RGB: $avgBlueDotR, $avgBlueDotG, $avgBlueDotB)"
Write-Host "Blue Stem:      $hexBlueStem (RGB: $avgBlueStemR, $avgBlueStemG, $avgBlueStemB)"
Write-Host "Blue Text:      $hexTextBlue (RGB: $avgTextBlueR, $avgTextBlueG, $avgTextBlueB)"
Write-Host "Green Arm:      $hexGreen (RGB: $avgGreenR, $avgGreenG, $avgGreenB)"
Write-Host "Yellow Diamond: $hexYellow (RGB: $avgYellowR, $avgYellowG, $avgYellowB)"
Write-Host "Red Arm:        $hexRed (RGB: $avgRedR, $avgRedG, $avgRedB)"
Write-Host "Grey Kenya:     $hexGrey (RGB: $avgGreyR, $avgGreyG, $avgGreyB)"

$bmp.Dispose()
