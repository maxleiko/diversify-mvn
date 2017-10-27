const randomDeps = require('./random-deps');
const hash = require('./hash');
const { alreadyTested } = require('./already-tested');

function createMutant(groups) {
  let mutantDeps = randomDeps(groups);
  let mutantHash = hash(mutantDeps);
  while (alreadyTested(mutantHash)) {
    mutantDeps = randomDeps(groups);
    mutantHash = hash(mutantDeps);
  }
  return { hash: mutantHash, dependencies: mutantDeps };
}

module.exports = createMutant;
