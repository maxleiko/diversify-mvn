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

  if (pom.project.dependencyManagement && pom.project.dependencyManagement.length > 0) {
    update(pom.project.dependencyManagement[0].dependencies[0].dependency, deps);
  }
  if (pom.project.dependencies && pom.project.dependencies.length > 0) {
    update(pom.project.dependencies[0].dependency, deps);
  }

  debug('pom modified');
  return pom;
}

function update(dependencies: mvn.Dependency[], deps: Dep[]) {
  dependencies
    // remove test scope
    .filter((dep) => !dep.scope || dep.scope[0] !== 'test')
    // only keep matching deps
    .filter((dep) => deps.find(({ g, a }) => dep.groupId[0] === g && dep.artifactId[0] === a))
    // update each dep with the new version
    .forEach((dep) => {
      const foundDep = deps.find(({ g, a }) => dep.groupId[0] === g && dep.artifactId[0] === a)!;
      dep.version = [ foundDep.v! ];
    });
}
