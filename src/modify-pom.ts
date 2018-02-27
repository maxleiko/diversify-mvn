import { mvn, Dep } from './api';
import logger from './logger';

const debug = logger('modify-pom');

/**
 * Clones the given pom, and modifies its dependencies according to the given Dep[]
 * @param pom 
 * @param deps 
 */
export default function modifyPom(pom: mvn.Pom, deps: Dep[]) {
  debug('cloning pom');
  pom = JSON.parse(JSON.stringify(pom)); // clone
  pom.project.dependencies![0].dependency
    // remove test scope
    .filter((dep) => !dep.scope || dep.scope[0] !== 'test')
    // only keep matching deps
    .filter((dep) => deps.find(({ g, a }) => dep.groupId[0] === g && dep.artifactId[0] === a))
    // update each dep with the new version
    .forEach((dep) => {
      const foundDep = deps.find(({ g, a }) => dep.groupId[0] === g && dep.artifactId[0] === a)!;
      dep.version = [ foundDep.v! ];
    });
  debug('pom modified');
  return pom;
}
