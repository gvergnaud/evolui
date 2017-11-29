const { join } = require('path');

module.exports = {
  devtool: 'source-maps',
  entry: join(__dirname, 'src/index'),
  output: {
    path: join(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              'babel-plugin-transform-exponentiation-operator',
              'babel-plugin-transform-async-generator-functions'
            ]
          },
        }
      }
    ]
  }
};
