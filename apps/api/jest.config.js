/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: 'e2e',
      testMatch: ['<rootDir>/test/**/*.e2e.spec.ts'],
      transform: {
        '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }],
      },
      transformIgnorePatterns: [
        'node_modules/(?!(@nestjs/mapped-types)/)',
      ],
      testEnvironment: 'node',
    },
  ],
};
