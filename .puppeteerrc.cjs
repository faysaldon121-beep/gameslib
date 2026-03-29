// .puppeteerrc.cjs
const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Store the browser in a directory inside your project
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
