Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# 1. Python-Watcher im Hintergrund starten (ohne sichtbares Konsolenfenster)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$pythonScript = Join-Path $scriptPath "watcher.py"

$processInfo = New-Object System.Diagnostics.ProcessStartInfo
$processInfo.FileName = "python.exe"
$processInfo.Arguments = "`"$pythonScript`""
$processInfo.UseShellExecute = $false
$processInfo.CreateNoWindow = $true

$watcherProcess = [System.Diagnostics.Process]::Start($processInfo)

# 2. Tray Icon erstellen
$notifyIcon = New-Object System.Windows.Forms.NotifyIcon
# Wir nutzen ein Standard-Systemicon (Information), du kannst hier auch eine eigene .ico-Datei einbinden
$notifyIcon.Icon = [System.Drawing.SystemIcons]::Information
$notifyIcon.Visible = $true
$notifyIcon.Text = "ED-Cetera Watcher läuft..."

# 3. Kontextmenü für das Tray-Icon aufbauen
$contextMenu = New-Object System.Windows.Forms.ContextMenu

# Menüpunkt: Status anzeigen
$statusItem = $contextMenu.MenuItems.Add("ED-Cetera aktiv")
$statusItem.Enabled = $false # Nur als Info

# Trenner
$contextMenu.MenuItems.Add("-") | Out-Null

# Menüpunkt: Beenden
$exitItem = $contextMenu.MenuItems.Add("Beenden", {
    # Python-Prozess sauber killen, wenn das Tray-Icon beendet wird
    if (-not $watcherProcess.HasExited) {
        $watcherProcess.Kill()
    }
    $notifyIcon.Visible = $false
    $notifyIcon.Dispose()
    [System.Windows.Forms.Application]::Exit()
})

$notifyIcon.ContextMenu = $contextMenu

# 4. Event-Loop am Laufen halten, damit das Tray-Icon aktiv bleibt
[System.Windows.Forms.Application]::Run()