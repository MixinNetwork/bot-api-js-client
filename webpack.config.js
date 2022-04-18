const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/mixin.js',
  externals: [
    'axios',
    'curve25519-js',
    'int64-buffer',
    'jssha',
    'node-forge',
    'serialize-javascript',
    'uuid',
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'mixin.js',
    library: 'Mixin',
    libraryTarget: 'umd',
  },
};
