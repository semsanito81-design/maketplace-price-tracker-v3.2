// options.js — настройки расширения
(function() {
    'use strict';

    console.log('🚀 Options START');

    async function loadSettings() {
        const settings = await PTStorage.get('pt_settings') || {};

        document.getElementById('show-widget').checked = settings.showWidget !== false;
        document.getElementById('auto-update').checked = settings.autoUpdate !== false;
        document.getElementById('open-current-tab').checked = settings.openCurrentTab === true;

        const notif = await PTStorage.get('pt_notification_settings') || {};
        document.getElementById('notifications-enabled').checked = notif.enabled !== false;
        document.getElementById('threshold').value = notif.threshold || 5;
        document.getElementById('notify-min').checked = notif.notifyMin !== false;

        await loadStorageStats();

        const runtime = (typeof browser !== 'undefined' && browser.runtime) ? browser.runtime : chrome.runtime;
        const manifest = runtime.getManifest();
        document.getElementById('version').textContent = 'v' + manifest.version;
        document.getElementById('version-full').textContent = manifest.version;
    }

    async function loadStorageStats() {
        try {
            const storage = (typeof browser !== 'undefined' && browser.storage) ? browser.storage.local : chrome.storage.local;
            const all = await storage.get(null);

            const tracked = all['pt_tracked'] || [];
            document.getElementById('stat-tracked').textContent = tracked.length;

            let historyCount = 0;
            for (const [key, val] of Object.entries(all)) {
                if (key.startsWith('price_history_') && Array.isArray(val)) {
                    historyCount += val.length;
                }
            }
            document.getElementById('stat-history').textContent = historyCount;

            const size = JSON.stringify(all).length;
            document.getElementById('stat-size').textContent = `${(size / 1024).toFixed(1)} КБ`;

            const backupDate = all['pt_backup_date'];
            if (backupDate) {
                const date = new Date(backupDate).toLocaleString('ru-RU', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });
                document.getElementById('stat-backup').textContent = date;
            } else {
                document.getElementById('stat-backup').textContent = '—';
            }
        } catch(e) {
            console.error('Ошибка статистики:', e);
        }
    }

    async function saveSettings() {
        const settings = {
            showWidget: document.getElementById('show-widget').checked,
            autoUpdate: document.getElementById('auto-update').checked,
            openCurrentTab: document.getElementById('open-current-tab').checked
        };
        await PTStorage.set('pt_settings', settings);

        const notif = {
            enabled: document.getElementById('notifications-enabled').checked,
            threshold: parseInt(document.getElementById('threshold').value) || 5,
            notifyMin: document.getElementById('notify-min').checked
        };
        await PTStorage.set('pt_notification_settings', notif);

        console.log('✅ Настройки сохранены');
    }

    // Миграция: проставить категории старым товарам
    async function migrateOldItems() {
        const tracked = await PTStorage.get('pt_tracked') || [];
        let changed = false;
    
        for (const item of tracked) {
            if (!item.category) {
                item.category = 'other';
                changed = true;
            }
            if (!Array.isArray(item.tags)) {
                item.tags = [];
                changed = true;
            }
        }
    
        if (changed) {
            if (PTStorage.safeSet) {
                await PTStorage.safeSet('pt_tracked', tracked);
            } else {
                await PTStorage.set('pt_tracked', tracked);
            }
            console.log(`✅ Миграция: обновлено ${tracked.length} товаров`);
        }
    }
    
    migrateOldItems();

    // ---- Управление категориями ----
    async function renderCategoriesManager() {
        const container = document.getElementById('categories-manager');
        if (!container) return;

        const custom = await PTStorage.get('pt_custom_categories') || {};
        const all = { ...window.CATEGORIES, ...custom };

        let html = '';
        for (const [id, cat] of Object.entries(all)) {
            if (id === 'all') continue; // Служебная
            const isBuiltin = !custom[id];
            const isOther = id === 'other';

            html += `
                <div class="category-item">
                    <div class="info">
                        <span style="font-size:16px;">${cat.icon}</span>
                        <span>${cat.name}</span>
                        ${isBuiltin ? '<span class="builtin">встроенная</span>' : ''}
                    </div>
                    <button class="remove-cat" 
                            data-id="${id}"
                            ${isBuiltin || isOther ? 'disabled' : ''}
                            title="${isBuiltin ? 'Встроенные нельзя удалить' : 'Удалить'}">✕</button>
                </div>
            `;
        }
        container.innerHTML = html;

        // Обработчики удаления
        container.querySelectorAll('.remove-cat:not([disabled])').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                if (!confirm(`Удалить категорию "${all[id].name}"?`)) return;

                const custom = await PTStorage.get('pt_custom_categories') || {};
                delete custom[id];
                await PTStorage.set('pt_custom_categories', custom);

                // Также сбрасываем эту категорию у товаров
                let tracked = await PTStorage.get('pt_tracked') || [];
                let changed = false;
                tracked.forEach(item => {
                    if (item.category === id) {
                        item.category = 'other';
                        changed = true;
                    }
                });
                if (changed) {
                    if (PTStorage.safeSet) {
                        await PTStorage.safeSet('pt_tracked', tracked);
                    } else {
                        await PTStorage.set('pt_tracked', tracked);
                    }
                }

                renderCategoriesManager();
            });
        });
    }

    // Добавление категории
    document.getElementById('add-category-btn')?.addEventListener('click', async () => {
        const nameInput = document.getElementById('new-cat-name');
        const iconInput = document.getElementById('new-cat-icon');
        const name = nameInput.value.trim();
        const icon = iconInput.value.trim() || '📦';

        if (!name) {
            alert('⚠️ Введите название');
            return;
        }

        // Генерируем ID из названия (транслитерация)
        const id = 'custom_' + name.toLowerCase()
            .replace(/[а-я]/g, (char) => {
                const map = {
                    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z',
                    'и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r',
                    'с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch',
                    'ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'
                };
                return map[char] || char;
            })
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');

        const custom = await PTStorage.get('pt_custom_categories') || {};

        // Проверяем, что такого ID ещё нет
        if (custom[id] || window.CATEGORIES[id]) {
            alert('⚠️ Такая категория уже существует');
            return;
        }

        custom[id] = { name, icon };
        await PTStorage.set('pt_custom_categories', custom);

        nameInput.value = '';
        iconInput.value = '';
        renderCategoriesManager();

        console.log(`✅ Добавлена категория: ${id} (${name})`);
    });

    // Вызываем при загрузке
    renderCategoriesManager();

    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', saveSettings);
    });

    document.getElementById('test-notification')?.addEventListener('click', async () => {
        const runtime = (typeof browser !== 'undefined' && browser.runtime) ? browser.runtime : chrome.runtime;
        try {
            await runtime.sendMessage({
                type: 'notify',
                title: '🔔 Тестовое уведомление',
                message: 'Если вы это видите — уведомления работают!'
            });
        } catch(e) {
            alert('❌ Ошибка: ' + e.message);
        }
    });

    document.getElementById('create-backup')?.addEventListener('click', async () => {
        const tracked = await PTStorage.get('pt_tracked') || [];
        if (tracked.length === 0) {
            alert('⚠️ Список пуст');
            return;
        }
        await PTStorage.set('pt_tracked_backup', tracked);
        await PTStorage.set('pt_backup_date', new Date().toISOString());
        alert(`✅ Бэкап создан: ${tracked.length} товаров`);
        await loadStorageStats();
    });

    document.getElementById('restore-backup')?.addEventListener('click', async () => {
        const backup = await PTStorage.get('pt_tracked_backup');
        if (!Array.isArray(backup) || backup.length === 0) {
            alert('⚠️ Резервная копия не найдена');
            return;
        }
        if (confirm(`♻️ Восстановить ${backup.length} товаров?`)) {
            if (PTStorage.safeSet) {
                await PTStorage.safeSet('pt_tracked', backup, { allowEmpty: true });
            } else {
                await PTStorage.set('pt_tracked', backup);
            }
            alert('✅ Восстановлено!');
            await loadStorageStats();
        }
    });

    document.getElementById('clear-all')?.addEventListener('click', async () => {
        if (!confirm('🗑️ Удалить ВСЕ товары и историю?')) return;
        const storage = (typeof browser !== 'undefined' && browser.storage) ? browser.storage.local : chrome.storage.local;
        const all = await storage.get(null);
        const keysToRemove = Object.keys(all).filter(k =>
            k === 'pt_tracked' || k.startsWith('price_history_')
        );
        await storage.remove(keysToRemove);
        alert('✅ Всё очищено');
        await loadStorageStats();
    });

    document.getElementById('export-all-json')?.addEventListener('click', async () => {
        const storage = (typeof browser !== 'undefined' && browser.storage) ? browser.storage.local : chrome.storage.local;
        const all = await storage.get(null);
        const json = JSON.stringify(all, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `price_tracker_full_backup_${new Date().toISOString().slice(0,10)}.json`;
        link.click();
        URL.revokeObjectURL(link.href);
    });

    document.getElementById('import-json')?.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (confirm('⚠️ Импорт перезапишет текущие данные. Продолжить?')) {
                        const storage = (typeof browser !== 'undefined' && browser.storage) ? browser.storage.local : chrome.storage.local;
                        await storage.set(data);
                        alert('✅ Импортировано!');
                        await loadStorageStats();
                    }
                } catch(err) {
                    alert('❌ Ошибка: ' + err.message);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    });

    loadSettings();
})();