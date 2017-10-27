const crypto = require('crypto');

function hash(deps) {
  return crypto
    .createHash('sha256')
    .update(deps.reduce((acc, { g, a, v }) => acc + `${g}:${a}:${v}`, ''))
    .digest('hex');
}

module.exports = hash;
