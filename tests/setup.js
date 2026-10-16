// tests/setup.js — заглушка console в тестах
// Отключает логи, чтобы вывод тестов был чистым

// Сохраняем оригинальный console (для отладки)
const originalConsole = { ...console };

// Заглушаем шумные методы
global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
};

// Опционально: если нужно включить логи для конкретного теста,
// используйте originalConsole.log(...) внутри теста

// Экспортируем для использования в тестах
global.originalConsole = originalConsole;