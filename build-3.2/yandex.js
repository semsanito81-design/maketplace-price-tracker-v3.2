// yandex.js — для Яндекс.Маркет (только текущая цена + история)
(function() {
    window.MARKET = 'yandex';

    window.getProductId = function() {
        const url = window.location.href;

        const cardMatch = url.match(/\/card\/[^/]+\/(\d+)/);
        if (cardMatch) {
            console.log('🆔 ID из URL (Яндекс):', cardMatch[1]);
            return cardMatch[1];
        }

        const productMatch = url.match(/\/product\/(\d+)/);
        if (productMatch) {
            console.log('🆔 ID из URL (Яндекс):', productMatch[1]);
            return productMatch[1];
        }

        try {
            const scripts = document.querySelectorAll('script[type="application/ld+json"]');
            for (const script of scripts) {
                try {
                    const data = JSON.parse(script.textContent);
                    if (data.sku) {
                        console.log('🆔 ID из JSON-LD (Яндекс):', data.sku);
                        return data.sku.toString();
                    }
                } catch(e) {}
            }
        } catch(e) {}

        console.warn('⚠️ ID товара не найден (Яндекс)');
        return null;
    };

    window.getProductName = function() {
        const selectors = [
            '.product-title__text',
            '.product-card__title',
            'h1',
            '[itemprop="name"]',
            '.product-header__title'
        ];

        for (const selector of selectors) {
            try {
                const el = document.querySelector(selector);
                if (el) {
                    const text = el.textContent.trim();
                    if (text.length > 2 && text.length < 500) {
                        console.log('📝 Название Яндекс:', text);
                        return text;
                    }
                }
            } catch(e) {}
        }

        const title = document.title;
        if (title) {
            const cleaned = title.replace(/\s*[-–]\s*купить.*$/i, '').trim();
            if (cleaned.length > 5) {
                console.log('📝 Название из title (Яндекс):', cleaned);
                return cleaned;
            }
        }

        return 'Товар без названия';
    };

    window.getPrices = async function() {
        let result = {
            current: null,
            original: null,
            bankPrice: null,
            otherPrice: null,
            perItem: null,
            discount: null,
            quantity: null,
            allPrices: []
        };

        try {
            console.log('🔍 Поиск цен на Яндекс.Маркет...');

            const priceSelectors = [
                '[data-auto="price-value"]',
                '.price',
                '.product-price__value',
                '.price__value',
                '.product-price__current',
                '.price-current',
                '.product__price',
                '.ds-valueLine'
            ];

            for (const selector of priceSelectors) {
                try {
                    const el = document.querySelector(selector);
                    if (el) {
                        const text = el.textContent.trim().replace(/\s/g, '');
                        const match = text.match(/(\d+)/);
                        if (match) {
                            const price = parseInt(match[1]);
                            if (price > 0 && price < 10000000) {
                                const parent = el.closest('.price__old, .product-price__old, .price-old');
                                if (!parent) {
                                    result.current = price;
                                    console.log(`💰 Яндекс цена (${selector}): ${price} ₽`);
                                    break;
                                }
                            }
                        }
                    }
                } catch(e) {}
                if (result.current) break;
            }

            if (!result.current) {
                try {
                    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
                    for (const script of scripts) {
                        try {
                            const data = JSON.parse(script.textContent);
                            if (data.offers) {
                                const offers = Array.isArray(data.offers) ? data.offers : [data.offers];
                                for (const offer of offers) {
                                    if (offer.price) {
                                        result.current = parseInt(offer.price);
                                        console.log(`💰 Яндекс цена из JSON-LD: ${result.current} ₽`);
                                        break;
                                    }
                                }
                            }
                            if (data.price && !result.current) {
                                result.current = parseInt(data.price);
                                console.log(`💰 Яндекс цена из JSON-LD (price): ${result.current} ₽`);
                            }
                        } catch(e) {}
                    }
                } catch(e) {}
            }

            result.original = null;
            result.discount = null;

            try {
                const qtySelectors = [
                    '.quantity-selector__value',
                    '.count-input input',
                    '[data-quantity]'
                ];
                for (const selector of qtySelectors) {
                    const el = document.querySelector(selector);
                    if (el) {
                        const num = parseInt(el.value || el.textContent || el.getAttribute('data-quantity'));
                        if (num > 0 && num < 100) {
                            result.quantity = num;
                            console.log(`📦 Количество Яндекс: ${num} шт`);
                            break;
                        }
                    }
                }
            } catch(e) {}

        } catch(e) {
            console.error('❌ Ошибка в getPrices (Яндекс):', e);
        }

        console.log('💰 ИТОГ Яндекс:', {
            current: result.current,
            original: result.original,
            discount: result.discount
        });

        return result;
    };

    console.log('✅ Yandex module loaded');
})();
