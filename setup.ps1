$OutputFile = "project-tree.txt"

$Exclude = @(
    "node_modules",
    ".git",
    "dist",
    "build",
    ".next",
    "coverage",
    ".env"
)

function Show-Tree {
    param (
        [string]$Path,
        [string]$Prefix = ""
    )

    $Items = Get-ChildItem -LiteralPath $Path -Force |
        Where-Object { $Exclude -notcontains $_.Name } |
        Sort-Object @{Expression = {$_.PSIsContainer}; Descending = $true}, Name

    for ($i = 0; $i -lt $Items.Count; $i++) {
        $Item = $Items[$i]
        $IsLast = ($i -eq $Items.Count - 1)

        if ($IsLast) {
            $Connector = "\-- "
            $NextPrefix = "$Prefix    "
        }
        else {
            $Connector = "|-- "
            $NextPrefix = "$Prefix|   "
        }

        Add-Content -Path $OutputFile -Value "$Prefix$Connector$($Item.Name)"

        if ($Item.PSIsContainer) {
            Show-Tree -Path $Item.FullName -Prefix $NextPrefix
        }
    }
}

Set-Content -Path $OutputFile -Value "VIRSA PROJECT DIRECTORY TREE"
Add-Content -Path $OutputFile -Value "============================"
Add-Content -Path $OutputFile -Value ""

Show-Tree -Path (Get-Location).Path

Write-Host ""
Write-Host "Directory tree generated successfully!" -ForegroundColor Green
Write-Host "Output: $OutputFile" -ForegroundColor Cyan