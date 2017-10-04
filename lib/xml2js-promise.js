const xml2js = require('xml2js');



module.exports = {
  /**
   * Promise-based version of xml2js.parseString
   * @param  {string} xml string
   * @return {object}     js object representation of xml
   */
  parseString(xml) {
    return new Promise((resolve, reject) => {
      xml2js.parseString(xml, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
};
