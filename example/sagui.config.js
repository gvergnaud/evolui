const path = require('path')
/**
 * Sagui configuration object
 * see: http://sagui.js.org/
 */
module.exports = {
  style: {
    cssModules: false
  },
  pages: ['index'],
  additionalWebpackConfig: {
    resolve: {
      alias: {
        evolui: path.join(__dirname, '../src')
        // evolui: path.join(__dirname, '../')
      }
    }
  }
}
