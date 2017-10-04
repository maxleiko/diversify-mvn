const random = require('./random');

/**
 * [randomDeps description]
 * @param  {[type]} deps [description]
 * @return {[type]}      [description]
 */
function randomDeps(deps) {
  const randomDeps = {};

  const count = random(deps.length) || 1; // at least one dep
  for (let i=0; i < count; i++) {
    const { dep, key } = randomDep(randomDeps, deps);
    const clone = JSON.parse(JSON.stringify(dep));
    clone.version = clone.versions[random(clone.versions.length)];
    delete clone.versions;
    randomDeps[key] = clone;
  }

  return Object.keys(randomDeps).map((key) => randomDeps[key]);
}

/**
 * [randomDep description]
 * @param  {[type]} previousDeps [description]
 * @param  {[type]} deps         [description]
 * @return {[type]}              [description]
 */
function randomDep(previousDeps, deps) {
  let dep = deps[random(deps.length)];
  let key = dep.g ? `${dep.g}:${dep.a}`: dep.name;
  while (previousDeps[key]) {
    dep = deps[random(deps.length)];
    key = dep.g ? `${dep.g}:${dep.a}`: dep.name;
  }
  return { dep, key };
}

module.exports = randomDeps;
