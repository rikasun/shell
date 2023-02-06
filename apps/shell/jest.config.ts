/* eslint-disable */
export default {
  displayName: 'shell',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nrwl/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coveragePathIgnorePatterns: [
    '/libs/ui',
    '/libs/remotes',
    '/node_modules/',
    '/libs/test-utilities',
    '/apps/shell/src/app/utils/tests',
  ],
  coverageDirectory: '../../coverage/apps/shell',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFiles: ['jest-canvas-mock'],
};
