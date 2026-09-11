param(
    [string]$SourceDir = "C:\instructify\dist\public_html",
    [string]$ZipFile = "C:\instructify\instructify-cpanel-deploy.zip"
)

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

if (Test-Path $ZipFile) {
    Remove-Item $ZipFile -Force
}

$archive = [System.IO.Compression.ZipFile]::Open($ZipFile, [System.IO.Compression.ZipArchiveMode]::Create)

$files = Get-ChildItem -Path $SourceDir -Recurse -File -Force
foreach ($file in $files) {
    $relative = $file.FullName.Substring($SourceDir.Length).TrimStart('\', '/').Replace('\', '/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, $relative, [System.IO.Compression.CompressionLevel]::Optimal)
}

$archive.Dispose()
Write-Host "Archive created successfully with forward slashes: $ZipFile ($($files.Count) files)"
