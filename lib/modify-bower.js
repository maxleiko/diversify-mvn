/**
 * Clones the given bower and replaces the old deps with the new given ones
 * @param  {[type]} bower [description]
 * @param  {[type]} deps  [description]
 * @return {[type]}       [description]
 */
function modifyBower(bower, deps) {
  const newBower = JSON.parse(JSON.stringify(bower));
  deps.forEach((dep) => {
    newBower.dependencies[dep.name] = dep.version;
  });
  return newBower;
}

module.exports = modifyBower;
