const fs = require('fs-extra');
const path = require('path');
const xml2js = require('./xml2js-promise');

function readFiles(JHIPSTER_PATH) {
  const POM_PATH = path.join(JHIPSTER_PATH, 'pom.xml');
  const BOWER_PATH = path.join(JHIPSTER_PATH, 'bower.json');

  return fs.readFile(POM_PATH, 'utf8')
    .then((pom) => {
      return xml2js.parseString(pom)
        .then((pom) => ({ pom }));
    }, (err) => {
      console.error(err.stack);
      throw new Error(`Unable to read/parse ${POM_PATH}`);
    })
    .then((obj) => {
      return fs.readJson(BOWER_PATH, 'utf8')
        .then((bower) => {
          obj.bower = bower;
          return obj;
        }, (err) => {
          console.error(err.stack);
          throw new Error(`Unable to read ${BOWER_PATH}`);
        });
    });
}

module.exports = readFiles;
