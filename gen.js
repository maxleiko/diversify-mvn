process.on('unhandledRejection', (err) => {
  throw err;
});

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const commander = require('commander');
const pkgJson = require('./package.json');
const readFiles = require('./lib/read-files');
const mvnDepsVersions = require('./lib/mvn-deps-versions');
const createCopy = require('./lib/create-copy');

let PROJECT_PATH;

const program = new commander.Command(pkgJson.name)
  .version(pkgJson.version)
  .arguments('<project-directory>')
  .usage(`${chalk.green('<project-directory>')} [options]`)
  .action((name) => PROJECT_PATH = name)
  .option('-n, --nb-clones <n>', 'Number of clones generated', parseInt, 10)
  .option('-d, --dep-versions <n>', 'How many different version of each dep should be crawled from Maven Central', parseInt, 3)
  .option('-o, --output <path>', 'Output dir of the generated clones', 'gen')
  .option('--dry-run', 'Generate clones without executing the tests')
  .option('--show-logs', 'Pipe tests std out/err to this process')
  .parse(process.argv);

if (typeof PROJECT_PATH === 'undefined') {
  console.error('Please specify a project directory:');
  console.log(
    `  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`
  );
  console.log();
  console.log('For example:');
  console.log(`  ${chalk.cyan(program.name())} ${chalk.green('my-mvn-project')}`);
  console.log();
  console.log(
    `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
  );
  process.exit(1);
}

if (program.dryRun) {
  process.env.DRY_RUN = true;
}

if (program.showLogs) {
  process.env.SHOW_LOGS = true;
}

const nbClones = [];
for (let i=0; i < program.nbClones; i++) {
  nbClones.push(0);
}

console.log();
console.log('Using Maven project at ' + chalk.gray(PROJECT_PATH));
console.log(`Reading ${chalk.gray('pom.xml')}`);
readFiles(PROJECT_PATH)
  .then(({ pom }) => {
    console.log(chalk.green('Done.'));
    console.log();

    console.log(`Retrieving the ${program.depVersions} latest versions of the dependencies (${chalk.gray('Maven')})`);
    return mvnDepsVersions(pom, program.depVersions)
      .then((mvnDeps) => {
        return fs.emptyDir(program.output)
          .then(() => mvnDeps);
      })
      .then((mvnDeps) => {
        console.log(chalk.blue('Dependencies count:') + ' ' + mvnDeps.length);
        console.log();

        console.log(`Creating ${chalk.blue(program.nbClones)} cop${program.nbClones === 1 ? 'y':'ies'} of ${chalk.gray(PROJECT_PATH)}`);
        return nbClones.map((ignore, i) => {
          const newPom = JSON.parse(JSON.stringify(pom));
          const dest = path.join(program.output, PROJECT_PATH + '-' + i);
          return () => createCopy(newPom, mvnDeps, i + 1, PROJECT_PATH, dest);
        });
      });
    })
    .then((tasks) => {
      return tasks.reduce((prev, next) => {
        return prev.then(next);
      }, Promise.resolve());
    });
