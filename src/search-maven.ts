import * as request from 'request';

import logger from './logger';

const debug = logger('search-maven');

export default function searchMaven(g: string, a: string, nbVersions: number) {
  const uri = `http://search.maven.org/solrsearch/select?q=g:"${g}"+AND+a:"${a}"&rows=${nbVersions}&core=gav&wt=json`;
  debug(uri);
  
  return new Promise<string[]>((resolve, reject) => {
    request({ uri: encodeURI(uri), json: true }, (error, response, body) => {
      if (error) {
        reject(new Error('Unable to search Maven Central'));
      } else {
        if (response.statusCode === 200) {
          resolve(body.response.docs.map((doc: any) => doc.v));
        } else {
          reject(new Error(`Unable to search Maven Central (${response.statusCode} - ${response.statusMessage})`));
        }
      }
    });
  });
}
