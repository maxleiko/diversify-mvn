const fs = require('fs-extra');
const { join } = require('path');
const modifyPom = require('./modify-pom');

/**
 * Writes a copy of the given PROJECT_PATH at dest/ directory
 * Updates the pom.xml with the given "deps" dependencies
 * Also write the changed dependencies into a diversified-deps.json file
 *
 * @param  {[type]} pom          [description]
 * @param  {[type]} deps         [description]
 * @param  {[type]} PROJECT_PATH [description]
 * @param  {[type]} dest         [description]
 * @return {[type]}              [description]
 */
function copyClone(pom, deps, PROJECT_PATH, dest) {
  const newPom = JSON.parse(JSON.stringify(pom));
  return fs.copy(PROJECT_PATH, dest)
    .then(() => modifyPom(newPom, deps, dest))
    .then(() => fs.writeJson(join(dest, 'diversified-deps.json'), deps, { spaces: 2 }));
}

module.exports = copyClone;
