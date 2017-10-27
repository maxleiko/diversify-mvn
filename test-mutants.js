const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const Promise = require('bluebird');
const Docker = require('dockerode');

const readPom = require('./lib/read-pom');
const createGroups = require('./lib/create-groups');
const registerTasks = require('./lib/register-tasks');

function handleError(err) {
  console.log(chalk.red('Error:') + ' ' + err.message);
  if (process.env.DEBUG) {
    console.log(err.stack.split('\n').slice(1).join('\n'));
  }
  process.exit(1);
}

process.on('unhandledRejection', handleError);

let config;

Promise.resolve()
  .then(() => {
    if (typeof process.argv[2] !== 'string') {
      throw new Error('You need to specify the path to a config.json in argument');
    }

    const CONFIG_PATH = path.resolve(process.cwd(), process.argv[2]);
    config = require(CONFIG_PATH);
    if (!config.outputDir) {
      config.outputDir = 'mutants-results';
    }
  })
  .then(() => fs.emptyDir(path.resolve(process.cwd(), config.outputDir)))
  // .then(() => fs.ensureDir(path.resolve(process.cwd(), config.outputDir)))
  .then(() => readPom(config.appPath))
  .then((pom) => {
    // get rid of test dependencies
    const deps = pom.project.dependencies[0].dependency
      .filter((dep) => !dep.scope || dep.scope[0] !== 'test')
      .map((dep) => ({ g: dep.groupId[0], a: dep.artifactId[0] }));
    return { pom, deps };
  })
  .then(({ pom, deps }) => createGroups(deps, config.versionsCount)
    .then((groups) => {
      console.log(`${chalk.blue('Dependencies:')}   ${deps.length}`);
      console.log(`${chalk.blue('Groups:')}         ${Object.keys(groups).length}`);
      console.log(`${chalk.blue('Artifacts:')}      ${Object.keys(groups).reduce((acc, key) => acc + groups[key].artifacts.length, 0)}`);
      console.log(`${chalk.blue('Versions:')}       ${Object.keys(groups).reduce((acc, key) => acc + groups[key].artifacts.length * groups[key].versions.length, 0)}`);
      console.log(`${chalk.blue('Mutants limit:')}  ${parseInt(config.mutantsLimit, 10) || Object.keys(groups).length + '^' + (config.versionsCount + 1)}`);
      console.log();
      return { pom, groups };
    }))
  .then(({ pom, groups }) => {
    const engines = config.engines.map((engineOptions) => {
      return { docker: new Docker(Object.assign({ Promise }, engineOptions)), available: true };
    });
    return registerTasks(engines, config, pom, groups);
  })
  .then(() => {
    console.log();
    console.log(`You can find the results in the ${chalk.green(config.outputDir)} directory`);
  })
  .catch(handleError);
