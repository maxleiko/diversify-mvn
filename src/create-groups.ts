import mvnDepsVersions from './mvn-deps-versions';
import { Groups, Dep } from './api';
import logger from './logger';

const debug = logger('create-group');

export default function createGroups(deps: Dep[], versionsCount: number) {
  debug('create groups');
  return mvnDepsVersions(deps, versionsCount)
    .then((mvnDeps) => {
      // pre-process mvnDeps to isolate deps in "groups"
      const groups: Groups = {};
      mvnDeps
        .filter(({ versions }) => versions.length > 0)
        .forEach(({ g, a, versions }) => {
          let grp = groups[g];
          if (!grp) {
            grp = { artifacts: [], versions };
            groups[g] = grp;
          }
          grp.artifacts.push(a);
        });
      return groups;
    });
}