import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import { uglify } from 'rollup-plugin-uglify'

const plugins = [
  replace({
    'process.browser': process.env.BROWSER === 'true',
  }),
  babel({
    exclude: 'node_modules/**',
  }),
]

export default {
  input: 'src/mixin.js',
  output: {
    file: 'lib/mixin.js',
    format: 'iife',
    name: 'Mixin',
  },
  plugins,
}
