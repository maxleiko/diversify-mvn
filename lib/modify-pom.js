const fs = require('fs-extra');
const path = require('path');
const xml2js = require('xml2js');

/**
 * Modifies the content of the given pom object using the given deps, then
 * writes the content of the pom object to the dest/pom.xml file
 * @param  {[type]} pom  [description]
 * @param  {[type]} deps [description]
 * @param  {[type]} dest [description]
 * @return {[type]}      [description]
 */
function modifyPom(pom, deps, dest) {
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

  const pomFile = path.join(dest, 'pom.xml');
  return fs.writeFile(pomFile, new xml2js.Builder().buildObject(pom), 'utf8');
}

module.exports = modifyPom;
