const path = require('path')
/**
 * Sagui configuration object
 * see: http://sagui.js.org/
 */
module.exports = {
  pages: ['index'],
  additionalWebpackConfig: {
    resolve: {
      alias: {
        evolui: path.join(__dirname, '../src'),
        'evolui/lib/ease': path.join(__dirname, '../src/ease')
      }
    }
  }
}
