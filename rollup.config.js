import babel from 'rollup-plugin-babel'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import uglify from 'rollup-plugin-uglify'

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
    ...additionnalPlugins
  ],
  external: ['rxjs', 'rxjs/operators', 'vdom-tag', 'rx-ease']
})

export default [
  createConfig('src/index.js', 'lib/evolui.js'),
  createConfig('src/index.js', 'lib/evolui.min.js', [uglify()]),
  createConfig('src/extra/index.js', 'extra.js')
]
