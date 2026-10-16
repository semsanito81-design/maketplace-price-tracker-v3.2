// ozon.js — только для Ozon (поддержка ozon.ru и ozon.kz)
(function() {
    'use strict';

    // Определяем домен: ozon.ru или ozon.kz
    const isKz = window.location.hostname.includes('ozon.kz');
    window.MARKET = isKz ? 'ozon_kz' : 'ozon';
    console.log(`🌍 Ozon домен: ${isKz ? 'KZ (Казахстан)' : 'RU (Россия)'}`);
    console.log(`🚀 Ozon module START (${window.MARKET})`);

    window.getProductId = function() {
        const url = window.location.href;

        const urlMatch = url.match(/\/product\/(\d+)/);
        if (urlMatch) {
            console.log('🆔 ID из URL (Ozon):', urlMatch[1]);
            return urlMatch[1];
        }

        const selectors = ['[data-product-id]', '[data-sku]', '[data-item-id]', '[data-product-sku]'];
        for (const selector of selectors) {
            const el = document.querySelector(selector);
            if (el) {
                const id = el.getAttribute('data-product-id') || 
                           el.getAttribute('data-sku') || 
                           el.getAttribute('data-item-id') ||
                           el.getAttribute('data-product-sku');
                if (id && id.match(/^\d+$/)) {
                    console.log('🆔 ID из data-атрибута (Ozon):', id);
                    return id;
                }
            }
        }

        try {
            const scripts = document.querySelectorAll('script[type="application/ld+json"]');
            for (const script of scripts) {
                try {
                    const data = JSON.parse(script.textContent);
                    if (data.sku) {
                        console.log('🆔 ID из JSON-LD (Ozon):', data.sku);
                        return data.sku.toString();
                    }
                    if (data.productId) {
                        console.log('🆔 ID из JSON-LD (Ozon):', data.productId);
                        return data.productId.toString();
                    }
                    if (data.url) {
                        const match = data.url.match(/\/product\/(\d+)/);
                        if (match) {
                            console.log('🆔 ID из JSON-LD (Ozon):', match[1]);
                            return match[1];
                        }
                    }
                } catch(e) {}
            }
        } catch(e) {}

        console.warn('⚠️ ID товара не найден (Ozon)');
        return null;
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
            currency: isKz ? 'KZT' : 'RUB',
            allPrices: []
        };

        try {
            const allElements = document.querySelectorAll('*');
            let priceWithBanks = null;
            let priceWithOtherBanks = null;

            for (const el of allElements) {
                if (el.offsetParent === null) continue;
                const text = el.textContent;
                if (!text) continue;
                // Поддержка ₽ (RU) и ₸ (KZ)
                if (!text.includes('₽') && !text.includes('₸')) continue;
                if (text.length > 500) continue;

                if (text.includes('С банками') || text.includes('с банками')) {
                    if (!text.includes('С другими банками') && !text.includes('с другими банками')) {
                        const match = text.match(/(\d+[\s\d]*)\s*[₽₸]\s*С\s*банками/i);
                        if (match) {
                            const price = parseInt(match[1].replace(/\s/g, ''));
                            if (price > 0 && price < 10000000) {
                                priceWithBanks = price;
                                console.log(`🏦 Ozon цена "С банками": ${price}`);
                            }
                        }
                    }
                }

                if (text.includes('С другими банками') || text.includes('с другими банками')) {
                    const matches = text.match(/(\d+[\s\d]*)\s*[₽₸]/g);
                    if (matches) {
                        const prices = matches.map(m => parseInt(m.replace(/[^\d]/g, '')))
                            .filter(p => p > 0 && p < 10000000);
                        if (prices.length >= 2) {
                            const sorted = [...prices].sort((a, b) => a - b);
                            priceWithOtherBanks = sorted[0];
                            console.log(`💳 Ozon цена "С другими банками": ${priceWithOtherBanks}`);
                        }
                    }
                }
            }

            if (priceWithBanks) {
                result.current = priceWithBanks;
                result.bankPrice = priceWithBanks;
            } else if (priceWithOtherBanks) {
                result.current = priceWithOtherBanks;
                result.otherPrice = priceWithOtherBanks;
            }

            if (priceWithOtherBanks && priceWithOtherBanks !== result.current) {
                result.original = priceWithOtherBanks;
            }

            try {
                const qtyEl = document.querySelector('.quantity-selector .active, [data-test-id="quantity-selector"] .active');
                if (qtyEl) {
                    const num = parseInt(qtyEl.textContent.trim());
                    if (num > 0 && num < 100) result.quantity = num;
                }
            } catch(e) {}

            if (result.original && result.current && result.original > result.current) {
                result.discount = Math.round((1 - result.current / result.original) * 100);
            }

        } catch(e) {
            console.error('❌ Ошибка в getPrices (Ozon):', e);
        }

        // Валюта: KZT для Казахстана, RUB для России
        result.currency = isKz ? 'KZT' : 'RUB';
        console.log(`💰 Валюта: ${result.currency}`);

        return result;
    };

    console.log(`✅ Ozon module loaded (${window.MARKET})`);
})();