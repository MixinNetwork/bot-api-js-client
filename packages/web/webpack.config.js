const path = require('path')

function genConfig(name) {
  const isWeb = name.includes('browser')
  return {
    mode: "production",
    entry: isWeb ? './src/lib/index.js' : './src/lib/cmd.js',
    target: isWeb ? 'web' : 'node',
    module: {
      rules: [
        { test: /\.ts?$/, loader: "ts-loader" }
      ]
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    output: {
      filename: 'mixin.' + name + '.js',
      libraryTarget: 'umd',
      path: path.resolve(__dirname, 'dist'),
    },
  }
}






module.exports = ['min', 'browser.min'].map(genConfig)