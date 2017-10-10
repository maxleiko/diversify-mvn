const fs = require('fs-extra');

function updateResult(file, clone) {
  return fs.readJson(file)
    .then((result) => result, () => [])
    .then((result) => result.concat(clone))
    .then((result) => fs.writeJson(file, result, { spaces: 2 }))
    .catch(() => {}) // ignore all errors
    .then(() => clone);
}

module.exports = updateResult;
