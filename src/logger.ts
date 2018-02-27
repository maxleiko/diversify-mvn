import * as debug from 'debug';

export default function logger(name: string) {
  return debug(`diversify-mvn:${name}`);
}