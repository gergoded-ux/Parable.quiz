@echo off
rem Eikonia Creative Studio launcher.
rem Double-click this file (or run .\studio.cmd) to start the dev server if needed
rem and open the Creative Studio asset console in your default browser.
setlocal
cd /d "%~dp0"
set "URL=http://localhost:3000/mockup/studio"

rem If the dev server is already listening on 3000, just open the page.
powershell -NoProfile -Command "if (Test-NetConnection localhost -Port 3000 -InformationLevel Quiet) { exit 0 } else { exit 1 }"
if %errorlevel%==0 (
  echo Dev server already running. Opening Creative Studio...
  start "" "%URL%"
  goto :eof
)

echo Starting Eikonia dev server. Keep this window open while you work.
echo The Creative Studio will open in your browser as soon as it is ready...
echo.

rem Background watcher: poll the port, then open the page once the server is up.
start "" /b powershell -NoProfile -Command "for($i=0;$i -lt 180;$i++){ if (Test-NetConnection localhost -Port 3000 -InformationLevel Quiet) { Start-Process '%URL%'; break }; Start-Sleep -Milliseconds 1000 }"

rem Run the dev server in this window (closing it stops the server).
call pnpm dev

echo.
echo Dev server stopped. Press any key to close.
pause >nul
endlocal
