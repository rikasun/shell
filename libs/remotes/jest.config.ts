/* eslint-disable */
export default {
  displayName: 'remotes',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/remotes',
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
};
