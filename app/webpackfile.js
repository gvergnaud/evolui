const { join } = require('path');

module.exports = {
  entry: join(__dirname, 'src/index'),
  output: {
    path: join(__dirname, 'dist'),
    filename: 'bundle.js',
  },
};
