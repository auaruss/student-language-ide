module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'eslint-config-airbnb-base',
  ],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'import/prefer-default-export': 'off',
    'import/extensions': 0,
  },
  overrides: [
    {
      files: [
        '**/src/**/*.spec.js',
      ],
      env: {
        jest: true,
      },
    },
  ],
};
