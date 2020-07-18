module.exports = {
  babel: {
    jsx: 'preact'
  },
  configureWebpack: {
    resolve: {
      alias: {
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat'
      }
    }
  },
  entry: 'src/index.jsx',
  plugins: [
    {
      resolve: '@poi/plugin-eslint'
    },
    {
      resolve: '@poi/bundle-report'
    }
  ]
}
