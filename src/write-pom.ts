import * as fs from 'fs-extra';
import * as path from 'path';
import * as xml2js from 'xml2js';
import { mvn } from './api';
import logger from './logger';

const debug = logger('write-pom');

export default function writePom(pom: mvn.Pom, dest: string) {
  const uri = path.join(dest, 'pom.xml');
  debug(uri);
  return fs.writeFile(uri, new xml2js.Builder().buildObject(pom), 'utf8');
}
