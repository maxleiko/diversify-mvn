const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const xml2js = require('xml2js');

/**
 * Copy JHIPSTER_PATH content to "dest" while overwritting dest/pom.xml
 * and dest/bower.json with the given object in parameter
 * @param  {object}  pom           a pom file object
 * @param  {object}  bower         a bower.json object
 * @param  {string}  JHIPSTER_PATH path of the directory to copy
 * @param  {string}  dest          path of the destination of the copied directory
 * @return {Promise}               Promise
 */
function copy(pom, bower, JHIPSTER_PATH, dest) {
  const POM_PATH = path.join(dest, 'pom.xml');
  const BOWER_PATH = path.join(dest, 'bower.json');

  return fs.copy(JHIPSTER_PATH, dest)
    .then(() => {
      // write pom.xml with the given pom
      const builder = new xml2js.Builder();
      return fs.writeFile(POM_PATH, builder.buildObject(pom), 'utf8')
        .then(() => {}, (err) => {
          console.error(err.stack);
          throw new Error(`Unable to write ${POM_PATH} with the generated content`);
        });
    })
    .then(() => {
      // write bower.json with the given pkg
      const bowerJson = JSON.stringify(bower, null, 2);
      return fs.writeFile(BOWER_PATH, bowerJson, 'utf8')
        .then(() => {}, (err) => {
          console.error(err.stack);
          throw new Error(`Unable to write ${BOWER_PATH} with the generated content`);
        });
    })
    .then(() => {
      const springVersion = pom.project.parent[0].version[0];
      const angularVersion = bower.dependencies.angular;
      console.log(`Created: ${chalk.cyan(dest)} with Spring ${chalk.blue(springVersion)} and Angular ${chalk.blue(angularVersion)}`);
    });
}

module.exports = copy;
