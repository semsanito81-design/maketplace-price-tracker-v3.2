// wildberries.js — ФИНАЛЬНАЯ ВЕРСИЯ
// Fallback ищет цену только в контейнере товара, не отсекает по цене
(function() {
    'use strict';

    window.MARKET = 'wildberries';
    console.log('🚀 WB module START');

    window.getProductId = function() {
        const url = window.location.href;

        const urlMatch = url.match(/\/catalog\/(\d+)/);
        if (urlMatch) {
            console.log('🆔 ID из URL (WB):', urlMatch[1]);
            return urlMatch[1];
        }

        const el = document.querySelector('[data-nm-id]');
        if (el) {
            const id = el.getAttribute('data-nm-id');
            if (id) {
                console.log('🆔 ID из data-nm-id (WB):', id);
                return id;
            }
        }

        try {
            const scripts = document.querySelectorAll('script[type="application/ld+json"]');
            for (const script of scripts) {
                try {
                    const data = JSON.parse(script.textContent);
                    if (data.sku) {
                        console.log('🆔 ID из JSON-LD (WB):', data.sku);
                        return data.sku.toString();
                    }
                } catch(e) {}
            }
        } catch(e) {}

        console.warn('⚠️ ID товара не найден (WB)');
        return null;
    };

    window.getProductName = function() {
        let productName = '';

        try {
            const outOfStock = document.querySelector('.out-of-stock, .not-available, [class*="out-of-stock"], [class*="not-available"]');
            const outOfStockText = outOfStock ? outOfStock.textContent.trim() : '';

            const h1 = document.querySelector('h1');
            if (h1) {
                const text = h1.textContent.trim();
                if (text.length > 5 && text.length < 300) {
                    productName = text;
                    if (outOfStockText) {
                        productName = productName + ' (нет в наличии)';
                    }
                    console.log('📝 Название из h1 (WB):', productName);
                }
            }

            if (!productName || productName.length < 5) {
                const title = document.title;
                if (title && title.length > 5) {
                    let cleaned = title.replace(/\s*купить\s+за\s+[\d\s]+₽\s+в\s+интернет[‑\-]магазине\s+Wildberries\s*/i, '').trim();
                    cleaned = cleaned.replace(/\s*[-–]\s*купить\s*на\s*Wildberries\s*/i, '').trim();
                    cleaned = cleaned.replace(/\s*[-–]\s*купить\s*в\s*Wildberries\s*/i, '').trim();
                    cleaned = cleaned.replace(/\s*купить\s*$/i, '').trim();
                    cleaned = cleaned.replace(/\s*[-–]\s*купить\s*$/i, '').trim();
                    cleaned = cleaned.replace(/\s*[-–]\s*Wildberries\s*$/i, '').trim();
                    cleaned = cleaned.replace(/\s+Wildberries\s*$/i, '').trim();
                    cleaned = cleaned.replace(/\s+\d{6,}\s*$/, '').trim();

                    if (cleaned.length > 5) {
                        productName = cleaned;
                        if (outOfStockText) {
                            productName = productName + ' (нет в наличии)';
                        }
                        console.log('📝 Название из title (WB, очищенное):', productName);
                    }
                }
            }

        } catch(e) {
            console.warn('⚠️ Ошибка при поиске названия (WB):', e);
        }

        if (productName) {
            productName = productName.replace(/\s+/g, ' ').trim();
        }

        return productName || 'Товар без названия';
    };

    window.getPrices = async function() {
        // Определяем валюту по символам на странице
        let detectedCurrency = 'RUB';
        try {
            const bodyText = document.body.textContent || '';
            const hasTenge = bodyText.includes('₸');
            const hasRuble = bodyText.includes('₽');
            
            if (hasTenge && !hasRuble) {
                detectedCurrency = 'KZT';
            } else if (hasTenge && hasRuble) {
                // Если оба — смотрим, какой встречается чаще
                const tengeCount = (bodyText.match(/₸/g) || []).length;
                const rubleCount = (bodyText.match(/₽/g) || []).length;
                detectedCurrency = tengeCount > rubleCount ? 'KZT' : 'RUB';
            }
            console.log(`💰 Валюта WB определена: ${detectedCurrency} (₸: ${hasTenge}, ₽: ${hasRuble})`);
        } catch(e) {
            console.warn('⚠️ Не удалось определить валюту WB:', e);
        }

        let result = {
            current: null,
            original: null,
            bankPrice: null,
            otherPrice: null,
            perItem: null,
            discount: null,
            quantity: null,
            currency: detectedCurrency,
            allPrices: []
        };

        try {
            console.log('🔍 Поиск цен на Wildberries...');

            const outOfStock = document.querySelector('.out-of-stock, .not-available, [class*="out-of-stock"], [class*="not-available"]');
            const isOutOfStock = outOfStock && outOfStock.textContent.trim().includes('Нет в наличии');

            if (isOutOfStock) {
                console.log('⚠️ Товар НЕТ в наличии');
                const productId = window.getProductId();
                if (productId && typeof window.getPriceHistory === 'function') {
                    const history = await window.getPriceHistory(productId);
                    if (history && history.length > 0) {
                        const lastPrice = history[history.length - 1].price;
                        result.current = lastPrice;
                        console.log(`💰 Используем последнюю цену из истории: ${lastPrice} ₽`);
                        return result;
                    }
                }
                result.current = null;
                return result;
            }

            // === 1. СПИСОК СЕЛЕКТОРОВ ЦЕНЫ ===
            const clubPriceSelectors = [
                // Специфичные (новый дизайн WB)
                '.priceBlockWalletPrice--K6fNr',
                '.productLinePriceWallet--wknlT',
                'button.priceBlockWalletPrice--K6fNr',
                '.priceBlockPrice--Pwqvm',

                // Общие (ловят в разных вариантах)
                '.mo-typography_colors_danger.mo-typography_variant_title2',
                '.productLinePriceWrapperDesktop--yv0iA .mo-typography_colors_danger',
                '.mo-typography_colors_danger',
                '[class*="priceBlockPrice"]',
                '[class*="priceBlockWalletPrice"]',
                '[class*="PriceBlockPrice"]',
                '[class*="priceBlockCurrent"]',
                '[class*="PriceBlockCurrent"]',

                // Старый дизайн
                '.price-block__price',
                '.product-price',
                '.price__current',
                '.price-current',
                '.final-price',
                '.product-card__price',

                // Общие теги
                'span[class*="price"][class*="current"]',
                '[data-link="price"]',
                'ins'
            ];

            let clubPrice = null;
            let clubPriceSelector = '';

            for (const selector of clubPriceSelectors) {
                try {
                    const elements = document.querySelectorAll(selector);
                    for (const el of elements) {
                        if (el.offsetParent === null) continue;

                        const inCarousel = el.closest('.carousel') || el.closest('.product-card') || el.closest('.j-carousel');
                        const inOffers = el.closest('.offers-list') || el.closest('.product-offers');
                        if (inCarousel || inOffers) continue;

                        const text = el.textContent.trim().replace(/\s/g, '');
                        const match = text.match(/(\d[\d\s]*)/);
                        if (match) {
                            const price = parseInt(match[1].replace(/\s/g, ''));
                            if (price > 0 && price < 10000000) {
                                const isFromOffer = el.closest('.multipleSellersList--Mh84D') || el.closest('.item--qjCnn');
                                if (!isFromOffer) {
                                    clubPrice = price;
                                    clubPriceSelector = selector;
                                    console.log(`🏷️ Цена (${selector}): ${price} ₽`);
                                    break;
                                }
                            }
                        }
                    }
                } catch(e) {}
                if (clubPrice) break;
            }

            // === 2. FALLBACK: СКАНИРОВАНИЕ ТОЛЬКО В КОНТЕЙНЕРЕ ТОВАРА ===
            if (!clubPrice) {
                // Проверяем признаки страницы товара
                const hasProductSigns =
                    document.querySelector('h1') &&
                    (
                        document.querySelector('[class*="productPage"]') ||
                        document.querySelector('[class*="product-page"]') ||
                        document.querySelector('[class*="ProductPage"]')
                    );

                if (!hasProductSigns) {
                    console.log('⚠️ Похоже, мы не на странице товара — fallback отключён');
                } else {
                    console.log('⚠️ Селекторы не сработали, сканируем контейнер товара...');

                    // Ищем КОНТЕЙНЕР товара — только внутри него
                    const productContainer =
                        document.querySelector('[class*="productPage"]') ||
                        document.querySelector('[class*="product-page"]') ||
                        document.querySelector('[class*="ProductPage"]') ||
                        document.querySelector('main');

                    if (!productContainer) {
                        console.warn('⚠️ Контейнер товара не найден — fallback отключён');
                    } else {
                        const allEls = productContainer.querySelectorAll('*');
                        const candidates = [];

                        for (const el of allEls) {
                            if (el.offsetParent === null) continue;
                            if (el.children.length > 2) continue;

                            const text = el.textContent.trim();
                            if (!text.includes('₽')) continue;
                            if (text.length > 30) continue;

                            // Пропускаем старые (зачёркнутые) цены
                            if (el.tagName === 'S' || el.tagName === 'DEL' || el.tagName === 'STRIKE') continue;
                            const cls = el.className || '';
                            if (typeof cls === 'string' && (cls.includes('Old') || cls.includes('old') || cls.includes('strikethrough'))) continue;

                            // Пропускаем кошелёк, баланс, кэшбэк
                            const textLower = text.toLowerCase();
                            if (textLower.includes('кошел') || textLower.includes('баланс') ||
                                textLower.includes('кэшбэк') || textLower.includes('cashback') ||
                                textLower.includes('кэшбек')) continue;

                            const inWallet = el.closest('[class*="wallet"]') ||
                                             el.closest('[class*="Wallet"]') ||
                                             el.closest('[class*="balance"]') ||
                                             el.closest('[class*="Balance"]') ||
                                             el.closest('[class*="cashback"]') ||
                                             el.closest('[class*="Cashback"]');
                            if (inWallet) continue;

                            // Пропускаем рекомендации и карусели
                            const inAd = el.closest('[class*="recommend"]') ||
                                         el.closest('[class*="related"]') ||
                                         el.closest('[class*="similar"]') ||
                                         el.closest('.carousel') ||
                                         el.closest('.product-card');
                            if (inAd) continue;

                            const num = parseFloat(text.replace(/[^\d.]/g, ''));
                            if (num > 0 && num < 10000000) {
                                candidates.push({ price: num, text: text, el: el });
                            }
                        }

                        if (candidates.length > 0) {
                            // НЕ сортируем по цене! Берём ПЕРВЫЙ найденный в контейнере
                            // WB обычно показывает текущую цену ПЕРВОЙ
                            clubPrice = candidates[0].price;
                            console.log(`💰 Цена из DOM (контейнер товара): ${clubPrice} ₽ (${candidates[0].text})`);
                            console.log(`   Найдено кандидатов: ${candidates.length}`);
                        } else {
                            console.warn('❌ Не удалось найти цену в контейнере товара');
                        }
                    }
                }
            }

            if (clubPrice) {
                result.current = clubPrice;
            }

            // === 3. СТАРАЯ ЦЕНА ===
            const oldPriceSelectors = [
                '.priceBlockOldPrice--ps7vS',
                '.productLinePriceOld--dB0zT',
                'span[class*="priceBlockOldPrice"]',
                '[class*="priceBlockOldPrice"]',
                '[class*="PriceBlockOld"]',
                '.price-block__old-price',
                '.old-price',
                '.price__old',
                '.mo-typography_modifier_strikethrough',
                'del',
                's'
            ];

            let oldPrice = null;
            for (const selector of oldPriceSelectors) {
                try {
                    const elements = document.querySelectorAll(selector);
                    for (const el of elements) {
                        if (el.offsetParent === null) continue;

                        const inCarousel = el.closest('.carousel') || el.closest('.product-card');
                        const inOffers = el.closest('.offers-list') || el.closest('.product-offers');
                        if (inCarousel || inOffers) continue;

                        const text = el.textContent.trim().replace(/\s/g, '');
                        const match = text.match(/(\d[\d\s]*)/);
                        if (match) {
                            const price = parseInt(match[1].replace(/\s/g, ''));
                            if (price > 0 && price < 10000000 && price > (result.current || 0)) {
                                oldPrice = price;
                                result.original = price;
                                console.log(`🔴 WB старая цена (${selector}): ${price} ₽`);
                                break;
                            }
                        }
                    }
                } catch(e) {}
                if (oldPrice) break;
            }

            if (result.original && result.current && result.original > result.current) {
                result.discount = Math.round((1 - result.current / result.original) * 100);
                console.log(`📊 Скидка WB: ${result.discount}%`);
            }

            // === 4. КОЛИЧЕСТВО ===
            try {
                const qtySelectors = [
                    '.quantity-selector__value',
                    '.count-input input',
                    '.product-card__quantity input',
                    '.quantity__input'
                ];
                for (const selector of qtySelectors) {
                    const el = document.querySelector(selector);
                    if (el) {
                        const num = parseInt(el.value || el.textContent);
                        if (num > 0 && num < 100) {
                            result.quantity = num;
                            console.log(`📦 Количество WB: ${num} шт`);
                            break;
                        }
                    }
                }
            } catch(e) {}

        } catch(e) {
            console.error('❌ Ошибка в getPrices (WB):', e);
        }

        console.log('💰 ИТОГ WB:', {
            current: result.current,
            original: result.original,
            discount: result.discount,
            selector: typeof clubPriceSelector !== 'undefined' && clubPriceSelector ? clubPriceSelector : 'fallback'
        });

        return result;
    };

    console.log('✅ Wildberries module loaded');
})();