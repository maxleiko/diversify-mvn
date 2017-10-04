/**
 * Clones the given pom and replaces the old deps with the new given
 * @param  {[type]} pom [description]
 * @param  {[type]} dep [description]
 * @return {[type]}     [description]
 */
function modifyPom(pom, deps) {
  const newPom = JSON.parse(JSON.stringify(pom));
  newPom.project.dependencies[0].dependency
    // remove test scope
    .filter((curDep) => !curDep.scope || curDep.scope[0] !== 'test')
    // only keep matching deps
    .filter((curDep) => deps.find(({ g, a }) => curDep.groupId[0] === g && curDep.artifactId[0] === a))
    // update each dep with the new version
    .forEach((curDep) => {
      const dep = deps.find(({ g, a }) => curDep.groupId[0] === g && curDep.artifactId[0] === a);
      curDep.version = [dep.version];
    });
  return newPom;
}

module.exports = modifyPom;
