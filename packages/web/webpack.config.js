const path = require('path');

module.exports = {
  mode: "production",
  entry: './src/index.ts',
  target: 'web',
  module: {
    rules: [
      { test: /\.ts?$/, loader: "ts-loader" }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'mixin-web-sdk.js',
    path: path.resolve(__dirname, 'dist'),
  },
};