Add-Type -AssemblyName System.Drawing

function Generate-Tinted-Logo {
    param(
        [string]$sourcePath,
        [string]$outputPath,
        [int]$r,
        [int]$g,
        [int]$b
    )
    $resolvedSrc = Resolve-Path $sourcePath
    $src = [System.Drawing.Bitmap]::FromFile($resolvedSrc)
    $dest = New-Object System.Drawing.Bitmap($src.Width, $src.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    for ($y = 0; $y -lt $src.Height; $y++) {
        for ($x = 0; $x -lt $src.Width; $x++) {
            $pixel = $src.GetPixel($x, $y)
            if ($pixel.A -gt 0) {
                $newColor = [System.Drawing.Color]::FromArgb($pixel.A, $r, $g, $b)
                $dest.SetPixel($x, $y, $newColor)
            } else {
                $dest.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            }
        }
    }
    
    $dest.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $src.Dispose()
    $dest.Dispose()
    Write-Host "Generated $outputPath successfully."
}

Generate-Tinted-Logo "public/images/alyatama-logo-white.png" "public/images/alyatama-logo-lightbrown.png" 198 164 123
Generate-Tinted-Logo "public/images/alyatama-logo-white.png" "public/images/alyatama-logo-forest.png" 53 92 70
