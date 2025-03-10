const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './'
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  maxWorkers: '50%',
  testTimeout: 10000,
  bail: 5,
  verbose: true,
  collectCoverage: process.env.CI === 'true',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/out/'
  ]
}

module.exports = createJestConfig(customJestConfig) 