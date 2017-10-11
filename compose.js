const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const commander = require('commander');
const Promise = require('bluebird');
const pkgJson = require('./package.json');
const random = require('./lib/random');
const readFiles = require('./lib/read-files');
const copyClone = require('./lib/copy-clone');
const execClone = require('./lib/exec-clone');
const updateResult = require('./lib/update-result');

process.on('unhandledRejection', (err) => {
  console.log();
  console.log(chalk.red('Whoops...'));
  console.log(err.stack);
  process.exit(1);
});

function hash({ g, a, v }) {
  return `${g.substr(0, 7)}:${a}:${v}`;
}

function contains(variant, grpHash) {
  return variant.deps.find((grp) => hash(grp) === grpHash);
}

function uniqueGrp(result, variant) {
  let randomGrp, randomGrpHash;
  do {
    randomGrp = result[random(0, result.length - 1)];
    randomGrpHash = hash(randomGrp.deps[0]);
  } while (contains(variant, randomGrpHash));
  return randomGrp;
}

let PROJECT_PATH, RESULT_PATH, COUNT;

const program = new commander.Command('diversify-compose')
  .version(pkgJson.version)
  .arguments('<project-directory> <result-file> <n>')
  .usage(`${chalk.green('<project-directory>')} <result-file> <n>`)
  .action((project, result, count) => {
    PROJECT_PATH = project;
    RESULT_PATH = result;
    COUNT = count;
  })
  .parse(process.argv);

if (typeof RESULT_PATH === 'undefined' && typeof COUNT === 'undefined') {
  console.error('Please specify a result file and a number of variants:');
  console.log(`  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')} <n>`);
  console.log();
  console.log('For example:');
  console.log(`  ${chalk.cyan(program.name())} ${chalk.green('gen/result.json')} 10`);
  console.log();
  console.log(`Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`);
}

fs.emptyDir('gen')
  .then(() => fs.readJson(RESULT_PATH))
  .then((result) => result.filter((clone) => clone.isValid))
  .then((result) => {
    const variants = [];
    // create COUNT valid variants
    for (let i = 0; i < COUNT; i++) {
      const variant = {
        nbChangedGrp: random(1, result.length),
        deps: []
      };
      // random number of group to change
      for (let n = 0; n < variant.nbChangedGrp; n++) {
        // random valid group
        const randomGrp = uniqueGrp(result, variant);
        variant.deps = [...variant.deps, ...randomGrp.deps];
      }
      variants.push(variant);
    }
    return variants;
  })
  .then((variants) => {
    return readFiles(PROJECT_PATH)
      .then(({ pom }) => ({ variants, pom }));
  })
  .then(({ variants, pom }) => {
    console.log(`Executing ${chalk.yellow('mvn test')} on each clone (this may take a while)`);
    return Promise.map(
      variants,
      (variant, i) => {
        variant.path = path.join('gen', PROJECT_PATH + '-' + i);
        return copyClone(pom, variant.deps, PROJECT_PATH, variant.path)
          .then(() => execClone('mvn test', variant))
          .then((variant) => updateResult(path.join('gen', 'result.json'), variant))
          .then((variant) => {
            if (variant.isValid) {
              console.log(` ${chalk.green('✔')} valid configuration ${chalk.blue(variant.path)}`);
            } else {
              console.log(` ${chalk.red('✘')} invalid configuration ${chalk.blue(variant.path)}`);
            }
            return fs.remove(variant.path);
          });
        },
        { concurrency: 1 });
  })
  .then(() => {
    console.log();
    console.log(chalk.green('Done :)'));
  });
