$conn = Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue
if ($conn) {
    $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
    if ($proc) {
        Stop-Process -Id $proc.Id -Force
        Write-Output "Stopped process $($proc.Id) on port 3002"
    }
}