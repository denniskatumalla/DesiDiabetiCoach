/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@desidiabeticoach/shared$': '<rootDir>/../../packages/shared/src/index.ts',
    '^@desidiabeticoach/ui$': '<rootDir>/../../packages/ui/src/index.ts',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        // The app tsconfig targets the Next.js bundler (ESM + "bundler"
        // resolution); Jest runs on CommonJS, so override just those two.
        tsconfig: {
          module: 'CommonJS',
          moduleResolution: 'Node',
          isolatedModules: false,
        },
      },
    ],
  },
};
