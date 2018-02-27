import 'bluebird';
import searchMaven from './search-maven';
import { Dep } from './api';
import logger from './logger';

const debug = logger('mvn-deps-versions');

export default function mvnDepsVersions(deps: Dep[], nbVersions: number) {
  debug('searching Maven deps');
  return Promise.all(
    deps.map(({ g, a }) => searchMaven(g, a, nbVersions)
      .then((versions) => ({ g, a, versions })))
  );
}
