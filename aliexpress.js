// aliexpress.js — поддержка AliExpress (aliexpress.com, aliexpress.ru)
// ФИНАЛЬНАЯ ВЕРСИЯ: цена только в DOM (window.data.products[0].price = 0)
(function() {
    'use strict';

    window.MARKET = 'aliexpress';
    console.log('🚀 AliExpress module START');

    // ---- ID ----
    window.getProductId = function() {
        const url = window.location.href;
        const urlMatch = url.match(/\/item\/(\d+)/);
        if (urlMatch) {
            console.log('🆔 ID из URL (AliExpress):', urlMatch[1]);
            return urlMatch[1];
        }
        const altMatch = url.match(/\/i\/(\d+)/);
        if (altMatch) return altMatch[1];

        // Из window.data.products[0]
        try {
            if (window.data?.products?.[0]?.id) {
                console.log('🆔 ID из window.data:', window.data.products[0].id);
                return String(window.data.products[0].id);
            }
        } catch(e) {}

        console.warn('⚠️ ID товара не найден (AliExpress)');
        return null;
    };

    // ---- Название ----
    window.getProductName = function() {
        // 1. window.data.products[0].name — самый надёжный
        try {
            if (window.data?.products?.[0]?.name) {
                const name = window.data.products[0].name;
                if (name.length > 2 && name.length < 500) {
                    console.log('📝 Название из window.data:', name);
                    return name.trim();
                }
            }
        } catch(e) {}

        // 2. Селекторы
        const selectors = [
            'h1[data-pl="product-title"]',
            '.product-title-text',
            '.product-title',
            '[data-testid="product-title"]',
            'h1'
        ];
        for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el) {
                const text = el.textContent.trim();
                if (text.length > 5 && text.length < 500) {
                    console.log(`📝 Название из селектора (${sel}):`, text);
                    return text;
                }
            }
        }
        return 'Товар без названия';
    };

    // ---- Парсинг цены из текста ----
    function parsePrice(text) {
        if (!text) return null;
        // Убираем всё кроме цифр, пробелов, точек и запятых
        const cleaned = text.replace(/[^\d\s.,]/g, '').replace(/\s/g, '').replace(',', '.');
        const num = parseFloat(cleaned);
        if (num > 0 && num < 10000000) return num;
        return null;
    }

    // ---- Поиск цены в DOM ----
    function findPriceInDOM() {
        // Приоритетные селекторы (Haze = новый дизайн AliExpress)
        const primarySelectors = [
            '[class*="HazeProductPrice_SnowPrice__mainM"]',
            '[class*="HazeProductPrice_SnowPrice__mainS"]',
            '[class*="HazeProductPrice"] [class*="main"]',
            '[class*="HazeStickyOfferPrice"] [class*="sale"]',
            '[class*="SnowPrice__main"]'
        ];

        for (const sel of primarySelectors) {
            const el = document.querySelector(sel);
            if (el && el.offsetParent !== null) {
                const price = parsePrice(el.textContent);
                if (price) {
                    console.log(`💰 Цена из DOM (${sel}): ${price}`);
                    return price;
                }
            }
        }

        // Fallback: старые селекторы
        const fallbackSelectors = [
            '.product-price-current',
            '[class*="price--currentPriceText"]',
            '[class*="price--current"]',
            '[class*="product-price-value"]',
            '[class*="PriceText"]',
            '[data-pl="product-price"]',
            '[data-testid="price"]'
        ];

        for (const sel of fallbackSelectors) {
            const el = document.querySelector(sel);
            if (el && el.offsetParent !== null) {
                const price = parsePrice(el.textContent);
                if (price) {
                    console.log(`💰 Цена из DOM fallback (${sel}): ${price}`);
                    return price;
                }
            }
        }

        return null;
    }

    // ---- Поиск старой цены в DOM ----
    function findOriginalPriceInDOM(currentPrice) {
        const oldPriceSelectors = [
            '[class*="HazeProductPrice_SnowPrice__secondPrice"]',
            '[class*="SnowPrice__secondPrice"]',
            '[class*="StickyOfferPrice__secondPrice"]',
            '.product-price-original',
            '[class*="price--original"]',
            '[class*="price-original"]',
            'del',
            's'
        ];

        for (const sel of oldPriceSelectors) {
            const els = document.querySelectorAll(sel);
            for (const el of els) {
                if (el.offsetParent === null) continue;
                const price = parsePrice(el.textContent);
                if (price && price > currentPrice) {
                    console.log(`🔴 Старая цена из DOM (${sel}): ${price}`);
                    return price;
                }
            }
        }
        return null;
    }

    // ---- Основная функция получения цен ----
    window.getPrices = async function() {
        let result = {
            current: null,
            original: null,
            discount: null,
            currency: 'RUB',
            quantity: null,
            allPrices: []
        };

        try {
            console.log('🔍 Поиск цен на AliExpress...');

            // === 1. DOM — основной источник ===
            const domPrice = findPriceInDOM();
            if (domPrice) {
                result.current = domPrice;
            }

            // === 2. Старая цена ===
            if (result.current) {
                const oldPrice = findOriginalPriceInDOM(result.current);
                if (oldPrice) {
                    result.original = oldPrice;
                    result.discount = Math.round((1 - result.current / result.original) * 100);
                    console.log(`📊 Скидка: ${result.discount}%`);
                }
            }

            // === 3. Сканирование DOM на ₽ (последний шанс) ===
            if (!result.current) {
                console.log('⚠️ Селекторы не сработали, сканируем DOM на ₽...');
                const allEls = document.querySelectorAll('*');
                for (const el of allEls) {
                    if (el.offsetParent === null) continue;
                    if (el.children.length > 2) continue;
                    const text = el.textContent.trim();
                    if (!/₽/.test(text)) continue;
                    if (text.length > 30) continue;
                    const price = parsePrice(text);
                    if (price && price > 100) {
                        const inAd = el.closest('[class*="recommend"]') ||
                                     el.closest('[class*="related"]') ||
                                     el.closest('[class*="similar"]');
                        if (inAd) continue;
                        result.current = price;
                        console.log(`💰 Цена из DOM (сканирование): ${price} (${text})`);
                        break;
                    }
                }
            }

            // === 4. Валюта ===
            if (window.data?.currencyCode) {
                result.currency = window.data.currencyCode || 'RUB';
            }

        } catch(e) {
            console.error('❌ Ошибка в getPrices (AliExpress):', e);
        }

        console.log('💰 ИТОГ AliExpress:', result);
        return result;
    };

    // ---- Повторные попытки ----
    window.retryGetPrices = async function(maxAttempts = 10, delayMs = 700) {
        for (let i = 0; i < maxAttempts; i++) {
            const prices = await window.getPrices();
            if (prices.current) {
                console.log(`✅ Цена найдена с попытки ${i + 1}:`, prices.current);
                return prices;
            }
            console.log(`⏳ Попытка ${i + 1}/${maxAttempts}: ждём...`);
            await new Promise(r => setTimeout(r, delayMs));
        }
        console.warn('⚠️ Цена не найдена после всех попыток');
        return await window.getPrices();
    };

    console.log('✅ AliExpress module loaded');
})();