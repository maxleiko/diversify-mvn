const mvnDepsVersions = require('./mvn-deps-versions');

function createGroups(deps, versionsCount) {
  return mvnDepsVersions(deps, versionsCount)
    .then((mvnDeps) => {
      // pre-process mvnDeps to isolate deps in "groups"
      const groups = {};
      mvnDeps
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

module.exports = createGroups;
