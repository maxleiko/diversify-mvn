process.on('unhandledRejection', (err) => {
  throw err;
});

const path = require('path');
const chalk = require('chalk');
const readFiles = require('./lib/read-files');
const mvnDepsVersions = require('./lib/mvn-deps-versions');
const bowerDepsVersions = require('./lib/bower-deps-versions');
const copy = require('./lib/copy');
const modifyPom = require('./lib/modify-pom');
const modifyBower = require('./lib/modify-bower');
const randomDeps = require('./lib/random-deps');

const JHIPSTER_PATH = process.argv[2];
const NB_COPIES = process.argv[3] || 10;

console.log('Using JHipster app at ' + chalk.gray(JHIPSTER_PATH));
console.log('Reading ' + chalk.gray('pom.xml') + ' and ' + chalk.gray('bower.json'));
readFiles(JHIPSTER_PATH)
  .then(({ pom, bower }) => {
    console.log(chalk.green('Done.') + '\n');
    console.log('Retrieving the 10 latest versions of ' + chalk.gray('Maven') + ' and ' + chalk.gray('Bower') + ' dependencies');
    return mvnDepsVersions(pom)
      .then((mvnDeps) => {
        return bowerDepsVersions(bower)
          .then((bowerDeps) => ({ mvnDeps, bowerDeps }));
      })
      .then(({ mvnDeps, bowerDeps }) => {
        console.log(chalk.blue('Maven deps count:') + ' ' + mvnDeps.length);
        console.log(chalk.blue('Bower deps count:') + ' ' + bowerDeps.length);
        console.log(chalk.green('Done.') + '\n');

        console.log(`Creating ${chalk.blue(NB_COPIES)} copies of ${chalk.gray(JHIPSTER_PATH)}`);
        const tasks = [];
        for (let i=0; i < NB_COPIES; i++) {
          const dest = path.join('gen', JHIPSTER_PATH + '-' + i);

          const randomMvnDeps = randomDeps(mvnDeps);
          const randomBowerDeps = randomDeps(bowerDeps);

          const newPom = modifyPom(pom, randomMvnDeps);
          const newBower = modifyBower(bower, randomBowerDeps);

          tasks.push(copy(newPom, newBower, JHIPSTER_PATH, dest)
            .then(() => {
              console.log(` - ${chalk.cyan(dest)}`);
              console.log(`     ${chalk.gray(randomMvnDeps.length + ' maven deps updated:')}`);
              randomMvnDeps.forEach((mvnDep) => {
                console.log(`       - ${mvnDep.g}:${mvnDep.a}:${chalk.blue(mvnDep.version)}`);
              });
              console.log();
              console.log(`     ${chalk.gray(randomBowerDeps.length + ' bower deps updated:')}`);
              randomBowerDeps.forEach((bowerDep) => {
                console.log(`       - ${bowerDep.name}@${chalk.blue(bowerDep.version)}`);
              });
              console.log();
            }));
        }

        return Promise.all(tasks);
      });
    })
    .then(() => {
      console.log(chalk.green('Bye.'));
    });
