const searchMaven = require('./search-maven');

function mvnDepsVersions(pom, nbVersions) {
    return Promise.all(pom.project.dependencies[0].dependency
      .filter((dep) => !dep.scope || dep.scope[0] !== 'test')
      .map((dep) => ({ g: dep.groupId[0], a: dep.artifactId[0] }))
      .map(({ g, a }) => searchMaven(g, a, nbVersions)
        .then((versions) => ({ g, a, versions: versions.sort() })))
      ).then((deps) => {
        return deps.reduce((deps, { g, a, versions }) => {
          versions.forEach((v) => deps.push({ g, a, v }));
          return deps;
        }, []);
      });
}

module.exports = mvnDepsVersions;
