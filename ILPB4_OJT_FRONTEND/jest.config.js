module.exports = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/', '/e2e/'],
    globals: {
      'ts-jest': {
        tsconfig: 'tsconfig.spec.json',
        stringifyContentPathRegex: '\\.html$',
      },
    },
    moduleFileExtensions: ['ts', 'html', 'js', 'json'],
    testMatch: ['**/+(*.)+(spec).+(ts)'],
    reporters: [
      'default',
      [
        'jest-html-reporter',
        {
          pageTitle: 'Test Report',
          outputPath: './test-report/test-report.html',
          includeFailureMsg: true,
          includeConsoleLog: true,
        },
      ],
    ],
  };
  