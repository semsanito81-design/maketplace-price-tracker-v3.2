// storage.js — универсальная обёртка над browser.storage.local / chrome.storage.local
(function() {
    'use strict';

    const hasBrowserApi = typeof browser !== 'undefined' && browser.storage && browser.storage.local;
    const hasChromeApi  = typeof chrome  !== 'undefined' && chrome.storage  && chrome.storage.local;

    let storage;
    if (hasBrowserApi) {
        storage = browser.storage.local;
    } else if (hasChromeApi) {
        storage = {
            get: (keys) => new Promise((resolve) => chrome.storage.local.get(keys, (result) => {
                if (chrome.runtime.lastError) {
                    console.error('Storage get error:', chrome.runtime.lastError);
                    resolve({});
                } else {
                    resolve(result);
                }
            })),
            set: (items) => new Promise((resolve) => chrome.storage.local.set(items, () => {
                if (chrome.runtime.lastError) console.error('Storage set error:', chrome.runtime.lastError);
                resolve();
            })),
            remove: (keys) => new Promise((resolve) => chrome.storage.local.remove(keys, () => {
                if (chrome.runtime.lastError) console.error('Storage remove error:', chrome.runtime.lastError);
                resolve();
            }))
        };
    } else {
        console.error('❌ Ни browser.storage, ни chrome.storage не доступны');
        storage = {
            get: async (keys) => {
                const result = {};
                const arr = Array.isArray(keys) ? keys : [keys];
                for (const k of arr) {
                    try { result[k] = JSON.parse(localStorage.getItem(k)); } catch(e) { result[k] = undefined; }
                }
                return Array.isArray(keys) ? result : result[keys];
            },
            set: async (items) => {
                for (const [k, v] of Object.entries(items)) localStorage.setItem(k, JSON.stringify(v));
            },
            remove: async (keys) => {
                for (const k of (Array.isArray(keys) ? keys : [keys])) localStorage.removeItem(k);
            }
        };
    }

    // ---- Безопасная запись с автобэкапом ----
    async function safeSet(key, value, options = {}) {
        const { allowEmpty = false } = options;

        try {
            // Читаем текущее значение
            const current = await storage.get(key);
            const existing = current[key];

            // Защита: не затираем непустой массив пустым (если не разрешено явно)
            if (key === 'pt_tracked' && Array.isArray(value) && !allowEmpty) {
                if (Array.isArray(existing) && existing.length > 0 && value.length === 0) {
                    console.warn('⚠️ safeSet: попытка затереть непустой pt_tracked пустым — отменено');
                    return false;
                }
            }

            // Делаем бэкап предыдущего значения (только если оно непустое)
            if (existing !== undefined && existing !== null) {
                const isEmptyArray = Array.isArray(existing) && existing.length === 0;
                if (!isEmptyArray) {
                    await storage.set({ [`${key}_backup`]: existing });
                    console.log(`💾 Бэкап "${key}" сохранён (${Array.isArray(existing) ? existing.length + ' эл.' : typeof existing})`);
                }
            }

            // Основная запись
            await storage.set({ [key]: value });
            console.log(`✅ safeSet "${key}": записано`);
            return true;

        } catch(e) {
            console.error(`❌ safeSet ошибка для "${key}":`, e);
            return false;
        }
    }

    window.PTStorage = {
        async get(key) {
            const result = await storage.get(key);
            return result[key];
        },
        async set(key, value) {
            await storage.set({ [key]: value });
        },
        async safeSet(key, value, options) {
            return await safeSet(key, value, options);
        },
        async remove(key) {
            await storage.remove(key);
        },
        async getMultiple(keys) {
            return await storage.get(keys);
        }
    };

    console.log('✅ PTStorage инициализирован (с safeSet)');
})();