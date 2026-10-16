// core.js — ОБЩАЯ ЛОГИКА (виджет, история, уведомления, статистика, валюты, сравнение, обновление цен)
(function() {
    'use strict';

    // ВАЖНО: НЕ устанавливаем window.MARKET здесь!
    // Его устанавливает модуль площадки (ozon.js, wildberries.js, yandex.js, aliexpress.js)
    // init() ждёт, пока MARKET появится.
    console.log(`🚀 Price Tracker START (MARKET=${window.MARKET || 'ещё не установлен'})`);

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

    window.getCurrencySymbol = getCurrencySymbol;
    window.formatPrice = formatPrice;

    // ---- КАТЕГОРИИ (расширенный список) ----
    window.CATEGORIES = {
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
        'musical':          { name: 'Музыкальные инструменты', icon: '🎸' },        
        'medicines':      { name: 'Лекарства',      icon: '💊' },
        'pet_food':       { name: 'Корм для животных', icon: '🐾' }
    };

    // ---- ПОЛУЧЕНИЕ НАЗВАНИЯ ----
    function getProductName() {
        if (typeof window.getProductName === 'function') {
            const name = window.getProductName();
            if (name && name !== 'Товар без названия') {
                console.log(`📝 Название из функции площадки: ${name}`);
                return name;
            }
        }

        const selectors = {
            'ozon': ['[data-test-id="product-title"]', '.product-title', 'h1', '[itemprop="name"]'],
            'ozon_kz': ['[data-test-id="product-title"]', '.product-title', 'h1', '[itemprop="name"]'],
            'wildberries': ['.product-name', '.product-card__name', 'h1', '.product-page__title'],
            'yandex': ['.product-title__text', '.product-card__title', 'h1', '[itemprop="name"]'],
            'aliexpress': ['h1[data-pl="product-title"]', '.product-title-text', 'h1']
        };

        const sel = selectors[window.MARKET] || ['h1'];
        for (const s of sel) {
            const el = document.querySelector(s);
            if (el) {
                const name = el.textContent.trim();
                if (name.length > 0 && name.length < 500) {
                    console.log(`📝 Название из селектора (${s}): ${name}`);
                    return name;
                }
            }
        }

        const title = document.title;
        if (title && title.length > 5) {
            const cleaned = title.replace(/\s*[-–]\s*(купить|цена|стоимость|отзывы|Wildberries|Ozon|Яндекс\.Маркет|AliExpress).*/i, '').trim();
            if (cleaned.length > 5) {
                console.log(`📝 Название из title: ${cleaned}`);
                return cleaned;
            }
        }

        return 'Товар без названия';
    }

    function getHistoryKey(id) {
        return `price_history_${window.MARKET}_${id}`;
    }

    async function getPriceHistory(productId) {
        if (!productId) return [];
        try {
            const key = getHistoryKey(productId);
            const data = await PTStorage.get(key);
            if (data) {
                console.log(`📊 Загружено ${data.length} записей истории (${window.MARKET})`);
                return data;
            }
        } catch(e) {}
        return [];
    }

    async function savePrice(productId, price, currency) {
        if (!productId) return [];
        try {
            const key = getHistoryKey(productId);
            let history = await getPriceHistory(productId);

            const lastEntry = history.length > 0 ? history[history.length - 1] : null;
            if (!lastEntry || lastEntry.price !== price) {
                history.push({
                    price: price,
                    date: new Date().toISOString()
                });
                if (history.length > 500) {
                    history = history.slice(-500);
                }
                await PTStorage.set(key, history);
                console.log(`💾 Сохранена цена: ${price} (всего ${history.length} записей)`);

                await checkNotifications(productId, price, history, currency);
            }
            return history;
        } catch(e) {
            console.warn('⚠️ Не удалось сохранить историю:', e);
            return [];
        }
    }

    async function checkNotifications(productId, currentPrice, history, currency) {
        if (history.length < 2) return;

        const settings = await PTStorage.get('pt_notification_settings') || {};
        if (settings.enabled === false) return;
        const threshold = settings.threshold || 5;

        const prevPrice = history[history.length - 2].price;
        const change = currentPrice - prevPrice;
        const changePercent = ((change / prevPrice) * 100);

        const symbol = getCurrencySymbol(currency || 'RUB');

        if (change < 0 && Math.abs(changePercent) >= threshold) {
            await sendNotification('📉 Цена упала!', `Товар подешевел на ${Math.abs(changePercent).toFixed(1)}%\nТекущая цена: ${currentPrice} ${symbol}`);
        }
        if (change > 0 && changePercent >= threshold) {
            await sendNotification('📈 Цена выросла!', `Товар подорожал на ${changePercent.toFixed(1)}%\nТекущая цена: ${currentPrice} ${symbol}`);
        }

        const minPrice = Math.min(...history.map(h => h.price));
        if (currentPrice <= minPrice && history.length > 2) {
            await sendNotification('🏆 Новая минимальная цена!', `Цена: ${currentPrice} ${symbol}`);
        }
    }

    async function sendNotification(title, message) {
        const runtime = (typeof browser !== 'undefined' && browser.runtime) ? browser.runtime : chrome.runtime;
        try {
            await runtime.sendMessage({ type: 'notify', title, message });
        } catch(e) {
            console.log(`🔔 ${title}: ${message}`);
        }
    }

    function getStatistics(history) {
        if (!history || history.length === 0) return null;

        const prices = history.map(h => h.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
        const currentPrice = prices[prices.length - 1];
        const firstPrice = prices[0];
        const totalChange = currentPrice - firstPrice;
        const changePercent = firstPrice > 0 ? ((totalChange / firstPrice) * 100) : 0;

        let trend = 'стабильна';
        if (history.length >= 3) {
            const recent = history.slice(-3);
            const recentPrices = recent.map(h => h.price);
            const isUp = recentPrices[2] > recentPrices[0];
            const isDown = recentPrices[2] < recentPrices[0];
            const changeRecent = ((recentPrices[2] - recentPrices[0]) / recentPrices[0] * 100);

            if (Math.abs(changeRecent) < 1) trend = 'стабильна';
            else if (isUp && changeRecent > 3) trend = '📈 растёт';
            else if (isDown && changeRecent < -3) trend = '📉 падает';
            else if (isUp) trend = '↗️ слегка растёт';
            else if (isDown) trend = '↘️ слегка падает';
        }

        let recommendation = '💰 Цена в норме';
        const maxDiscount = ((maxPrice - currentPrice) / maxPrice * 100);
        if (maxDiscount > 25) recommendation = '🔥 Отличная цена!';
        else if (maxDiscount > 15) recommendation = '👍 Хорошая цена';
        else if (trend === '📈 растёт') recommendation = '⚠️ Цена растёт, стоит поторопиться';
        else if (trend === '📉 падает') recommendation = '⏳ Цена падает, можно подождать';

        return {
            minPrice, maxPrice, avgPrice, currentPrice, firstPrice,
            totalChange,
            changePercent: changePercent.toFixed(1),
            trend, recommendation,
            totalRecords: history.length
        };
    }

    function drawChart(canvas, history, currentPrice, currency) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        const width = rect.width || 340;
        const height = rect.height || 120;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, width, height);

        if (!history || history.length < 2) {
            ctx.fillStyle = '#999';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('📊 Нужно больше данных (минимум 2 записи)', width/2, height/2);
            return;
        }

        const data = history;
        const prices = data.map(p => p.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const range = maxPrice - minPrice || 1;
        const padding = { top: 10, bottom: 10, left: 10, right: 10 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = '#e8e8e8';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 5; i++) {
            const y = padding.top + (i / 4) * chartHeight;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();

            const price = Math.round(maxPrice - (i / 4) * range);
            ctx.fillStyle = '#999';
            ctx.font = '8px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(formatPrice(price), padding.left - 4, y + 3);
        }

        ctx.beginPath();
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#005bff');
        gradient.addColorStop(0.5, '#4a8cff');
        gradient.addColorStop(1, '#005bff');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;

        data.forEach((p, i) => {
            const x = padding.left + (i / (data.length - 1)) * chartWidth;
            const y = padding.top + chartHeight - ((p.price - minPrice) / range) * chartHeight;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        const lastX = padding.left + chartWidth;
        const lastY = padding.top + chartHeight - ((data[data.length - 1].price - minPrice) / range) * chartHeight;
        ctx.lineTo(lastX, padding.top + chartHeight);
        ctx.lineTo(padding.left, padding.top + chartHeight);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 91, 255, 0.05)';
        ctx.fill();

        data.forEach((p, i) => {
            const x = padding.left + (i / (data.length - 1)) * chartWidth;
            const y = padding.top + chartHeight - ((p.price - minPrice) / range) * chartHeight;

            const isLast = i === data.length - 1;
            const isMin = p.price === minPrice;
            const isMax = p.price === maxPrice;

            let radius = 3;
            let color = '#005bff';

            if (isLast) {
                radius = 5;
                color = '#ff4757';
            } else if (isMin) {
                radius = 4;
                color = '#2ecc71';
            } else if (isMax) {
                radius = 4;
                color = '#ff6b35';
            }

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();

            if (isLast) {
                ctx.fillStyle = '#ff4757';
                ctx.font = 'bold 9px sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText(formatPrice(p.price, currency), x + 6, y - 4);
            }
            if (isMin && !isLast) {
                ctx.fillStyle = '#2ecc71';
                ctx.font = '8px sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText(`⬇ ${formatPrice(p.price)}`, x + 4, y + 12);
            }
            if (isMax && !isLast) {
                ctx.fillStyle = '#ff6b35';
                ctx.font = '8px sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText(`⬆ ${formatPrice(p.price)}`, x + 4, y - 4);
            }
        });

        if (data.length > 0) {
            const firstDate = new Date(data[0].date);
            const lastDate = new Date(data[data.length - 1].date);

            ctx.fillStyle = '#aaa';
            ctx.font = '7px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(firstDate.toLocaleDateString('ru-RU'), padding.left, height - 2);
            ctx.textAlign = 'right';
            ctx.fillText(lastDate.toLocaleDateString('ru-RU'), width - padding.right, height - 2);
        }
    }

    function exportToCSV(history, productName, productId, currency) {
        if (!history || history.length === 0) {
            alert('⚠️ Нет данных для экспорта');
            return;
        }

        const symbol = getCurrencySymbol(currency);
        let csv = `Дата;Цена (${symbol});Изменение\n`;
        let prevPrice = null;
        for (const entry of history) {
            const date = new Date(entry.date);
            const dateStr = date.toLocaleString('ru-RU');
            let change = '';
            if (prevPrice !== null) {
                const diff = entry.price - prevPrice;
                change = (diff > 0 ? '+' : '') + diff;
            }
            prevPrice = entry.price;
            csv += `${dateStr};${entry.price};${change}\n`;
        }

        const prices = history.map(h => h.price);
        csv += `\n\n--- СТАТИСТИКА ---\n`;
        csv += `Товар;${productName || 'Без названия'}\n`;
        csv += `ID;${productId || 'Неизвестно'}\n`;
        csv += `Площадка;${window.MARKET}\n`;
        csv += `Всего записей;${history.length}\n`;
        csv += `Минимальная цена;${Math.min(...prices)} ${symbol}\n`;
        csv += `Максимальная цена;${Math.max(...prices)} ${symbol}\n`;
        csv += `Средняя цена;${Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)} ${symbol}\n`;

        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `price_history_${window.MARKET}_${productId || 'unknown'}_${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);

        alert(`✅ Экспортировано ${history.length} записей в CSV`);
    }

    function saveToFile(history, productName, productId, currency) {
        if (!history || history.length === 0) {
            alert('⚠️ Нет данных для сохранения');
            return;
        }

        const data = {
            productId: productId,
            productName: productName,
            market: window.MARKET,
            currency: currency || 'RUB',
            exportDate: new Date().toISOString(),
            totalRecords: history.length,
            history: history,
            statistics: {
                firstPrice: history[0]?.price || null,
                lastPrice: history[history.length - 1]?.price || null,
                minPrice: Math.min(...history.map(h => h.price)),
                maxPrice: Math.max(...history.map(h => h.price)),
                avgPrice: Math.round(history.reduce((a, b) => a + b.price, 0) / history.length),
                totalChange: (history[history.length - 1]?.price || 0) - (history[0]?.price || 0)
            }
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `price_data_${window.MARKET}_${productId || 'unknown'}_${new Date().toISOString().slice(0,10)}.json`;
        link.click();
        URL.revokeObjectURL(link.href);

        alert(`✅ Сохранено ${history.length} записей в JSON`);
    }

    async function loadFromFile(productId) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async function(event) {
                try {
                    const data = JSON.parse(event.target.result);
                    if (data.history && Array.isArray(data.history)) {
                        const key = getHistoryKey(productId || data.productId);
                        await PTStorage.set(key, data.history);
                        alert(`✅ Загружено ${data.history.length} записей!\nОбновите страницу (F5)`);
                        console.log('📥 Загружены данные:', data);
                    } else {
                        alert('⚠️ Неверный формат файла');
                    }
                } catch(err) {
                    alert('⚠️ Ошибка чтения файла: ' + err.message);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    // ---- ОБНОВЛЕНИЕ ЦЕНЫ УЖЕ ОТСЛЕЖИВАЕМОГО ТОВАРА ----
    async function updateTrackedPrice(productId, currentPrice, originalPrice, discount, quantity, currency) {
        if (!productId || !currentPrice) return;
        try {
            let tracked = await PTStorage.get('pt_tracked') || [];
            const existing = tracked.find(item => item.id === productId && item.market === window.MARKET);
            if (!existing) return;

            const changed = existing.currentPrice !== currentPrice;

            existing.currentPrice = currentPrice;
            existing.originalPrice = originalPrice;
            existing.discount = discount;
            existing.quantity = quantity;
            existing.currency = currency || existing.currency || 'RUB';
            existing.lastCheck = new Date().toISOString();

            if (PTStorage.safeSet) {
                await PTStorage.safeSet('pt_tracked', tracked);
            } else {
                await PTStorage.set('pt_tracked', tracked);
            }

            if (changed) {
                console.log(`🔄 Обновлена цена отслеживаемого товара: ${existing.currentPrice} → ${currentPrice}`);
            } else {
                console.log(`✅ Цена без изменений: ${currentPrice}`);
            }
        } catch(e) {
            console.warn('⚠️ Не удалось обновить отслеживаемый товар:', e);
        }
    }

    // ---- ПОИСК НА ДРУГИХ МАРКЕТПЛЕЙСАХ ----
    function getSearchUrl(market, productName) {
        const cleanName = productName
            .replace(/\s*\(нет в наличии\)\s*/i, '')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 100);
        const query = encodeURIComponent(cleanName);

        const urls = {
            'ozon': `https://www.ozon.ru/search/?text=${query}`,
            'ozon_kz': `https://www.ozon.kz/search/?text=${query}`,
            'wildberries': `https://www.wildberries.ru/catalog/0/search.aspx?search=${query}`,
            'yandex': `https://market.yandex.ru/search?text=${query}`,
            'aliexpress': `https://aliexpress.ru/wholesale?SearchText=${query}`
        };
        return urls[market] || null;
    }

    function openTab(url) {
        if (!url) return;
        try {
            if (typeof browser !== 'undefined' && browser.tabs && browser.tabs.create) {
                browser.tabs.create({ url: url, active: true })
                    .catch(e => { console.error(e); window.open(url, '_blank'); });
            } else if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
                chrome.tabs.create({ url: url, active: true }, () => {
                    if (chrome.runtime.lastError) {
                        window.open(url, '_blank');
                    }
                });
            } else {
                window.open(url, '_blank');
            }
        } catch(e) {
            window.open(url, '_blank');
        }
    }

    // ---- УМНОЕ ПРЕДЛОЖЕНИЕ КАТЕГОРИИ ----
    function suggestCategory(productName) {
        if (!productName) return 'other';
        const name = productName.toLowerCase();

        const rules = [
            { cat: 'smartphones',  keys: ['смартфон', 'iphone', 'samsung galaxy', 'xiaomi', 'redmi', 'poco', 'honor', 'realme'] },
            { cat: 'computers',    keys: ['ноутбук', 'пк', 'компьютер', 'монитор', 'клавиатура', 'мышь', 'ssd', 'hdd', 'процессор', 'видеокарта', 'материнская плата'] },
            { cat: 'audio',        keys: ['наушники', 'колонка', 'гарнитура', 'аудио', 'динамик', 'микрофон', 'саундбар'] },
            { cat: 'tv',           keys: ['телевизор', 'тв', 'smart tv', 'проектор', 'приставка'] },
            { cat: 'gaming',       keys: ['игровая', 'геймпад', 'джойстик', 'playstation', 'xbox', 'nintendo', 'консоль'] },
            { cat: 'photo',        keys: ['фотоаппарат', 'камера', 'объектив', 'штатив', 'экшн-камера'] },
            { cat: 'appliances',   keys: ['холодильник', 'стиральная', 'посудомоечная', 'микроволновк', 'мультиварк', 'кофемашина', 'чайник', 'утюг', 'фен', 'пылесос'] },
            { cat: 'electronics',  keys: ['кабель', 'зарядка', 'адаптер', 'переходник', 'плата', 'аккумулятор', 'батарейк', 'power bank', 'повербанк', 'usb', 'hdmi', 'резистор'] },

            { cat: 'furniture',    keys: ['диван', 'кровать', 'шкаф', 'стол', 'стул', 'кресло', 'мебель', 'тумба', 'полка'] },
            { cat: 'kitchen',      keys: ['кастрюля', 'сковорода', 'тарелка', 'чашка', 'кружка', 'столовые приборы', 'нож', 'разделочная'] },
            { cat: 'garden',       keys: ['дача', 'сад', 'семена', 'рассада', 'газон', 'теплица', 'лопата', 'грабли', 'шланг'] },
            { cat: 'tools',        keys: ['дрель', 'шуруповерт', 'молоток', 'отвертка', 'ключ гаечный', 'набор инструмент', 'сверло', 'шабер', 'фаскосниматель', 'заусенц'] },
            { cat: 'repair',       keys: ['плитка', 'обои', 'краска', 'ламинат', 'клей', 'герметик', 'штукатурка', 'гипсокартон', 'наливной пол', 'крошка', 'мраморн', 'затирк', 'грунтовк', 'самовыравнивающ'] },
            { cat: 'home',         keys: ['дом', 'кухн', 'посуд', 'светильник', 'лампа', 'люстра', 'ковер', 'шторы', 'постельное', 'вентиль', 'смеситель', 'душевое ограждение', 'сантехник'] },

            { cat: 'clothing',     keys: ['футболка', 'рубашка', 'джинсы', 'куртка', 'платье', 'брюки', 'шорты', 'свитер', 'толстовка', 'пальто', 'носки', 'белье'] },
            { cat: 'shoes',        keys: ['кроссовки', 'ботинки', 'туфли', 'сандалии', 'сапоги', 'кеды', 'мокасины', 'тапочки'] },
            { cat: 'accessories',  keys: ['сумка', 'рюкзак', 'кошелек', 'ремень', 'очки', 'зонт', 'перчатки', 'шапка', 'шарф'] },
            { cat: 'jewelry',      keys: ['кольцо', 'серьги', 'цепочка', 'браслет', 'подвеска', 'украшение', 'ювелирн'] },

            { cat: 'beauty',       keys: ['крем', 'шампунь', 'маска', 'помада', 'тушь', 'пудра', 'тональный', 'парфюм', 'духи', 'лак для ногтей'] },
            { cat: 'health',       keys: ['витамин', 'бад', 'лекарств', 'тонометр', 'термометр', 'массажер', 'аптечк'] },
            { cat: 'fitness',      keys: ['фитнес', 'тренажер', 'гантел', 'штанг', 'коврик для йоги', 'эспандер', 'скакалка'] },
            { cat: 'sport',        keys: ['спорт', 'велосипед', 'самокат', 'лыжи', 'сноуборд', 'мяч', 'ракетк', 'палатка', 'спальник'] },

            { cat: 'toys',         keys: ['игрушка', 'конструктор', 'кукла', 'машинка', 'робот', 'лего', 'пазл', 'настольная игра'] },
            { cat: 'baby',         keys: ['подгузник', 'бутылочк', 'соск', 'коляск', 'автокресло', 'детское питание', 'радионян'] },
            { cat: 'kids',         keys: ['детск', 'ребен', 'школьн', 'для малышей'] },

            { cat: 'auto_parts',   keys: ['автозапчаст', 'фильтр', 'масло моторн', 'свеча зажиган', 'амортизатор', 'тормозн', 'ремень грм', 'аккумулятор авто'] },
            { cat: 'auto',         keys: ['авто', 'машин', 'шин', 'коврик', 'двигател', 'видеорегистратор', 'навигатор', 'автомагнитол'] },
            { cat: 'moto',         keys: ['мотоцикл', 'скутер', 'мопед', 'шлем мото'] },

            { cat: 'food',         keys: ['продукт', 'чай', 'кофе', 'сладост', 'шоколад', 'печенье', 'конфет', 'специи', 'соус'] },
            { cat: 'pets',         keys: ['кошк', 'собак', 'корм', 'наполнитель', 'когтеточк', 'поводок', 'ошейник'] },

            { cat: 'books',        keys: ['книг', 'учебник', 'роман', 'пособие', 'энциклопед'] },
            { cat: 'music',        keys: ['гитар', 'пианино', 'синтезатор', 'барабан', 'скрипк', 'флейт', 'ноты'] },
            { cat: 'hobby',        keys: ['хобби', 'рукодел', 'вязани', 'вышивк', 'модель', 'коллекц'] },
            { cat: 'travel',       keys: ['чемодан', 'палатк', 'спальник', 'термос', 'travel'] },
            { cat: 'office',       keys: ['ручк', 'тетрад', 'блокнот', 'папк', 'степлер', 'офисн', 'бумаг'] },
            { cat: 'gifts',        keys: ['подарок', 'сувенир', 'подарочн'] },  
            { cat: 'pharmacy',     keys: ['таблетк', 'лекарств', 'мазь', 'капсул', 'витамин', 'бад'] },
            { cat: 'medical',      keys: ['тонометр', 'глюкометр', 'ингалятор', 'термометр медицин', 'массажер'] },
            { cat: 'optics',       keys: ['очки', 'линзы', 'контактн', 'бинокл', 'лупа'] },
            { cat: 'household',    keys: ['порошок стиральн', 'моющ', 'чистящ', 'гель для стирки', 'кондиционер для белья'] },
            { cat: 'hygiene',      keys: ['зубн паст', 'зубн щетк', 'дезодорант', 'бритв', 'мыло', 'шампун'] },
            { cat: 'cleaning',     keys: ['швабр', 'щетк', 'тряпк', 'губк', 'ведро', 'совок'] },
            { cat: 'construction', keys: ['цемент', 'кирпич', 'пиломатериал', 'доск', 'бетон', 'арматур'] },
            { cat: 'electrical',   keys: ['розетк', 'выключател', 'провод', 'кабел', 'автомат', 'щиток'] },
            { cat: 'plumbing',     keys: ['смесител', 'труб', 'унитаз', 'раковин', 'ванн', 'сифон'] },
            { cat: 'fishing',      keys: ['удочк', 'спиннинг', 'блесн', 'приманк', 'леск', 'крючок'] },
            { cat: 'hunting',      keys: ['ружь', 'патрон', 'экипировк охотн', 'манок'] },
            { cat: 'camping',      keys: ['палатк', 'спальник', 'фонар', 'термос', 'котелок', 'тур'] },
            { cat: 'winter_sports', keys: ['лыж', 'сноуборд', 'коньк', 'санк', 'ледоруб'] },
            { cat: 'water_sports', keys: ['купальник', 'плавк', 'гидрокостюм', 'маск', 'трубк', 'ласт'] },
            { cat: 'smart_home',   keys: ['умн ламп', 'умн розетк', 'умн датчик', 'яндекс станци', 'alice'] },
            { cat: 'security',     keys: ['камер видеонаблюд', 'сигнализац', 'замок умн', 'домофон'] },
            { cat: 'baby_food',    keys: ['детск питани', 'смесь детск', 'пюре детск', 'каш детск'] },
            { cat: 'school',       keys: ['школьн', 'рюкзак школьн', 'портфел', 'пенал', 'дневник'] },
            { cat: 'art',          keys: ['краск', 'кист', 'холст', 'мольберт', 'гуаш', 'акварел'] },
            { cat: 'musical',      keys: ['гитар', 'пианино', 'синтезатор', 'скрипк', 'барабан', 'флейт'] },
            { cat: 'medicines',  keys: ['таблетк', 'капсул', 'сироп', 'мазь', 'капли'] },
            { cat: 'pet_food',   keys: ['корм для кош', 'корм для собак', 'корм для животн', 'сухой корм', 'влажный корм'] }
        ];

        for (const rule of rules) {
            if (rule.keys.some(k => name.includes(k))) {
                console.log(`🎯 Категория определена автоматически: ${rule.cat}`);
                return rule.cat;
            }
        }

        return 'other';
    }

    // ---- ОПРЕДЕЛЕНИЕ ПОЛЬЗОВАТЕЛЯ ИЗ КАЗАХСТАНА ----
    function isKzUser() {
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const kzTimezones = [
                'Asia/Almaty',      // Алматы (основной)
                'Asia/Aqtobe',      // Актобе
                'Asia/Atyrau',      // Атырау
                'Asia/Qostanay',    // Костанай
                'Asia/Qyzylorda',   // Кызылорда
                'Asia/Oral'         // Уральск
            ];
            const isKz = kzTimezones.includes(tz);
            console.log(`🌍 Часовой пояс: ${tz}, казахстанец: ${isKz}`);
            return isKz;
        } catch(e) {
            console.warn('⚠️ Не удалось определить часовой пояс:', e);
            return false;
        }
    }

    // ---- СОЗДАНИЕ ВИДЖЕТА ----
    async function createWidget(prices, productId, productName, history) {
        const oldWidget = document.getElementById('pt-widget');
        if (oldWidget) oldWidget.remove();

        const marketLabels = {
            'ozon': '🟦 Ozon',
            'ozon_kz': '🟦 Ozon KZ',
            'wildberries': '🟪 Wildberries',
            'yandex': '🟩 Яндекс.Маркет',
            'aliexpress': '🟧 AliExpress'
        };

        const currency = prices.currency || 'RUB';

        const widget = document.createElement('div');
        widget.id = 'pt-widget';
        widget.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            border: 2px solid #005bff;
            max-width: 420px;
            min-width: 320px;
            animation: slideIn 0.3s ease;
            max-height: 90vh;
            overflow-y: auto;
        `;

        if (!document.getElementById('pt-styles')) {
            const style = document.createElement('style');
            style.id = 'pt-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }

        const historyLength = history ? history.length : 0;
        const stats = history ? getStatistics(history) : null;
        let html = '';

        if (productId) {
            html += `
                <div style="font-size:11px;color:#999;margin-bottom:2px;">
                    🆔 ID: <strong style="color:#666;">${productId}</strong>
                    <span style="font-size:10px;color:#aaa;margin-left:8px;">${marketLabels[window.MARKET] || window.MARKET}</span>
                </div>
            `;
        }

        if (prices.quantity) {
            html += `
                <div style="font-size:13px;color:#666;margin-bottom:4px;">
                    📦 Количество: <strong>${prices.quantity} шт</strong>
                </div>
            `;
        }

        if (prices.current) {
            const hasDiscount = prices.original && prices.original > prices.current;
            const color = hasDiscount ? '#ff4757' : '#005bff';

            let label = '💰 Цена:';
            if (window.MARKET === 'ozon' || window.MARKET === 'ozon_kz') label = '🏦 С банками:';

            html += `
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                    <span style="font-size:14px;color:#555;">${label}</span>
                    <span style="font-weight:bold;color:${color};font-size:24px;">
                        ${formatPrice(prices.current, currency)}
                    </span>
                    ${hasDiscount ? `
                        <span style="text-decoration:line-through;color:#999;font-size:14px;">
                            ${formatPrice(prices.original, currency)}
                        </span>
                        <span style="background:#ff4757;color:white;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:bold;">
                            -${prices.discount || 0}%
                        </span>
                    ` : ''}
                </div>
            `;
        }

        if (stats && historyLength > 1) {
            html += `
                <div style="margin-top:6px;padding:8px 10px;background:#f8f9fa;border-radius:8px;font-size:12px;color:#555;">
                    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;">
                        <span>📊 <b>${stats.totalRecords}</b> записей</span>
                        <span>⬇ <b>${formatPrice(stats.minPrice, currency)}</b></span>
                        <span>⬆ <b>${formatPrice(stats.maxPrice, currency)}</b></span>
                        <span>📈 <b>${formatPrice(stats.avgPrice, currency)}</b> средняя</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-top:4px;font-size:11px;color:#777;">
                        <span>📉 Изменение: ${stats.totalChange > 0 ? '+' : ''}${formatPrice(Math.abs(stats.totalChange), currency)} (${stats.changePercent}%)</span>
                        <span>📊 Тренд: ${stats.trend}</span>
                    </div>
                    <div style="margin-top:4px;font-size:12px;font-weight:bold;color:#005bff;">
                        ${stats.recommendation}
                    </div>
                </div>
            `;
        }

        if (historyLength > 1) {
            const firstDate = new Date(history[0].date);
            const lastDate = new Date(history[history.length - 1].date);

            html += `
                <div style="margin-top:6px;border-top:1px solid #f0f0f0;padding-top:6px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                        <span style="font-size:11px;color:#999;">📈 История цены (${historyLength} записей)</span>
                        <span style="font-size:9px;color:#ccc;">
                            ${firstDate.toLocaleDateString('ru-RU')} — ${lastDate.toLocaleDateString('ru-RU')}
                        </span>
                    </div>
                    <canvas id="pt-chart" style="width:100%;height:120px;border-radius:6px;background:#fafbfc;border:1px solid #f0f0f0;"></canvas>
                </div>
            `;
        }

        // Список маркетплейсов (кроме текущего и парного Ozon)
        const allMarkets = [
            { id: 'ozon',        label: '🟦 Ozon',    color: '#005bff' },
            { id: 'ozon_kz',     label: '🟦 Ozon KZ', color: '#005bff' },
            { id: 'wildberries', label: '🟪 WB',      color: '#cb11ab' },
            { id: 'yandex',      label: '🟩 Яндекс',  color: '#fc3f1d' },
            { id: 'aliexpress',  label: '🟧 Ali',     color: '#ff4747' }
        ];
        
        const kzUser = isKzUser();

        const otherMarkets = allMarkets.filter(m => {
            // Скрываем текущий маркетплейс
            if (m.id === window.MARKET) return false;

            // Ozon KZ показываем только казахстанцам
            if (m.id === 'ozon_kz' && !kzUser) return false;

            return true;
        });
        const marketButtonsHtml = otherMarkets.map(m =>
            `<button data-market="${m.id}" style="flex:1;background:${m.color};color:white;border:none;padding:8px 6px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;min-width:70px;">${m.label}</button>`
        ).join('');

        const suggestedCategory = suggestCategory(productName);

        html += `
            <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap;border-top:1px solid #f0f0f0;padding-top:10px;">
                <button id="pt-export-csv" style="flex:1;background:#2ecc71;color:white;border:none;padding:8px 12px;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;min-width:80px;">📥 CSV</button>
                <button id="pt-save-json" style="flex:1;background:#3498db;color:white;border:none;padding:8px 12px;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;min-width:80px;">💾 JSON</button>
                <button id="pt-load-json" style="flex:1;background:#f39c12;color:white;border:none;padding:8px 12px;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;min-width:80px;">📂 Загрузить</button>
            </div>
            <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;">
                <button id="pt-compare" style="flex:1;background:#e67e22;color:white;border:none;padding:8px 12px;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;">🔍 Найти на других</button>
                <button id="pt-notify-settings" style="flex:1;background:#9b59b6;color:white;border:none;padding:8px 12px;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;">🔔 Уведомления</button>
            </div>
            <div id="pt-compare-panel" style="display:none;margin-top:8px;padding:10px;background:#fff8f0;border:1px solid #e67e22;border-radius:8px;">
                <div style="margin-bottom:8px;color:#666;font-size:11px;font-weight:600;">🔍 Открыть поиск на:</div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    ${marketButtonsHtml}
                </div>
            </div>
        `;

        widget.insertAdjacentHTML('beforeend', `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <span style="font-weight:600;font-size:14px;color:#1a1a2e;">📊 ${marketLabels[window.MARKET] || 'Price Tracker'}</span>
                <div style="display:flex;gap:6px;">
                    <button id="pt-refresh" style="background:none;border:none;font-size:16px;cursor:pointer;color:#999;">🔄</button>
                    <button id="pt-close" style="background:none;border:none;font-size:18px;cursor:pointer;color:#999;padding:0 4px;">✕</button>
                </div>
            </div>
            <div style="font-size:12px;color:#666;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:380px;">
                ${(productName || 'Товар').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
            </div>
            ${html || '<div style="color:#999;font-size:14px;">⚠️ Цены не найдены</div>'}
            <div style="margin-top:10px;">
                <label style="font-size:11px;color:#666;display:block;margin-bottom:4px;">📁 Категория:</label>
                <select id="pt-category" style="width:100%;padding:8px 10px;border:1px solid #ddd;border-radius:8px;font-size:12px;background:white;">
                    ${Object.entries(window.CATEGORIES).filter(([id]) => id !== 'all').map(([id, cat]) =>
                        `<option value="${id}" ${id === suggestedCategory ? 'selected' : ''}>${cat.icon} ${cat.name}</option>`
                    ).join('')}
                </select>
            </div>
            <div style="display:flex;gap:8px;margin-top:8px;">
                <button id="pt-track" style="flex:1;background:#005bff;color:white;border:none;padding:10px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">🔔 Отслеживать</button>
            </div>
        `);

        document.body.appendChild(widget);

        // Кнопка "🔍 Найти на других"
        document.getElementById('pt-compare').addEventListener('click', () => {
            const panel = document.getElementById('pt-compare-panel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });

        document.querySelectorAll('#pt-compare-panel button[data-market]').forEach(btn => {
            btn.addEventListener('click', () => {
                const market = btn.dataset.market;

                // Предупреждение для казахстанцев при переходе на Ozon RU
                if (kzUser && market === 'ozon') {
                    const proceed = confirm(
                        '🟦 Ozon RU — российская витрина.\n\n' +
                        '⚠️ Не все товары доставляются в Казахстан.\n' +
                        '⚠️ Оплата — только картой казахстанского банка.\n' +
                        '⚠️ Срок доставки — 10–20 дней.\n\n' +
                        'Открыть поиск на Ozon RU?'
                    );
                    if (!proceed) return;
                }

                const url = getSearchUrl(market, productName);
                if (url) {
                    openTab(url);
                    console.log(`🔍 Открыт поиск на ${market}: ${url}`);
                }
            });
        });

        setTimeout(() => {
            const canvas = document.getElementById('pt-chart');
            if (canvas && history && history.length > 1) {
                drawChart(canvas, history, prices.current, currency);
            }
        }, 150);

        document.getElementById('pt-close').addEventListener('click', () => widget.remove());

        document.getElementById('pt-track').addEventListener('click', async () => {
            if (productId) {
                try {
                    let tracked = await PTStorage.get('pt_tracked') || [];
                    const existing = tracked.find(item => item.id === productId && item.market === window.MARKET);
                    if (existing) {
                        existing.currentPrice = prices.current;
                        existing.originalPrice = prices.original;
                        existing.discount = prices.discount;
                        existing.currency = currency;
                        existing.lastCheck = new Date().toISOString();
                        if (PTStorage.safeSet) {
                            await PTStorage.safeSet('pt_tracked', tracked);
                        } else {
                            await PTStorage.set('pt_tracked', tracked);
                        }
                        alert(`✅ Товар уже в списке отслеживаемых!\n💰 ${formatPrice(prices.current, currency)}`);
                    } else {
                        const category = document.getElementById('pt-category')?.value || 'other';
                        tracked.push({
                            id: productId,
                            name: productName,
                            market: window.MARKET,
                            currentPrice: prices.current,
                            originalPrice: prices.original,
                            discount: prices.discount,
                            quantity: prices.quantity,
                            currency: currency,
                            url: window.location.href,
                            category: category,
                            tags: [],
                            added: new Date().toISOString(),
                            lastCheck: new Date().toISOString()
                        });
                        if (PTStorage.safeSet) {
                            await PTStorage.safeSet('pt_tracked', tracked);
                        } else {
                            await PTStorage.set('pt_tracked', tracked);
                        }
                        alert(`✅ Товар добавлен в отслеживание!\n💰 ${formatPrice(prices.current, currency)} (${marketLabels[window.MARKET]})`);
                    }
                } catch(e) {
                    alert('✅ Отслеживание включено!');
                }
            } else {
                alert('⚠️ Не удалось определить ID товара');
            }
        });

        document.getElementById('pt-refresh').addEventListener('click', () => {
            window.location.reload();
        });

        document.getElementById('pt-export-csv').addEventListener('click', () => {
            if (history && history.length > 0) {
                exportToCSV(history, productName, productId, currency);
            } else {
                alert('⚠️ Нет данных для экспорта');
            }
        });

        document.getElementById('pt-save-json').addEventListener('click', () => {
            if (history && history.length > 0) {
                saveToFile(history, productName, productId, currency);
            } else {
                alert('⚠️ Нет данных для сохранения');
            }
        });

        document.getElementById('pt-load-json').addEventListener('click', () => {
            loadFromFile(productId);
        });

        document.getElementById('pt-notify-settings').addEventListener('click', async () => {
            const settings = await PTStorage.get('pt_notification_settings') || {};
            const enabled = settings.enabled !== false;
            const threshold = settings.threshold || 5;

            const newThreshold = prompt(
                `🔔 Настройки уведомлений\n\n` +
                `Уведомления: ${enabled ? '✅ Включены' : '❌ Выключены'}\n` +
                `Порог изменения: ${threshold}%\n\n` +
                `Введите новый порог (1-50)% или 0 чтобы выключить:`,
                threshold
            );

            if (newThreshold === null) return;

            const num = parseInt(newThreshold);
            if (isNaN(num) || num < 0 || num > 50) {
                alert('⚠️ Введите число от 0 до 50');
                return;
            }

            const newSettings = {
                enabled: num > 0,
                threshold: num > 0 ? num : 5
            };
            await PTStorage.set('pt_notification_settings', newSettings);
            alert(`✅ Настройки сохранены!\nУведомления: ${newSettings.enabled ? 'Включены' : 'Выключены'}\nПорог: ${newSettings.threshold}%`);
        });

        console.log('✅ Виджет создан!');
        return widget;
    }

    // ---- ЗАПУСК ----
    async function init() {
        // Ждём, пока модуль площадки (ozon.js / wildberries.js / ...) установит MARKET
        let attempts = 0;
        while ((!window.MARKET || window.MARKET === 'unknown') && attempts < 20) {
            await new Promise(r => setTimeout(r, 100));
            attempts++;
        }

        if (!window.MARKET || window.MARKET === 'unknown') {
            console.error('❌ MARKET не установлен — модуль площадки не загрузился?');
            return;
        }

        console.log(`🚀 init() с MARKET=${window.MARKET}`);

        if (typeof window.getProductId === 'undefined' || typeof window.getPrices === 'undefined') {
            console.error('❌ Не загружена функция для площадки', window.MARKET);
            return;
        }

        const productId = window.getProductId();
        const productName = getProductName();

        let prices;
        if (window.MARKET === 'aliexpress' && typeof window.retryGetPrices === 'function') {
            prices = await window.retryGetPrices(10, 700);
        } else {
            prices = await window.getPrices();
        }

        console.log('🆔 ID товара:', productId);
        console.log('📝 Название:', productName);
        console.log('💰 Цены:', prices);

        let history = [];
        if (productId && prices.current) {
            history = await savePrice(productId, prices.current, prices.currency);
            console.log('📊 История:', history.length, 'записей');
        }

        if (productId && prices.current) {
            await updateTrackedPrice(
                productId,
                prices.current,
                prices.original,
                prices.discount,
                prices.quantity,
                prices.currency
            );
        }

        if (prices.current) {
            await createWidget(prices, productId, productName, history);
        } else {
            console.warn('⚠️ Цена не найдена');
        }
    }

    window.startPriceTracker = init;

    if (document.readyState === 'complete') {
        setTimeout(window.startPriceTracker, 1500);
    } else {
        window.addEventListener('load', () => setTimeout(window.startPriceTracker, 1500));
    }

    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl && (url.includes('/product/') || url.includes('/catalog/') || url.includes('/offer/') || url.includes('/item/'))) {
            lastUrl = url;
            setTimeout(window.startPriceTracker, 1500);
        }
    }).observe(document, { subtree: true, childList: true });

    // ---- ОБРАБОТЧИК ЗАПРОСОВ ОТ POPUP/BACKGROUND ----
    const ptRuntime = (typeof browser !== 'undefined' && browser.runtime)
        ? browser.runtime
        : (typeof chrome !== 'undefined' ? chrome.runtime : null);

    if (ptRuntime && ptRuntime.onMessage) {
        ptRuntime.onMessage.addListener((message, sender, sendResponse) => {
            if (message && message.type === 'get_current_price') {
                console.log('📨 Получен запрос get_current_price');
                (async () => {
                    try {
                        let attempts = 0;
                        let prices = null;

                        while (attempts < 10) {
                            if (typeof window.getPrices !== 'function') {
                                await new Promise(r => setTimeout(r, 500));
                                attempts++;
                                continue;
                            }
                            prices = await window.getPrices();
                            if (prices && prices.current) break;
                            await new Promise(r => setTimeout(r, 700));
                            attempts++;
                        }

                        if (prices && prices.current) {
                            console.log('✅ Отправлена цена:', prices.current);
                            sendResponse({
                                price: prices.current,
                                original: prices.original,
                                discount: prices.discount,
                                currency: prices.currency || 'RUB'
                            });
                        } else {
                            console.warn('⚠️ Цена не найдена на странице');
                            sendResponse({ price: null });
                        }
                    } catch(e) {
                        console.error('❌ Ошибка в обработчике:', e);
                        sendResponse({ price: null });
                    }
                })();
                return true;
            }
            return false;
        });
        console.log('📬 Обработчик get_current_price зарегистрирован');
    }

    console.log(`✅ Price Tracker core загружен (MARKET=${window.MARKET || 'ещё не установлен'})`);
})();