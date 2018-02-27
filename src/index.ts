#!/usr/bin/env node
import 'bluebird';
import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';

import { Config } from './api';
import readPom from './read-pom';
import DockerEngine from './docker-engine';
import createGroups from './create-groups';
import registerTasks from './register-tasks';
import DefaultConfig from './default-config';


function handleError(err: any) {
  console.log(chalk.red('Error:') + ' ' + err.message);
  if (process.env.DEBUG) {
    console.log(err.stack.split('\n').slice(1).join('\n'));
  }
  process.exit(1);
}

process.on('unhandledRejection', handleError);

let config: DefaultConfig;

Promise.resolve()
  .then(() => {
    if (typeof process.argv[2] !== 'string') {
      throw new Error('You need to specify the path to a config.json in argument');
    }

    const CONFIG_PATH = path.resolve(process.cwd(), process.argv[2]);
    const c: Config = require(CONFIG_PATH);
    config = new DefaultConfig(c);
  })
  .then(() => fs.emptyDir(path.resolve(process.cwd(), config.outputDir)))
  // .then(() => fs.ensureDir(path.resolve(process.cwd(), config.outputDir)))
  .then(() => readPom(path.join(config.appPath, config.pomPath)))
  .then((pom) => {
    if (pom.project.dependencies && pom.project.dependencies.length > 0) {
      // get rid of test dependencies
      const deps = pom.project.dependencies[0].dependency
        .filter((dep) => !dep.scope || dep.scope[0] !== 'test')
        .filter((dep) => !config.blacklist!.find((s) => `${dep.groupId[0]}:${dep.artifactId[0]}`.startsWith(s)))
        .map((dep) => ({ g: dep.groupId[0], a: dep.artifactId[0] }));
      return { pom, deps };
    }
    const { groupId, artifactId, version } = pom.project;
    throw new Error(`No dependencies found in "${groupId[0]}:${artifactId[0]}:${version[0]}"`);
  })
  .then(({ pom, deps }) => createGroups(deps, config.versionsCount)
    .then((groups) => {
      config.updateMutantsLimit(groups);
      console.log(`${chalk.blue('Dependencies:')}   ${deps.length}`);
      console.log(`${chalk.blue('Groups:')}         ${Object.keys(groups).length}`);
      console.log(`${chalk.blue('Artifacts:')}      ${Object.keys(groups).reduce((acc, key) => acc + groups[key].artifacts.length, 0)}`);
      console.log(`${chalk.blue('Versions:')}       ${Object.keys(groups).reduce((acc, key) => acc + groups[key].artifacts.length * groups[key].versions.length, 0)}`);
      console.log(`${chalk.blue('Mutants limit:')}  ${config.mutantsLimit}`);
      console.log();
      return { pom, groups };
    }))
  .then(({ pom, groups }) => {
    const engines = config.engines.map((dockerOpts) => new DockerEngine(dockerOpts));
    return registerTasks(engines, config, pom, groups);
  })
  .then(() => {
    console.log();
    console.log(`You can find the results in the ${chalk.green(config.outputDir!)} directory`);
  })
  .catch(handleError);
