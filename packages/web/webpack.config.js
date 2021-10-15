const path = require('path')

function genConfig(name) {
  const isWeb = name.includes('browser')
  return {
    mode: "production",
    entry: isWeb ? './lib/index.ts' : './lib/cmd.ts',
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
      filename: 'web.' + name + '.js',
      libraryTarget: 'umd',
      path: path.resolve(__dirname, 'dist'),
    },
  }
}






module.exports = ['min', 'browser.min'].map(genConfig)