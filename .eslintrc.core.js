module.exports = {
  extends: ['plugin:@nrwl/nx/react', 'airbnb', 'airbnb/hooks'],
  ignorePatterns: ['!**/*'],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      extends: ['airbnb-typescript', 'prettier'],
      parserOptions: {
        project: ['./tsconfig.*?.json', './.storybook/tsconfig.*?.json'],
        tsconfigRootDir: __dirname,
      },
      rules: {
        'import/prefer-default-export': 0,
        'import/no-named-as-default': 0,
        'react/jsx-uses-react': 0,
        'react/react-in-jsx-scope': 0,
        'react/require-default-props': 0,
        'react/button-has-type': 0,
        'jsx-a11y/label-has-associated-control': [
          2,
          {
            assert: 'either',
          },
        ],
        'lines-between-class-members': 0,
        '@typescript-eslint/lines-between-class-members': 0,
        'max-lines': [
          'error',
          {
            max: 300,
            skipBlankLines: true,
            skipComments: true,
          },
        ],
        'no-underscore-dangle': 0,
        'no-console': [2, { allow: ['error', 'warn'] }],
        'no-continue': 'off',
      },
    },
  ],
};
