warning: in the working copy of 'wildberries.js', LF will be replaced by CRLF the next time Git touches it
[1mdiff --git a/wildberries.js b/wildberries.js[m
[1mindex 67f30da..b01c4aa 100644[m
[1m--- a/wildberries.js[m
[1m+++ b/wildberries.js[m
[36m@@ -94,6 +94,26 @@[m
     };[m
 [m
     window.getPrices = async function() {[m
[32m+[m[32m        // Определяем валюту по символам на странице[m
[32m+[m[32m        let detectedCurrency = 'RUB';[m
[32m+[m[32m        try {[m
[32m+[m[32m            const bodyText = document.body.textContent || '';[m
[32m+[m[32m            const hasTenge = bodyText.includes('₸');[m
[32m+[m[32m            const hasRuble = bodyText.includes('₽');[m
[32m+[m[41m            [m
[32m+[m[32m            if (hasTenge && !hasRuble) {[m
[32m+[m[32m                detectedCurrency = 'KZT';[m
[32m+[m[32m            } else if (hasTenge && hasRuble) {[m
[32m+[m[32m                // Если оба — смотрим, какой встречается чаще[m
[32m+[m[32m                const tengeCount = (bodyText.match(/₸/g) || []).length;[m
[32m+[m[32m                const rubleCount = (bodyText.match(/₽/g) || []).length;[m
[32m+[m[32m                detectedCurrency = tengeCount > rubleCount ? 'KZT' : 'RUB';[m
[32m+[m[32m            }[m
[32m+[m[32m            console.log(`💰 Валюта WB определена: ${detectedCurrency} (₸: ${hasTenge}, ₽: ${hasRuble})`);[m
[32m+[m[32m        } catch(e) {[m
[32m+[m[32m            console.warn('⚠️ Не удалось определить валюту WB:', e);[m
[32m+[m[32m        }[m
[32m+[m
         let result = {[m
             current: null,[m
             original: null,[m
[36m@@ -102,7 +122,7 @@[m
             perItem: null,[m
             discount: null,[m
             quantity: null,[m
[31m-            currency: 'RUB',[m
[32m+[m[32m            currency: detectedCurrency,[m
             allPrices: [][m
         };[m
 [m
