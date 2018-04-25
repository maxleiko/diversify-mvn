import * as debug from 'debug';

const pkg = require('../package.json');

export default function logger(name: string) {
  return debug(`${pkg.name}:${name}`);
}