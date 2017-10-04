process.on('unhandledRejection', (err) => {
  throw err;
});

const path = require('path');
const chalk = require('chalk');
const readFiles = require('./lib/read-files');
const searchMaven = require('./lib/search-maven');
const searchNpm = require('./lib/search-npm');
const copy = require('./lib/copy');
const Promise = require('bluebird');

const JHIPSTER_PATH = process.argv[2];

readFiles(JHIPSTER_PATH)
  .then(({ pom, bower }) => {
    return searchMaven(pom.project.parent[0].groupId[0], pom.project.parent[0].artifactId[0])
      .then((springVersions) => {
        return searchNpm('angular')
          .then((angularVersions) => ({ springVersions, angularVersions }));
      })
      .then(({ springVersions, angularVersions }) => {
        return springVersions.map((springVersion, i) => {
          const newPom = JSON.parse(JSON.stringify(pom));
          const newBower = JSON.parse(JSON.stringify(bower));
          // update pom parent
          newPom.project.parent[0].version[0] = springVersion;
          // update bower angular dependencies
          const angularVersion = angularVersions[i];
          Object.keys(newBower.dependencies)
            .filter((name) => name.startsWith('angular'))
            .forEach((name) => {
              newBower.dependencies[name] = angularVersion;
            });
          return () => copy(newPom, newBower, JHIPSTER_PATH, path.join('gen', JHIPSTER_PATH + '-' + i));
        });
      })
      .then((tasks) => {
        return tasks.reduce((prev, next) => {
          return prev.then(() => next());
        }, Promise.resolve());
      })
      .then(() => {
        console.log(chalk.green('Done.'));
      });
  });
