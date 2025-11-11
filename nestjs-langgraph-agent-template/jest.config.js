module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: {
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^@types/(.*)$': '<rootDir>/types/$1',
    '^@modules/(.*)$': '<rootDir>/modules/$1',
    '^@agent/(.*)$': '<rootDir>/modules/agent/$1',
    '^@agent/domain/(.*)$': '<rootDir>/modules/agent/core/domain/$1',
    '^@agent/application/(.*)$': '<rootDir>/modules/agent/core/application/$1',
    '^@agent/ports/(.*)$': '<rootDir>/modules/agent/core/ports/$1',
    '^@agent/infrastructure/(.*)$': '<rootDir>/modules/agent/infrastructure/$1',
    '^@agent/interface/(.*)$': '<rootDir>/modules/agent/interface/$1',
    '^@/(.*)$': '<rootDir>/$1',
  },
};

