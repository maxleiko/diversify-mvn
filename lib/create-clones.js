const { join } = require('path');

/**
 * Creates clones of the given PROJECT_PATH app
 * The clone will be generated in "dest" directory
 *
 * @param  {object}  pom
 * @param  {array}   grps
 * @param  {string}  PROJECT_PATH
 * @param  {string}  dest
 * @return {Promise}
 */
function createClones(pom, grps, PROJECT_PATH, dest) {
  return Promise.resolve(Object.keys(grps)
    .map((key) => grps[key])
    .map((grp, grpIndex) => {
      const clones = [];
      const nbClones = grp[0].versions.length;
      for (let i = 0; i < nbClones; i++) {
        clones.push({
          path: join(dest, PROJECT_PATH + '-' + grpIndex + '-' + i),
          deps: grp.map(({ g, a, versions }) => ({ g, a, v: versions[i] }))
        });
      }
      return clones;
    })
    .reduce((clones, next) => clones.concat(next), [])
  );
}

module.exports = createClones;
