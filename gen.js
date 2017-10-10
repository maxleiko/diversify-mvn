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
const createClones = require('./lib/create-clones');
const execClone = require('./lib/exec-clone');
const copyClone = require('./lib/copy-clone');
const Promise = require('bluebird');

let PROJECT_PATH;

const program = new commander.Command(pkgJson.name)
  .version(pkgJson.version)
  .arguments('<project-directory>')
  .usage(`${chalk.green('<project-directory>')} [options]`)
  .action((name) => PROJECT_PATH = name)
  .option('-d, --dep-versions <n>', 'How many different version of each dep should be crawled from Maven Central (default: 3)', parseInt, 3)
  .option('-o, --output <path>', 'Output dir of the generated clones (default: gen)', 'gen')
  .option('-c, --cmd <command>', 'The command to execute on each clone (default: mvn test)', 'mvn test')
  .option('    --concurrency <n>', 'How many concurrent executions (default: 4)', parseInt, 4)
  .option('--dry-run', 'Generate clones without executing the command')
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

if (program.showLogs) {
  process.env.SHOW_LOGS = true;
}

console.log(`Cleaning ${chalk.gray(program.output)} directory...`);
fs.emptyDir(program.output)
  .then(() => {
    console.log();
    console.log('Using Maven project at ' + chalk.gray(PROJECT_PATH));
    console.log(`Reading ${chalk.gray('pom.xml')}`);
    return readFiles(PROJECT_PATH)
      .then(({ pom }) => {
        const deps = pom.project.dependencies[0].dependency
          .filter((dep) => !dep.scope || dep.scope[0] !== 'test')
          .map((dep) => ({ g: dep.groupId[0], a: dep.artifactId[0] }));
        console.log(chalk.blue('Dependencies:') + ' ' + deps.length);
        console.log();

        console.log(`Retrieving the ${program.depVersions} latest versions of the dependencies`);
        return mvnDepsVersions(deps, program.depVersions)
          .then((mvnDeps) => {
            return fs.emptyDir(program.output)
              .then(() => mvnDeps);
          })
          .then((mvnDeps) => {
            console.log(chalk.blue('Available diversified dependencies:') + ' ' + mvnDeps.reduce((acc, next) => acc + next.versions.length, 0));
            console.log();

            // pre-process mvnDeps to isolate unique deps from grouped deps
            const depGroups = {};
            let depGroupsLength = 0;
            mvnDeps.forEach((dep) => {
              const key = dep.g.substr(0, 7);
              let grp = depGroups[key];
              if (!grp) {
                grp = [];
                depGroups[key] = grp;
                depGroupsLength++;
              }
              grp.push(dep);
            });

            const possibleClones = program.depVersions * depGroupsLength;
            console.log(`Creating ${chalk.blue(possibleClones)} clone${possibleClones === 1 ? '':'s'} of ${chalk.gray(PROJECT_PATH)}`);
            return createClones(pom, depGroups, PROJECT_PATH, program.output);
          })
          .then((clones) => {
            console.log();

            if (program.dryRun) {
              console.log(`Skipping execution of ${chalk.yellow(program.cmd)} (--dry-run)`);
              return clones.map((clone) => Object.assign({ isValid: true }, clone));
            } else {
              console.log(`Executing ${chalk.yellow(program.cmd)} on each clone (this may take a while)`);
              const invalidDeps = [];
              return Promise.map(
                clones,
                (clone) => copyClone(pom, clone.deps, PROJECT_PATH, clone.path)
                  .then(() => execClone(program.cmd, clone))
                  .then((clone) => {
                    if (clone.isValid) {
                      console.log(` ${chalk.green('✔')} valid configuration ${chalk.blue(clone.path)}`);
                      return Promise.resolve();
                    } else {
                      console.log(` ${chalk.red('✘')} invalid configuration ${chalk.blue(clone.path)}`);
                      invalidDeps.push(clone);
                      return fs.remove(clone.path);
                    }
                  }),
                { concurrency: program.concurrency }
              ).then(() => invalidDeps);
            }
          })
          .then((invalidDeps) => {
            if (invalidDeps.length > 0) {
              const invalidDepsFile = path.join(program.output, 'invalid-deps.json');
              console.log();
              console.log(`Invalid configurations have been written to ${chalk.yellow(invalidDepsFile)}`);
              return fs.writeJson(invalidDepsFile, invalidDeps);
            }
          });
        })
        .catch((err) => {
          throw err;
        });
  });
