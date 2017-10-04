const decamelize = require('decamelize');
const searchNpm = require('./search-npm');

function bowerDepsVersions(bower) {
  return Promise.all(Object.keys(bower.dependencies)
    .map((name) => searchNpm(decamelize(name, '-')).then((versions) => ({ name, versions }))));
}

module.exports = bowerDepsVersions;
