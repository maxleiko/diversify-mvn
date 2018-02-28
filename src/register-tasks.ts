import * as fs from 'fs-extra';
import chalk from 'chalk';

import { mvn, Groups } from './api';
import DefaultConfig from './default-config';
import DockerEngine from './docker-engine';
import { size } from './already-tested';
import testMutant from './test-mutant';
import createMutant from './create-mutant';
import { isNumber } from 'util';
import logger from './logger';

const debug = logger('register-task');

export default function registerTask(engines: DockerEngine[], config: DefaultConfig, pom: mvn.Pom, groups: Groups) {
  return new Promise((resolve) => {
    function run() {
      const engine = engines.find((engine) => engine.available);
      if (engine) {
        // an engine is available
        //   - check if we have reached the limit
        debug(`available Docker engine: ${engine}`);
        if (size() < config.mutantsLimit!) {
          // we have not reached our limit yet
          const mutant = createMutant(config, groups);
          engine.available = false;
          testMutant(engine.docker, config, pom, mutant)
            .then(() => {
              console.log(` ${chalk.green('✔')} ${mutant.name}`);
              mutant.valid = true;
              fs.writeJson(`${mutant.dir}/.mutant/results.json`, mutant, { spaces: 2 });
            }, (err) => {
              console.log(` ${chalk.red('✘')} ${mutant.name}`);
              mutant.valid = false;
              fs.writeJson(`${mutant.dir}/.mutant/results.json`, mutant, { spaces: 2 });
              fs.writeFile(`${mutant.dir}/.mutant/error.log`, JSON.stringify(err, null, 2));
            })
            .then(() => {
              engine.available = true;
            });
          // keep on running
          run();
        } else {
          resolve();
        }
      } else {
        // no available container: wait a bit
        const timeout = isNumber(config.taskTimeout) ? config.taskTimeout : 1500;
        debug(`no Docker engine available yet, waiting ${timeout}ms`);
        setTimeout(run, timeout);
      }
    }
    run();
  });
}
