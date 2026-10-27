Add-Type -AssemblyName System.Drawing

function Create-Clean-Monochrome-Logo {
    param(
        [string]$sourcePath,
        [string]$outputPath,
        [int]$r,
        [int]$g,
        [int]$b
    )
    $src = [System.Drawing.Bitmap]::FromFile((Resolve-Path $sourcePath))
    
    # 1. Find tight bounding box of visible content
    $minX = $src.Width; $maxX = 0; $minY = $src.Height; $maxY = 0
    for ($y = 0; $y -lt $src.Height; $y++) {
        for ($x = 0; $x -lt $src.Width; $x++) {
            $p = $src.GetPixel($x, $y)
            if ($p.A -gt 15) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }
    
    # Add small padding (e.g. 10px)
    $padding = 12
    $cropX = [Math]::Max(0, $minX - $padding)
    $cropY = [Math]::Max(0, $minY - $padding)
    $cropW = [Math]::Min($src.Width - $cropX, ($maxX - $minX + 1) + ($padding * 2))
    $cropH = [Math]::Min($src.Height - $cropY, ($maxY - $minY + 1) + ($padding * 2))
    
    $dest = New-Object System.Drawing.Bitmap($cropW, $cropH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    for ($dy = 0; $dy -lt $cropH; $dy++) {
        $sy = $cropY + $dy
        for ($dx = 0; $dx -lt $cropW; $dx++) {
            $sx = $cropX + $dx
            if ($sx -ge 0 -and $sx -lt $src.Width -and $sy -ge 0 -and $sy -lt $src.Height) {
                $pixel = $src.GetPixel($sx, $sy)
                if ($pixel.A -gt 15) {
                    # Solid monochrome color with preserved smooth antialiased alpha!
                    $dest.SetPixel($dx, $dy, [System.Drawing.Color]::FromArgb($pixel.A, $r, $g, $b))
                } else {
                    $dest.SetPixel($dx, $dy, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
                }
            }
        }
    }
    
    $dest.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $src.Dispose()
    $dest.Dispose()
    Write-Host "Created $outputPath ($cropW x $cropH) with solid color R=$r, G=$g, B=$b"
}

$source = "C:\Users\p\.gemini\antigravity\brain\77546172-eda3-4584-8bfe-8a32f563be16\.user_uploaded\media_1792974543499_345527dc.png"

# 1. White Solid (Polos murni tanpa tekstur sama sekali)
Create-Clean-Monochrome-Logo $source "public/images/alyatama-logo-white.png" 255 255 255
Create-Clean-Monochrome-Logo $source "public/images/alyatama-logo-light.png" 255 255 255

# 2. Forest Green Solid (#355C46)
Create-Clean-Monochrome-Logo $source "public/images/alyatama-logo-forest.png" 53 92 70

# 3. Light Brown / Soft Gold Solid (#C6A47B)
Create-Clean-Monochrome-Logo $source "public/images/alyatama-logo-lightbrown.png" 198 164 123

# 4. Dark Espresso Solid (#30291F)
Create-Clean-Monochrome-Logo $source "public/images/alyatama-logo-dark.png" 48 41 31
