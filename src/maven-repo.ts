import * as request from 'request';
import * as Promise from 'bluebird';

import { mvn } from './api';
import { parseString } from './xml2js-promise';
import logger from './logger';

const debug = logger('maven-repo');

export default function mavenRepo(repos: string[], g: string, a: string, nbVersions?: number): Promise<string[]> {
  return Promise.any(repos.map((repo) => createSearch(repo, g, a)))
    .then((versions) => versions.slice(0, nbVersions));
}

function createSearch(repo: string, g: string, a: string): Promise<string[]> {
  const uri = `${transformRepo(repo)}${transformGroup(g)}/${a}/maven-metadata.xml`;
  debug(uri);
  return new Promise((resolve, reject) => {
    request(encodeURI(uri), (err, res, body) => {
      if (err) {
        reject(err);
      } else {
        if (res.statusCode === 200) {
          parseString<mvn.MetaData>(body)
            .then((xml) => resolve(xml.metadata.versioning[0].versions[0].version.reverse()));
        } else {
          reject(new Error(`Request failed (${res.statusMessage}/${body})`));
        }
      }
    });
  });
}

function transformRepo(repo: string): string {
  return repo.endsWith('/') ? repo : `${repo}/`;
}

function transformGroup(group: string): string {
  return group.split('.').join('/');
}