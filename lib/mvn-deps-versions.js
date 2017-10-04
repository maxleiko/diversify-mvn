const searchMaven = require('./search-maven');

function mvnDepsVersions(pom) {
    return Promise.all(pom.project.dependencies[0].dependency
      .filter((dep) => !dep.scope || dep.scope[0] !== 'test')
      .map((dep) => ({ g: dep.groupId[0], a: dep.artifactId[0] }))
      .map(({ g, a }) => searchMaven(g, a)
        .then((versions) => ({ g, a, versions}))));
}

module.exports = mvnDepsVersions;
