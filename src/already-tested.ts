const db = {};

export function alreadyTested(hash: string) {
  const isTested = db[hash];
  if (!isTested) {
    db[hash] = true;
  }
  return isTested;
}

export function size() {
  return Object.keys(db).length;
}