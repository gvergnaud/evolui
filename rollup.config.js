import babel from 'rollup-plugin-babel'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

const createConfig = (input, output) => ({
  input,
  output: {
    file: output,
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
    })
  ]
})

export default [
  createConfig('src/index.js', 'lib/evolui.js'),
  createConfig('src/ease.js', 'lib/ease.js')
];
