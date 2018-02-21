const fs = require('fs-extra');
const path = require('path');
const xml2js = require('xml2js');

/**
 * Writes a modified version of the given pom to the given dest folder
 * using the given deps list (this is what it modifies)
 * @param  {Object} pom   [description]
 * @param  {string} dest  [description]
 * @param  {Object} dep   [description]
 * @return {Promise}      [description]
 */
function writePom(pom, dest, deps) {
  pom = JSON.parse(JSON.stringify(pom)); // clone
  pom.project.dependencies[0].dependency
    // remove test scope
    .filter((curDep) => !curDep.scope || curDep.scope[0] !== 'test')
    // only keep matching deps
    .filter((curDep) => deps.find(({ g, a }) => curDep.groupId[0] === g && curDep.artifactId[0] === a))
    // update each dep with the new version
    .forEach((curDep) => {
      const dep = deps.find(({ g, a }) => curDep.groupId[0] === g && curDep.artifactId[0] === a);
      curDep.version = [dep.v];
    });

  return fs.writeFile(
    path.join(dest, 'pom.xml'),
    new xml2js.Builder().buildObject(pom),
    'utf8'
  );
}

module.exports = writePom;
