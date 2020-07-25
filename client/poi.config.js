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
    },
    module: {
      rules: [{
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: ['raw-loader']
      }]
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
