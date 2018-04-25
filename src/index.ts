#!/usr/bin/env node
import * as path from 'path';
import chalk from 'chalk';

import { Config, Dep, mvn } from './api';
import readPom from './read-pom';
import DockerEngine from './docker-engine';
import createGroups from './create-groups';
import registerTasks from './register-tasks';
import DefaultConfig from './default-config';
import logger from './logger';
import cleanOutputDir from './clean-output-dir';

const debug = logger('index');

function handleError(err: any) {
  console.error(chalk.red('Error:') + ' ' + err.message);
  debug(err.stack.split('\n').slice(1).join('\n'));
  process.exit(1);
}

process.on('unhandledRejection', handleError);

let config: DefaultConfig;

Promise.resolve()
  .then(() => {
    if (typeof process.argv[2] !== 'string') {
      throw new Error(`Please specify the configuration file:\n  ${chalk.cyan('diversify-mvn')} ${chalk.green('</path/to/config.json>')}`);
    }

    const CONFIG_PATH = path.resolve(process.cwd(), process.argv[2]);
    const c: Config = require(CONFIG_PATH);
    config = new DefaultConfig(c);
  })
  .then(() => cleanOutputDir(config.outputDir))
  .then(() => readPom(path.join(config.appPath, config.pomPath)))
  .then((pom) => {
    let mvnDeps: mvn.Dependency[] = [];

    if (pom.project.dependencyManagement && pom.project.dependencyManagement.length > 0) {
      mvnDeps = mvnDeps.concat(pom.project.dependencyManagement[0].dependencies[0].dependency || []);
    }
    if (pom.project.dependencies && pom.project.dependencies.length > 0) {
      mvnDeps = mvnDeps.concat(pom.project.dependencies[0].dependency || []);
    }

    if (mvnDeps.length > 0) {
      // get rid of test dependencies
      const deps: Dep[] = mvnDeps
        .filter((dep) => !dep.scope || dep.scope[0] !== 'test')
        .filter((dep) => !config.blacklist!.find((s) => `${dep.groupId[0]}:${dep.artifactId[0]}`.startsWith(s)))
        .map((dep) => ({ g: dep.groupId[0], a: dep.artifactId[0] }));
      return { pom, deps };
    }
    const { groupId, artifactId, version } = pom.project;
    const art = `${chalk.cyan(groupId[0])}:${chalk.cyan(artifactId[0])}:${chalk.cyan(version[0])}`;
    throw new Error(`No dependencies found in ${art}`);
  })
  .then(({ pom, deps }) => {
    let repos: string[] = ['https://repo1.maven.org/maven2/']; // defaults to Maven Central
    if (pom.project.repositories) {
      repos = repos.concat(pom.project.repositories[0].repository.map((repo) => repo.url[0]));
    }
    return createGroups(repos, deps, config.versionsCount)
      .then((groups) => {
        config.updateMutantsLimit(groups);
        console.log(`${chalk.blue('Dependencies:')}   ${deps.length}`);
        console.log(`${chalk.blue('Groups:')}         ${Object.keys(groups).length}`);
        console.log(`${chalk.blue('Artifacts:')}      ${Object.keys(groups).reduce((acc, key) => acc + groups[key].artifacts.length, 0)}`);
        console.log(`${chalk.blue('Versions:')}       ${Object.keys(groups).reduce((acc, key) => acc + groups[key].artifacts.length * groups[key].versions.length, 0)}`);
        console.log(`${chalk.blue('Mutants limit:')}  ${config.hrMutantsLimit}`);
        console.log();
        return { pom, groups };
      });
  })
  .then(({ pom, groups }) => {
    const engines = config.engines.map((dockerOpts) => new DockerEngine(dockerOpts));
    return registerTasks(engines, config, pom, groups);
  })
  .then(() => {
    console.log();
    console.log(`You can find the results in the ${chalk.green(config.outputDir!)} directory`);
  });
