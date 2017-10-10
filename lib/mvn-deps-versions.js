const Promise = require('bluebird');
const searchMaven = require('./search-maven');

function mvnDepsVersions(deps, nbVersions) {
  return Promise.map(
    deps,
    ({ g, a }) => searchMaven(g, a, nbVersions)
      .then((versions) => ({ g, a, versions })),
    { concurrency: 1 }
  );
}

module.exports = mvnDepsVersions;
