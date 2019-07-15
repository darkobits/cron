module.exports = require('@darkobits/ts-unified/dist/config/jest')({
  coveragePathIgnorePatterns: [
    '<rootDir>/src/lib/log',
    '<rootDir>/src/test.ts'
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 65,
      functions: 85,
      lines: 80
    }
  }
});
