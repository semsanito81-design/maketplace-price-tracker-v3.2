// popup.js — работает через PTStorage (единое хранилище расширения)
(function() {
    'use strict';

    console.log('🚀 POPUP START');

    // ---- КАТЕГОРИИ ----
    let CATEGORIES = {};

    async function loadCategories() {
       // Встроенные категории
       
        const builtin = {
            'all':          { name: 'Все',           icon: '📦' },
            'other':        { name: 'Другое',        icon: '📦' },  
        
            'electronics':  { name: 'Электроника',   icon: '💻' },
            'smartphones':  { name: 'Смартфоны',     icon: '📱' },
            'computers':    { name: 'Компьютеры',    icon: '🖥️' },
            'audio':        { name: 'Аудио',         icon: '🎧' },
            'tv':           { name: 'ТВ и видео',    icon: '📺' },
            'gaming':       { name: 'Игры',          icon: '🎮' },
            'photo':        { name: 'Фото и видео',  icon: '📷' },
            'appliances':   { name: 'Бытовая техника', icon: '🔌' },    
        
            'home':         { name: 'Дом',           icon: '🏠' },
            'furniture':    { name: 'Мебель',        icon: '🛋️' },
            'kitchen':      { name: 'Кухня',         icon: '🍳' },
            'garden':       { name: 'Дача и сад',    icon: '🌱' },
            'tools':        { name: 'Инструменты',   icon: '🔧' },
            'repair':       { name: 'Ремонт',        icon: '🏗️' },  
        
            'clothing':     { name: 'Одежда',        icon: '👕' },
            'shoes':        { name: 'Обувь',         icon: '👟' },
            'accessories':  { name: 'Аксессуары',    icon: '👜' },
            'jewelry':      { name: 'Украшения',     icon: '💍' },  
        
            'beauty':       { name: 'Красота',       icon: '💄' },
            'health':       { name: 'Здоровье',      icon: '💊' },
            'sport':        { name: 'Спорт',         icon: '⚽' },
            'fitness':      { name: 'Фитнес',        icon: '🏋️' },  
        
            'kids':         { name: 'Детям',         icon: '🧸' },
            'toys':         { name: 'Игрушки',       icon: '🎁' },
            'baby':         { name: 'Малышам',       icon: '🍼' },  
        
            'auto':         { name: 'Авто',          icon: '🚗' },
            'moto':         { name: 'Мото',          icon: '🏍️' },
            'auto_parts':   { name: 'Автозапчасти',  icon: '🔩' },  
        
            'food':         { name: 'Продукты',      icon: '🍎' },
            'pets':         { name: 'Животным',      icon: '🐾' },  
        
            'books':        { name: 'Книги',         icon: '📚' },
            'music':        { name: 'Музыка',        icon: '🎵' },
            'hobby':        { name: 'Хобби',         icon: '🎨' },
            'travel':       { name: 'Путешествия',   icon: '✈️' },  
        
            'gifts':        { name: 'Подарки',       icon: '🎀' },
            'office':       { name: 'Офис',          icon: '📎' },
            
            // Медицина и здоровье
            'pharmacy':         { name: 'Аптека',           icon: '💊' },
            'medical':          { name: 'Медтехника',       icon: '🩺' },
            'optics':           { name: 'Оптика',           icon: '👓' },

            // Быт
            'household':        { name: 'Бытовая химия',    icon: '🧴' },
            'hygiene':          { name: 'Гигиена',          icon: '🧼' },
            'cleaning':         { name: 'Уборка',           icon: '🧹' },

            // Стройка и ремонт
            'construction':     { name: 'Стройматериалы',   icon: '🧱' },
            'electrical':       { name: 'Электрика',        icon: '⚡' },
            'plumbing':         { name: 'Сантехника',       icon: '🚿' },

            // Активный отдых
            'fishing':          { name: 'Рыбалка',          icon: '🎣' },
            'hunting':          { name: 'Охота',            icon: '🏹' },
            'camping':          { name: 'Туризм',           icon: '⛺' },
            'winter_sports':    { name: 'Зимний спорт',     icon: '⛷️' },
            'water_sports':     { name: 'Водный спорт',     icon: '🏊' },

            // Умный дом
            'smart_home':       { name: 'Умный дом',        icon: '🏠' },
            'security':         { name: 'Безопасность',     icon: '🔒' },

            // Дети
            'baby_food':        { name: 'Детское питание',  icon: '🍼' },
            'school':           { name: 'Школа',            icon: '🎒' },

            // Творчество
            'art':              { name: 'Творчество',       icon: '🎨' },
            'musical':          { name: 'Музыкальные инструменты', icon: '🎸' }
        };
                // Пользовательские категории
        const custom = await PTStorage.get('pt_custom_categories') || {};

        // Объединяем
        CATEGORIES = { ...builtin, ...custom };
        console.log(`📁 Загружено категорий: ${Object.keys(CATEGORIES).length}`);
    }

    // ---- СИМВОЛЫ ВАЛЮТ ----
    const CURRENCY_SYMBOLS = {
        'RUB': '₽', 'USD': '$', 'EUR': '€', 'CNY': '¥', 'JPY': '¥',
        'GBP': '£', 'KZT': '₸', 'BYN': 'Br', 'UAH': '₴', 'TRY': '₺',
        'INR': '₹', 'KRW': '₩', 'BRL': 'R$', 'PLN': 'zł', 'CZK': 'Kč',
        'SEK': 'kr', 'CHF': '₣', 'AED': 'د.إ', 'ILS': '₪', 'THB': '฿',
        'VND': '₫', 'IDR': 'Rp', 'MYR': 'RM', 'PHP': '₱', 'SGD': 'S$',
        'HKD': 'HK$', 'TWD': 'NT$', 'AUD': 'A$', 'CAD': 'C$'
    };

    

    function getCurrencySymbol(code) {
        if (!code) return '₽';
        const upper = String(code).toUpperCase();
        return CURRENCY_SYMBOLS[upper] || upper;
    }

    function formatPrice(price, currency) {
        if (price === null || price === undefined || price === 0) return '—';
        const formatted = Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return currency ? `${formatted} ${getCurrencySymbol(currency)}` : formatted;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }

    // ---- Состояние фильтров ----
    let currentFilter = 'all';
    let currentSearch = '';

    // ---- URL товара ----
    function getProductUrl(item) {
        if (item.url && item.url.startsWith('http')) return item.url;

        switch (item.market) {
            case 'ozon':        return `https://www.ozon.ru/product/${item.id}/`;
            case 'ozon_kz':     return `https://www.ozon.kz/product/${item.id}/`;
            case 'wildberries': return `https://www.wildberries.ru/catalog/${item.id}/detail.aspx`;
            case 'yandex':      return `https://market.yandex.ru/product/${item.id}`;
            case 'aliexpress':  return `https://aliexpress.ru/item/${item.id}.html`;
            default:            return null;
        }
    }

    function openProduct(url) {
        if (!url || !url.startsWith('http')) return;
        try {
            if (typeof browser !== 'undefined' && browser.tabs) {
                browser.tabs.create({ url });
            } else if (typeof chrome !== 'undefined' && chrome.tabs) {
                chrome.tabs.create({ url });
            } else {
                window.open(url, '_blank');
            }
            window.close();
        } catch (e) {
            window.open(url, '_blank');
        }
    }

    // ---- Рендер категорий ----
    async function renderCategories(tracked) {
        const container = document.getElementById('categories');
        if (!container) return;

        const counts = { all: tracked.length };
        tracked.forEach(item => {
            const cat = item.category || 'other';
            counts[cat] = (counts[cat] || 0) + 1;
        });

        container.innerHTML = Object.entries(CATEGORIES).map(([id, cat]) => {
            const count = counts[id] || 0;
            if (count === 0 && id !== 'all') return '';
            const active = currentFilter === id ? 'active' : '';
            return `
                <button class="category-btn ${active}" data-category="${id}">
                    ${cat.icon} ${cat.name}
                    <span class="count">${count}</span>
                </button>
            `;
        }).join('');

        container.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentFilter = btn.dataset.category;
                loadTracked();
            });
        });
    }

    // ---- Фильтрация ----
    function filterTracked(tracked) {
        let filtered = tracked;

        if (currentFilter !== 'all') {
            filtered = filtered.filter(item => (item.category || 'other') === currentFilter);
        }

        if (currentSearch) {
            filtered = filtered.filter(item =>
                (item.name || '').toLowerCase().includes(currentSearch) ||
                (item.tags || []).some(tag => tag.toLowerCase().includes(currentSearch))
            );
        }

        return filtered;
    }

    // ---- Загрузка списка ----
    async function loadTracked() {
        await loadCategories();
        const container = document.getElementById('tracked-container');
        if (!container) return;

        try {
            const allTracked = await PTStorage.get('pt_tracked') || [];
            console.log(`📦 Всего товаров: ${allTracked.length}`);

            // Рендерим категории
            await renderCategories(allTracked);

            // Фильтруем
            const tracked = filterTracked(allTracked);

            // Обновляем бейдж
            const badge = document.getElementById('count-badge');
            if (badge) {
                badge.textContent = tracked.length === allTracked.length
                    ? `${allTracked.length} товаров`
                    : `${tracked.length} из ${allTracked.length}`;
            }

            // Статистика
            const totalCountEl = document.getElementById('total-count');
            const totalChangeEl = document.getElementById('total-change');
            const discountCountEl = document.getElementById('discount-count');

            if (totalCountEl) totalCountEl.textContent = tracked.length;

            let totalChange = 0;
            let discountCount = 0;
            for (const item of tracked) {
                if (item.originalPrice && item.currentPrice) {
                    totalChange += (item.originalPrice - item.currentPrice);
                    discountCount++;
                }
            }

            const currencies = new Set(tracked.map(i => i.currency || 'RUB'));
            const commonCurrency = currencies.size === 1 ? [...currencies][0] : null;

            if (totalChangeEl) {
                const symbol = commonCurrency ? getCurrencySymbol(commonCurrency) : '';
                totalChangeEl.textContent = `${totalChange > 0 ? '+' : ''}${formatPrice(totalChange)}${symbol ? ' ' + symbol : ''}`;
            }
            if (discountCountEl) discountCountEl.textContent = discountCount;

            if (tracked.length === 0) {
                const isEmpty = allTracked.length === 0;
                container.innerHTML = `
                    <div class="empty">
                        <span class="icon">${isEmpty ? '📭' : '🔍'}</span>
                        ${isEmpty ? 'Нет отслеживаемых товаров' : 'Ничего не найдено'}
                        <small>${isEmpty
                            ? 'Откройте товар и нажмите "Отслеживать"'
                            : 'Попробуйте изменить фильтр или поиск'}</small>
                    </div>
                `;
                return;
            }

            let html = '<ul class="tracked-list">';
            for (const item of tracked) {
                const price = item.currentPrice || '—';
                const name = (item.name || 'Без названия').slice(0, 40);
                const marketLabels = {
                    'ozon': '🟦 Ozon',
                    'ozon_kz': '🟦 Ozon KZ',
                    'wildberries': '🟪 WB',
                    'yandex': '🟩 Я.Маркет',
                    'aliexpress': '🟧 AliExpress'
                };
                const market = marketLabels[item.market] || item.market || '';
                const productUrl = getProductUrl(item) || '';
                const itemCurrency = item.currency || 'RUB';
                const cat = CATEGORIES[item.category || 'other'] || CATEGORIES['other'];
                const tagsLine = item.tags && item.tags.length > 0
                    ? `<div class="tags-line">🏷️ ${item.tags.map(t => escapeHtml(t)).join(', ')}</div>`
                    : '';

                html += `
                    <li class="tracked-item" 
                        data-url="${escapeHtml(productUrl)}" 
                        data-id="${escapeHtml(item.id || '')}" 
                        data-market="${escapeHtml(item.market || '')}"
                        title="Открыть: ${escapeHtml(name)}">
                        <div class="info">
                            <div class="name">${escapeHtml(name)}</div>
                            <div class="market">
                                <span class="site ${item.market || ''}">${market}</span>
                                ${item.id ? ` • ${escapeHtml(item.id.slice(0, 10))}` : ''}
                                • ${cat.icon} ${cat.name}
                            </div>
                            ${tagsLine}
                        </div>
                        <div class="price-block">
                            <div class="current-price">${formatPrice(price, itemCurrency)}</div>
                            ${item.discount ? `<span class="discount-badge">-${item.discount}%</span>` : ''}
                            <button class="tags-btn" data-id="${escapeHtml(item.id)}" data-market="${escapeHtml(item.market)}" title="Теги">🏷️</button>
                        </div>
                        <button class="remove-btn" data-id="${escapeHtml(item.id || '')}" data-market="${escapeHtml(item.market || '')}" title="Удалить">✕</button>
                    </li>
                `;
            }
            html += '</ul>';

            container.innerHTML = html;
            
            document.querySelectorAll('.tags-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const id = btn.dataset.id;
                    const market = btn.dataset.market;
                    
                    let tracked = await PTStorage.get('pt_tracked') || [];
                    const item = tracked.find(i => i.id === id && i.market === market);
                    if (!item) return;
                    
                    const current = (item.tags || []).join(', ');
                    const input = prompt('🏷️ Теги (через запятую):', current);
                    if (input === null) return;
                    
                    item.tags = input.split(',').map(t => t.trim()).filter(t => t);
                    
                    if (PTStorage.safeSet) {
                        await PTStorage.safeSet('pt_tracked', tracked);
                    } else {
                        await PTStorage.set('pt_tracked', tracked);
                    }
                    loadTracked();
                });
            });

            // Обработчик удаления
            document.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', async function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    const id = this.dataset.id;
                    const market = this.dataset.market;
                    let tracked = await PTStorage.get('pt_tracked') || [];
                    tracked = tracked.filter(item => !(item.id === id && item.market === market));
                    if (PTStorage.safeSet) {
                        await PTStorage.safeSet('pt_tracked', tracked, { allowEmpty: true });
                    } else {
                        await PTStorage.set('pt_tracked', tracked);
                    }
                    loadTracked();
                });
            });

            // Обработчик перехода
            document.querySelectorAll('.tracked-item').forEach(item => {
                item.addEventListener('click', function(e) {
                    if (e.target.closest('.remove-btn')) return;
                    const url = this.dataset.url;
                    if (url && url.startsWith('http')) {
                        openProduct(url);
                    } else {
                        const fallbackUrl = getProductUrl({
                            id: this.dataset.id,
                            market: this.dataset.market
                        });
                        if (fallbackUrl) openProduct(fallbackUrl);
                    }
                });
            });

        } catch (error) {
            console.error('❌ Ошибка:', error);
            container.innerHTML = `<div class="empty">❌ Ошибка: ${error.message}</div>`;
        }
    }

    // ---- Поиск ----
    document.getElementById('search-input')?.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase().trim();
        loadTracked();
    });

    // ---- Кнопки ----
    document.getElementById('clear-all')?.addEventListener('click', async () => {
        if (confirm('🗑️ Удалить всё? Это действие можно отменить кнопкой «Восстановить».')) {
            if (PTStorage.safeSet) {
                await PTStorage.safeSet('pt_tracked', [], { allowEmpty: true });
            } else {
                await PTStorage.remove('pt_tracked');
            }
            loadTracked();
        }
    });

    document.getElementById('restore-backup')?.addEventListener('click', async () => {
        const backup = await PTStorage.get('pt_tracked_backup');
        if (Array.isArray(backup) && backup.length > 0) {
            if (confirm(`♻️ Восстановить ${backup.length} товаров из резервной копии?`)) {
                if (PTStorage.safeSet) {
                    await PTStorage.safeSet('pt_tracked', backup, { allowEmpty: true });
                } else {
                    await PTStorage.set('pt_tracked', backup);
                }
                alert(`✅ Восстановлено ${backup.length} товаров`);
                loadTracked();
            }
        } else {
            alert('⚠️ Резервная копия не найдена или пуста');
        }
    });

    document.getElementById('refresh-all')?.addEventListener('click', async () => {
        const tracked = await PTStorage.get('pt_tracked') || [];
        if (tracked.length === 0) {
            alert('⚠️ Нет товаров для обновления');
            return;
        }

        const confirmed = confirm(`🔄 Обновить цены для ${tracked.length} товаров?\n\nЭто откроет вкладки в фоне. Продолжить?`);
        if (!confirmed) return;

        const btn = document.getElementById('refresh-all');
        const originalText = btn.textContent;
        btn.textContent = '⏳ Обновление...';
        btn.disabled = true;

        const runtime = (typeof browser !== 'undefined' && browser.runtime) ? browser.runtime : chrome.runtime;
        const tabs = (typeof browser !== 'undefined' && browser.tabs) ? browser.tabs : chrome.tabs;

        let updated = 0;
        let failed = 0;

        for (const item of tracked) {
            if (!item.url) { failed++; continue; }

            let tab = null;
            try {
                tab = await new Promise((resolve, reject) => {
                    try {
                        const result = tabs.create({ url: item.url, active: false });
                        if (result && result.then) {
                            result.then(resolve).catch(reject);
                        } else {
                            resolve(result);
                        }
                    } catch(e) { reject(e); }
                });

                await new Promise((resolve) => {
                    const timeout = setTimeout(resolve, 12000);
                    const listener = (tabId, changeInfo) => {
                        if (tabId === tab.id && changeInfo.status === 'complete') {
                            clearTimeout(timeout);
                            if (tabs.onUpdated) tabs.onUpdated.removeListener(listener);
                            resolve();
                        }
                    };
                    if (tabs.onUpdated) tabs.onUpdated.addListener(listener);
                    else setTimeout(resolve, 6000);
                });

                await new Promise(r => setTimeout(r, 2500));

                const response = await new Promise((resolve) => {
                    try {
                        const result = tabs.sendMessage(tab.id, { type: 'get_current_price' });
                        if (result && result.then) {
                            result.then(resolve).catch(() => resolve(null));
                        } else {
                            resolve(result);
                        }
                    } catch(e) { resolve(null); }
                });

                if (response && response.price) {
                    item.currentPrice = response.price;
                    item.originalPrice = response.original || item.originalPrice;
                    item.discount = response.discount || item.discount;
                    item.currency = response.currency || item.currency || 'RUB';
                    item.lastCheck = new Date().toISOString();
                    updated++;
                } else {
                    failed++;
                }
            } catch(e) {
                failed++;
            } finally {
                if (tab && tab.id) {
                    try {
                        const r = tabs.remove(tab.id);
                        if (r && r.catch) r.catch(() => {});
                    } catch(e) {}
                }
                await new Promise(r => setTimeout(r, 1000));
            }
        }

        if (PTStorage.safeSet) {
            await PTStorage.safeSet('pt_tracked', tracked);
        } else {
            await PTStorage.set('pt_tracked', tracked);
        }

        btn.textContent = originalText;
        btn.disabled = false;

        alert(`✅ Обновлено: ${updated}\n⚠️ Не удалось: ${failed}`);
        loadTracked();
    });

    document.getElementById('refresh-btn')?.addEventListener('click', loadTracked);

    loadTracked();
})();