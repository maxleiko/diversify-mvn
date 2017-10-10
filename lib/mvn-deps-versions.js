const Promise = require('bluebird');
const searchMaven = require('./search-maven');

function mvnDepsVersions(deps, nbVersions) {
  return Promise.all(
    deps.map(({ g, a }) => searchMaven(g, a, nbVersions)
      .then((versions) => ({ g, a, versions })))
  );
}

module.exports = mvnDepsVersions;
