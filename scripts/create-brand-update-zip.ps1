Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zipPath = "C:\instructify\instructify-brand-update.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

$archive = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)

# Add all root html files
Get-ChildItem -Path "C:\instructify" -Filter "*.html" | ForEach-Object {
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $_.FullName, $_.Name, [System.IO.Compression.CompressionLevel]::Optimal)
}

# Add favicon and robots
if (Test-Path "C:\instructify\favicon.ico") {
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, "C:\instructify\favicon.ico", "favicon.ico", [System.IO.Compression.CompressionLevel]::Optimal)
}
if (Test-Path "C:\instructify\robots.txt") {
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, "C:\instructify\robots.txt", "robots.txt", [System.IO.Compression.CompressionLevel]::Optimal)
}
if (Test-Path "C:\instructify\sitemap.xml") {
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, "C:\instructify\sitemap.xml", "sitemap.xml", [System.IO.Compression.CompressionLevel]::Optimal)
}

# Folders to include: css, assets, articles, courses, resources, js, api
$folders = @("css", "assets", "articles", "courses", "resources", "js", "api")
foreach ($folder in $folders) {
    $folderPath = "C:\instructify\$folder"
    if (Test-Path $folderPath) {
        $files = Get-ChildItem -Path $folderPath -Recurse -File
        foreach ($file in $files) {
            $rel = "$folder/" + $file.FullName.Substring($folderPath.Length).TrimStart('\', '/').Replace('\', '/')
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, $rel, [System.IO.Compression.CompressionLevel]::Optimal)
        }
    }
}

$archive.Dispose()
Write-Host "Created instructify-brand-update.zip successfully."
