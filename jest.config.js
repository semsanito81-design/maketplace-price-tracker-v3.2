module.exports = {
    testEnvironment: 'jsdom',
    testMatch: ['**/tests/**/*.test.js'],
    collectCoverageFrom: [
        'core.js',
        'storage.js',
        'wildberries.js',
        'ozon.js',
        'yandex.js',
        'aliexpress.js'
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/tests/'
    ],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    verbose: true,
    testTimeout: 10000,
    clearMocks: true,
    resetModules: true
};