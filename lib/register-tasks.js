const fs = require('fs-extra');
const chalk = require('chalk');

const { size } = require('./already-tested');
const testMutant = require('./test-mutant');
const createMutant = require('./create-mutant');

function registerTask(engines, config, pom, groups) {
  return new Promise((resolve) => {
    function run() {
      const engine = engines.find((engine) => engine.available);
      if (engine) {
        // an engine is available
        //   - check if we have reached the limit
        const mutantsLimit = parseInt(config.mutantsLimit, 10) || Math.pow(Object.keys(groups).length, (config.versionsCount + 1));
        if (size() < mutantsLimit) {
          // we have not reached our limit yet
          const mutant = createMutant(groups);
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
              fs.writeFile(`${mutant.dir}/.mutant/error-logs.txt`, err.stack);
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
        setTimeout(run, 1500);
      }
    }
    run();
  });
}

module.exports = registerTask;
