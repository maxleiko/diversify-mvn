import { Dep } from './api';
import logger from './logger';
import mavenRepo from './maven-repo';

const debug = logger('mvn-deps-versions');

export default function mvnDepsVersions(repos: string[], deps: Dep[], nbVersions: number) {
  debug('searching Maven deps');
  return Promise.all(
    deps.map(({ g, a }) => mavenRepo(repos, g, a, nbVersions)
      .then((versions) => ({ g, a, versions })))
  );
}
