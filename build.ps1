# build.ps1 — сборка .zip для Firefox AMO
# Использование: .\build.ps1

# Цвета для вывода
function Write-Success { param($msg) Write-Host $msg -ForegroundColor Green }
function Write-Info    { param($msg) Write-Host $msg -ForegroundColor Cyan }
function Write-Warn    { param($msg) Write-Host $msg -ForegroundColor Yellow }
function Write-Err     { param($msg) Write-Host $msg -ForegroundColor Red }

Write-Info "📦 Сборка Price Tracker для AMO"
Write-Info "================================"

# Проверяем, что мы в правильной папке
if (-not (Test-Path "manifest.json")) {
    Write-Err "❌ manifest.json не найден. Запустите скрипт из корня проекта."
    exit 1
}

# Читаем версию из manifest.json
try {
    $manifest = Get-Content "manifest.json" -Raw | ConvertFrom-Json
    $version = $manifest.version
    Write-Success "✅ Версия: $version"
} catch {
    Write-Err "❌ Не удалось прочитать manifest.json: $_"
    exit 1
}

# Имена папки и архива
$buildDir = "build-$version"
$zipName = "price-tracker-$version.zip"
$xpiName = "price-tracker-$version.xpi"

Write-Info ""
Write-Info "📁 Папка сборки: $buildDir"
Write-Info "📦 Архив: $zipName"
Write-Info ""

# Удаляем старую сборку
if (Test-Path $buildDir) {
    Remove-Item -Recurse -Force $buildDir
    Write-Warn "🗑️  Удалена старая папка $buildDir"
}
if (Test-Path $zipName) {
    Remove-Item -Force $zipName
    Write-Warn "🗑️  Удалён старый архив $zipName"
}
if (Test-Path $xpiName) {
    Remove-Item -Force $xpiName
    Write-Warn "🗑️  Удалён старый архив $xpiName"
}

# Создаём папку сборки
New-Item -ItemType Directory -Path $buildDir | Out-Null

# Список файлов расширения
$files = @(
    'manifest.json',
    'core.js',
    'storage.js',
    'background.js',
    'ozon.js',
    'wildberries.js',
    'yandex.js',
    'aliexpress.js',
    'popup.html',
    'popup.js',
    'options.html',
    'options.css',
    'options.js',
    'styles.css',
    'CHANGELOG.md'
)

Write-Info ""
Write-Info "📋 Копирование файлов:"

# Копируем файлы
$missingFiles = @()
foreach ($file in $files) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $buildDir
        Write-Success "  ✅ $file"
    } else {
        Write-Warn "  ⚠️  $file — не найден"
        $missingFiles += $file
    }
}

# Копируем иконки
if (Test-Path 'icons') {
    Copy-Item -Recurse icons -Destination $buildDir
    $iconCount = (Get-ChildItem "icons" -File).Count
    Write-Success "  ✅ icons/ ($iconCount файлов)"
} else {
    Write-Warn "  ⚠️  icons/ — не найдена"
    $missingFiles += 'icons/'
}

# Проверяем обязательные файлы
if (-not (Test-Path "$buildDir\manifest.json")) {
    Write-Err ""
    Write-Err "❌ КРИТИЧНО: manifest.json не скопирован!"
    exit 1
}

# Создаём .zip
Write-Info ""
Write-Info "📦 Создание ZIP-архива..."

try {
    Compress-Archive -Path "$buildDir\*" -DestinationPath $zipName -Force
    $zipSize = [math]::Round((Get-Item $zipName).Length / 1KB, 1)
    Write-Success "✅ ZIP создан: $zipName ($zipSize КБ)"
} catch {
    Write-Err "❌ Ошибка создания ZIP: $_"
    exit 1
}

# Создаём .xpi (копия .zip)
try {
    Copy-Item $zipName $xpiName
    $xpiSize = [math]::Round((Get-Item $xpiName).Length / 1KB, 1)
    Write-Success "✅ XPI создан: $xpiName ($xpiSize КБ)"
} catch {
    Write-Err "❌ Ошибка создания XPI: $_"
    exit 1
}

# Финальная проверка
Write-Info ""
Write-Info "🔍 Проверка содержимого архива:"

try {
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path $zipName))
    $entries = $zip.Entries | ForEach-Object { $_.FullName }
    $zip.Dispose()
    
    $hasManifest = $entries | Where-Object { $_ -eq 'manifest.json' }
    if ($hasManifest) {
        Write-Success "  ✅ manifest.json в корне архива"
    } else {
        Write-Err "  ❌ manifest.json НЕ в корне архива!"
        Write-Err "     Это критично — AMO отклонит архив."
        exit 1
    }
    
    Write-Info "  📊 Всего файлов в архиве: $($entries.Count)"
} catch {
    Write-Warn "  ⚠️  Не удалось проверить содержимое архива: $_"
}

# Итог
Write-Info ""
Write-Info "================================"
Write-Success "🎉 Сборка завершена!"
Write-Info ""
Write-Info "📦 Архивы:"
Write-Info "   $zipName"
Write-Info "   $xpiName"
Write-Info ""
Write-Info "📁 Папка сборки (для проверки):"
Write-Info "   $buildDir"
Write-Info ""

if ($missingFiles.Count -gt 0) {
    Write-Warn "⚠️  Отсутствуют файлы:"
    foreach ($f in $missingFiles) {
        Write-Warn "   - $f"
    }
}

Write-Info "📤 Следующие шаги:"
Write-Info "   1. Загрузить $zipName на addons.mozilla.org"
Write-Info "   2. Или отправить $xpiName пользователю"
Write-Info ""