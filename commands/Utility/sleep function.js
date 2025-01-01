// utility.js or any appropriate file
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  module.exports = { sleep };
  