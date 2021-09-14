module.exports = {
  extends: ['plugin:react/recommended', 'airbnb'],
  plugins: ['react'],
  parser: 'babel-eslint',
  parserOptions: {
    sourcetype: 'module',
    allowImportExportEverywhere: true,
  },
  rules: {},
  settings: {
    react: {
      version: 'latest',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
