import babel from 'rollup-plugin-babel'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  input: 'src/index.js',
  output: {
    file: 'lib/evolui.js',
    format: 'cjs'
  },
  plugins: [
    nodeResolve({
      jsnext: true,
      main: true
    }),
    commonjs({
      include: 'node_modules/**',
      namedExports: {
        'node_modules/virtual-dom/index.js': [ 'h', 'diff', 'patch' ]
      }
    }),
    babel({
      exclude: 'node_modules/**'
    }),
  ]
};
