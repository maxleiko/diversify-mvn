import * as fs from 'fs-extra';
import * as path from 'path';
import { mvn } from './api';
import { parseString } from './xml2js-promise';
import logger from './logger';

const debug = logger('read-pom');

export default function readPom(dir: string) {
  const uri = path.join(dir, 'pom.xml');
  debug(uri);

  return fs.readFile(uri, 'utf8')
    .then((pom) => {
      return parseString<mvn.Pom>(pom);
    }, (err) => {
      console.error(err.stack);
      throw new Error(`Unable to read/parse ${uri}`);
    });
}
