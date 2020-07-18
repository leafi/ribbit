module.exports = {
  babel: {
    jsx: 'preact'
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
