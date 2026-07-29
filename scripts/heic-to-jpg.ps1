# Converts iPhone HEIC photos to JPEG using Windows Imaging Component.
#
#   powershell -ExecutionPolicy Bypass -File .\scripts\heic-to-jpg.ps1
#
# Two decoders were tried before this one:
#   - sharp's libheif refuses these files (Live Photos carry 45 references in
#     the iref box, over its security limit of 16)
#   - System.Drawing/GDI+ has no HEIF decoder at all and reports the failure
#     misleadingly as "Out of memory"
# WindowsBase's WIC pipeline uses the OS HEIF codec, which handles both.

Add-Type -AssemblyName WindowsBase
Add-Type -AssemblyName PresentationCore

$srcDir = Join-Path $PSScriptRoot "..\assets-src\putter"
$outDir = Join-Path $srcDir "converted"
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

$maxEdge = 2400

Get-ChildItem -Path $srcDir -Filter *.HEIC | ForEach-Object {
    $out = Join-Path $outDir ($_.BaseName + ".jpg")
    try {
        $uri = New-Object System.Uri($_.FullName)
        $decoder = [System.Windows.Media.Imaging.BitmapDecoder]::Create(
            $uri,
            [System.Windows.Media.Imaging.BitmapCreateOptions]::PreservePixelFormat,
            [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad)
        $frame = $decoder.Frames[0]

        $scale = [Math]::Min(1.0, $maxEdge / [Math]::Max($frame.PixelWidth, $frame.PixelHeight))
        $scaled = New-Object System.Windows.Media.Imaging.TransformedBitmap(
            $frame,
            (New-Object System.Windows.Media.ScaleTransform($scale, $scale)))

        $encoder = New-Object System.Windows.Media.Imaging.JpegBitmapEncoder
        $encoder.QualityLevel = 92
        $encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($scaled))

        $fs = [System.IO.File]::Create($out)
        $encoder.Save($fs)
        $fs.Close()

        Write-Output ("ok    {0} -> {1}x{2}" -f $_.Name, $scaled.PixelWidth, $scaled.PixelHeight)
    }
    catch {
        Write-Output ("FAIL  {0}: {1}" -f $_.Name, $_.Exception.Message)
    }
}
