const path = require('path')

module.exports = {
  mode: "production",
  entry: './lib/index.js',
  target: 'web',
  output: {
    filename: 'mixin-avatar.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
  }
};