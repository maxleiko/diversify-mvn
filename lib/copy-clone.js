const fs = require('fs-extra');
const { join } = require('path');
const modifyPom = require('./modify-pom');

function copyClone(pom, deps, PROJECT_PATH, dest) {
  const newPom = JSON.parse(JSON.stringify(pom));
  return fs.copy(PROJECT_PATH, dest)
    .then(() => modifyPom(newPom, deps, dest))
    .then(() => fs.writeJson(join(dest, 'diversified-deps.json'), deps));
}

module.exports = copyClone;
