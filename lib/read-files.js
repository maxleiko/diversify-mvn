const fs = require('fs-extra');
const path = require('path');
const xml2js = require('./xml2js-promise');

function readFiles(JHIPSTER_PATH) {
  const POM_PATH = path.join(JHIPSTER_PATH, 'pom.xml');

  return fs.readFile(POM_PATH, 'utf8')
    .then((pom) => {
      return xml2js.parseString(pom)
        .then((pom) => ({ pom }));
    }, (err) => {
      console.error(err.stack);
      throw new Error(`Unable to read/parse ${POM_PATH}`);
    });
}

module.exports = readFiles;
