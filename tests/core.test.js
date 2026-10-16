const { setupBrowserMock } = require('./mocks/browser');

let mock;

// ✅ beforeEach — В НАЧАЛЕ, до всех describe
beforeEach(() => {
    mock = setupBrowserMock();
    jest.resetModules();
    delete require.cache[require.resolve('../storage.js')];
    delete require.cache[require.resolve('../core.js')];
    
    //console.log('=== ДО загрузки ===');
    //console.log('window.CATEGORIES:', typeof window.CATEGORIES);
    //console.log('global.CATEGORIES:', typeof global.CATEGORIES);
    
    require('../storage.js');
    require('../core.js');
    
    //console.log('=== ПОСЛЕ загрузки ===');
    //console.log('window.CATEGORIES:', typeof window.CATEGORIES);
    //console.log('global.CATEGORIES:', typeof global.CATEGORIES);
});

describe('formatPrice', () => {
    test('форматирует целое число с разделителями', () => {
        expect(window.formatPrice(160349)).toBe('160 349');
    });

    test('форматирует с валютой RUB', () => {
        expect(window.formatPrice(160349, 'RUB')).toBe('160 349 ₽');
    });

    test('возвращает — для null', () => {
        expect(window.formatPrice(null)).toBe('—');
    });
});

describe('getCurrencySymbol', () => {
    test('RUB → ₽', () => {
        expect(window.getCurrencySymbol('RUB')).toBe('₽');
    });

    test('USD → $', () => {
        expect(window.getCurrencySymbol('USD')).toBe('$');
    });
});

describe('CATEGORIES', () => {
    test('содержит all и other', () => {
        expect(window.CATEGORIES.all).toBeDefined();
        expect(window.CATEGORIES.other).toBeDefined();
    });
});

describe('CATEGORIES — новые категории 3.2.0', () => {
    const getCats = () => window.CATEGORIES || global.CATEGORIES;

    test('содержит 60 категорий', () => {
        const cats = getCats();
        expect(cats).toBeDefined();
        expect(Object.keys(cats).length).toBeGreaterThanOrEqual(60);
    });

    test('есть категория Аптека', () => {
        const cats = getCats();
        expect(cats).toBeDefined();
        expect(cats.pharmacy).toBeDefined();
        expect(cats.pharmacy.name).toBe('Аптека');
    });

    test('есть категория Бытовая химия', () => {
        const cats = getCats();
        expect(cats).toBeDefined();
        expect(cats.household).toBeDefined();
    });

    test('есть категория Стройматериалы', () => {
        const cats = getCats();
        expect(cats).toBeDefined();
        expect(cats.construction).toBeDefined();
    });

    test('есть категория Рыбалка', () => {
        const cats = getCats();
        expect(cats).toBeDefined();
        expect(cats.fishing).toBeDefined();
    });

    test('есть категория Умный дом', () => {
        const cats = getCats();
        expect(cats).toBeDefined();
        expect(cats.smart_home).toBeDefined();
    });

    test('есть категория Музыкальные инструменты', () => {
        const cats = getCats();
        expect(cats).toBeDefined();
        expect(cats.musical).toBeDefined();
    });
});