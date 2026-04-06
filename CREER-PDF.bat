@echo off
echo Création du PDF en cours...

SET HTML=%~dp0presentation-project-invest.html
SET PDF=%USERPROFILE%\Desktop\Project-InvesT-Presentation.pdf

:: Chercher Chrome
SET CHROME=
FOR %%P IN (
  "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
  "%PROGRAMFILES%\Google\Chrome\Application\chrome.exe"
  "%PROGRAMFILES(X86)%\Google\Chrome\Application\chrome.exe"
) DO (
  IF EXIST %%P SET CHROME=%%P
)

:: Chercher Edge
SET EDGE=
FOR %%P IN (
  "%PROGRAMFILES(X86)%\Microsoft\Edge\Application\msedge.exe"
  "%PROGRAMFILES%\Microsoft\Edge\Application\msedge.exe"
  "%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe"
) DO (
  IF EXIST %%P SET EDGE=%%P
)

IF DEFINED CHROME (
  echo Utilisation de Chrome...
  %CHROME% --headless --disable-gpu --print-to-pdf="%PDF%" "file:///%HTML:\=/%"
  goto :done
)

IF DEFINED EDGE (
  echo Utilisation de Edge...
  %EDGE% --headless --disable-gpu --print-to-pdf="%PDF%" "file:///%HTML:\=/%"
  goto :done
)

echo.
echo Navigateur introuvable automatiquement.
echo.
echo Voici comment faire manuellement :
echo 1. Ouvrez le fichier presentation-project-invest.html
echo 2. Appuyez sur Ctrl+P
echo 3. Dans Destination, choisissez "Enregistrer en PDF"
echo 4. Cliquez Enregistrer
echo.
pause
exit

:done
echo.
echo PDF créé sur votre Bureau !
echo Fichier : %PDF%
echo.
pause
