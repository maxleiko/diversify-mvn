const pkgVersions = require('pkg-versions');

function searchNpm(name) {
  return pkgVersions(name)
    .then((versions) => [...versions].slice(-10));
}

module.exports = searchNpm;
