@echo off
rem MINES SPACE - met a jour la liste des photos du carrousel (assets\carrousel\photos.js)
rem Double-cliquer sur ce fichier apres avoir ajoute ou supprime des photos.
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 (
    py -3 maj_carrousel.py
    goto fin
)
where python >nul 2>nul
if %errorlevel%==0 (
    python maj_carrousel.py
    goto fin
)
echo Python est introuvable sur cet ordinateur.
echo Installez-le depuis https://www.python.org/downloads/ puis relancez ce fichier,
echo ou deposez simplement les photos sur GitHub : la liste se mettra a jour toute seule.

:fin
echo.
pause
