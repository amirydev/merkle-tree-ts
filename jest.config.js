module.exports = {
    transform: {
        '^.+\\.ts?$': 'ts-jest'
    },
    testEnvironment: 'node',
    testRegex: '.*\\.(test|spec)?\\.(ts|ts)$',
    moduleFileExtensions: ['ts', 'js', 'json'],
    "roots": [
        "<rootDir>/src"
    ]
};
