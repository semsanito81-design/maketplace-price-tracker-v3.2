// tests/mocks/browser.js
// Эмуляция browser API для Jest

function createMockStorage() {
    let storageData = {};

    return {
        local: {
            get: jest.fn((keys) => {
                if (keys === null || keys === undefined) {
                    return Promise.resolve({ ...storageData });
                }
                if (typeof keys === 'string') {
                    return Promise.resolve({ [keys]: storageData[keys] });
                }
                if (Array.isArray(keys)) {
                    const result = {};
                    keys.forEach(k => {
                        if (storageData[k] !== undefined) result[k] = storageData[k];
                    });
                    return Promise.resolve(result);
                }
                return Promise.resolve({});
            }),
            set: jest.fn((items) => {
                Object.assign(storageData, items);
                return Promise.resolve();
            }),
            remove: jest.fn((keys) => {
                const arr = Array.isArray(keys) ? keys : [keys];
                arr.forEach(k => delete storageData[k]);
                return Promise.resolve();
            }),
            clear: jest.fn(() => {
                storageData = {};
                return Promise.resolve();
            }),
            _getData: () => storageData,
            _setData: (data) => { storageData = data; },
            _reset: () => { storageData = {}; }
        }
    };
}

function createMockRuntime() {
    const listeners = [];

    return {
        runtime: {
            sendMessage: jest.fn(() => Promise.resolve()),
            onMessage: {
                addListener: jest.fn((fn) => listeners.push(fn)),
                removeListener: jest.fn((fn) => {
                    const idx = listeners.indexOf(fn);
                    if (idx >= 0) listeners.splice(idx, 1);
                }),
                _trigger: (message, sender, sendResponse) => {
                    listeners.forEach(fn => fn(message, sender, sendResponse));
                }
            },
            lastError: null,
            getManifest: jest.fn(() => ({ version: '3.1.0.5' }))
        }
    };
}

function createMockTabs() {
    return {
        tabs: {
            create: jest.fn((opts) => Promise.resolve({ id: 1, url: opts.url })),
            remove: jest.fn(() => Promise.resolve()),
            sendMessage: jest.fn(() => Promise.resolve({ price: null })),
            onUpdated: {
                addListener: jest.fn(),
                removeListener: jest.fn()
            }
        }
    };
}

function createMockNotifications() {
    return {
        notifications: {
            create: jest.fn((opts, cb) => {
                if (cb) cb('notification-id');
            })
        }
    };
}

function setupBrowserMock() {
    const storage = createMockStorage();
    const runtime = createMockRuntime();
    const tabs = createMockTabs();
    const notifications = createMockNotifications();

    global.browser = {
        ...storage,
        ...runtime,
        ...tabs,
        ...notifications
    };

    global.chrome = global.browser;

    return {
        storage,
        runtime,
        tabs,
        notifications,
        resetAll: () => {
            storage.local._reset();
            jest.clearAllMocks();
        }
    };
}

module.exports = {
    setupBrowserMock,
    createMockStorage,
    createMockRuntime,
    createMockTabs,
    createMockNotifications
};