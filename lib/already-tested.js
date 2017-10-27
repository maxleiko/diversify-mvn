// TODO change that with a db
global.db = {};

function alreadyTested(hash) {
  const isTested = global.db[hash];
  if (!isTested) {
    global.db[hash] = true;
  }
  return isTested;
}

function size() {
  return Object.keys(global.db).length;
}

module.exports = { alreadyTested, size };
