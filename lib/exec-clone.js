const exec = require('./exec');

function execClone(cmd, clone) {
  return exec(cmd, clone.path).then(
    () => Object.assign({ isValid: true  }, clone),
    () => Object.assign({ isValid: false }, clone)
  );
}

module.exports = execClone;
