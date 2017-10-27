const random = require('./random');

/**
 * Returns a list of random dependencies based on the given groups
 * @param  {Object} groups the groups
 * @return {Array}         a list of deps created based on the given groups
 */
function randomDeps(groups) {
  const deps = [];
  const groupIds = Object.keys(groups);
  const nbMutantGroups = random(1, groupIds.length);
  const alreadyUsed = {};

  for (let i=0; i < nbMutantGroups; i++) {
    let rndGrpId = groupIds[random(0, groupIds.length - 1)];
    while (alreadyUsed[rndGrpId]) {
      rndGrpId = groupIds[random(0, groupIds.length - 1)];
    }
    alreadyUsed[rndGrpId] = true;
    const rndGrp = groups[rndGrpId];
    const rndVersion = rndGrp.versions[random(0, rndGrp.versions.length - 1)];
    rndGrp.artifacts
      .forEach((a) => deps.push({ g: rndGrpId, a, v: rndVersion }));
  }

  return deps.sort((a, b) => {
    if (a.g < b.g) { return -1; }
    else if (a.g > b.g) { return 1; }
    return 0;
  });
}

module.exports = randomDeps;
