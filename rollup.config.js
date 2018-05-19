import babel from 'rollup-plugin-babel'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import uglify from 'rollup-plugin-uglify'
import autoExternal from 'rollup-plugin-auto-external'

const createConfig = (input, output, additionnalPlugins = []) => ({
  input,
  output: {
    file: output,
    format: 'es'
  },
  plugins: [
    nodeResolve({
      jsnext: true
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    babel({
      exclude: 'node_modules/**'
    }),
    autoExternal(),
    ...additionnalPlugins
  ]
})

export default [
  createConfig('src/index.js', 'lib/evolui.js'),
  createConfig('src/index.js', 'lib/evolui.min.js', [uglify()]),
  createConfig('src/extra/index.js', 'extra.js')
]
