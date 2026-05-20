$path = 'c:\Users\USER\Downloads\PROJECT MEGHANA.zip\PROJECT MEGHANA\src\pages\Home.jsx'
$raw = [System.IO.File]::ReadAllText($path)

# Find and fix: encodeURIComponent(searchQuery)`")} -> encodeURIComponent(searchQuery)`)
# The bad pattern has backtick then double-quote then )}
$bad = 'encodeURIComponent(searchQuery)`")}'
$good = 'encodeURIComponent(searchQuery)`)}'
Write-Host "Contains bad: $($raw.Contains($bad))"
$fixed = $raw.Replace($bad, $good)
[System.IO.File]::WriteAllText($path, $fixed)
Write-Host "Done"
