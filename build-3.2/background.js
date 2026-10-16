// background.js — обработка уведомлений + логирование хранилища
(function() {
    'use strict';

    // Логирование при старте
    PTStorage.get('pt_tracked').then(data => {
        console.log('📋 ВСЁ ХРАНИЛИЩЕ (background):', { pt_tracked: data });
        if (data) {
            console.log('✅ pt_tracked есть:', data.length, 'товаров');
            console.table(data);
        } else {
            console.log('❌ pt_tracked НЕТ в хранилище');
        }
    }).catch(e => console.error('❌ Ошибка чтения хранилища:', e));

    // Универсальный runtime
    const runtime = (typeof browser !== 'undefined' && browser.runtime) 
        ? browser.runtime 
        : chrome.runtime;

    // Обработчик уведомлений из content scripts
    runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'notify') {
            const notifications = (typeof browser !== 'undefined' && browser.notifications)
                ? browser.notifications
                : chrome.notifications;

            notifications.create({
                type: 'basic',
                title: message.title,
                message: message.message,
                iconUrl: 'icons/icon48.png'
            }, (id) => {
                if (chrome.runtime.lastError) {
                    console.error('❌ Ошибка уведомления:', chrome.runtime.lastError);
                } else {
                    console.log('🔔 Уведомление отправлено:', message.title);
                }
            });
        }
        // Возвращаем true если нужно отправить ответ асинхронно (не обязательно для create)
        return true;
    });

    console.log('✅ Background script загружен');
})();
