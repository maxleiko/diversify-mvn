const fs = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
const random = require('./random');
const exec = require('./exec');
const modifyPom = require('./modify-pom');

/**
 * Creates a copy of the given JHIPSTER_PATH app
 * It will modify "nbChanges" dependencies version and try to compile and run
 * If it does not work, it will try with another dep until no more deps are available
 * which will result in a failure. Otherwise, the app will be generated in "dest" directory
 *
 * @param  {object}  pom           [description]
 * @param  {array}   deps          [description]
 * @param  {number}  nbChanges     [description]
 * @param  {string}  JHIPSTER_PATH [description]
 * @param  {string}  dest          [description]
 * @return {Promise}               [description]
 */
function createCopy(pom, deps, nbChanges, JHIPSTER_PATH, dest) {
  console.log(` - ${chalk.cyan(dest)}`);
  return recursiveCreateCopy(pom, deps, nbChanges, JHIPSTER_PATH, dest, {})
    .then((modifiedDeps) => {
      const validDepsFiles = path.join(dest, 'valid-deps.json');
      return fs.writeFile(validDepsFiles, JSON.stringify(modifiedDeps, null, 2), 'utf8');
    }, (err) => {
      console.log(`  -> ${chalk.red('something went wrong')}`);
      console.log(err.stack);
      throw new Error(`Unable to generate a valid diversified clone of ${chalk.cyan(dest)}`);
    });
}

function recursiveCreateCopy(pom, deps, nbChanges, JHIPSTER_PATH, dest, alreadyTried) {
  return Promise.resolve()
    .then(() => {
      const modifiedDeps = getModifiedDeps(deps, nbChanges, alreadyTried);

      fs.copySync(JHIPSTER_PATH, dest);
      console.log(`    ${chalk.gray(`${nbChanges}`)} dependenc${nbChanges === 1 ? 'y':'ies'} changed`);
      modifiedDeps.forEach((dep) => {
        console.log(`      ${chalk.gray(dep.g)}:${chalk.gray(dep.a)}:${chalk.blue(dep.v)}`);
      });
      modifyPom(pom, modifiedDeps, dest);

      if (process.env.DRY_RUN) {
        console.log();
        return Promise.resolve(modifiedDeps);
      } else {
        const cmd = './mvnw test';
        console.log(`    ${chalk.gray('spawn:')} ${chalk.yellow(cmd)}`);
        return exec(cmd, dest)
          .then(({ code, signal }) => {
            const processResult = signal ? signal : `Exit ${code}`;
            console.log(`        ${chalk.green('✔')} valid configuration (${processResult})`);
            console.log();
            return modifiedDeps;
          }, () => {
            console.log(`        ${chalk.red('✘')} invalid configuration`);
            console.log();
            // if it does not work => change deps version
            return recursiveCreateCopy(pom, deps, nbChanges, JHIPSTER_PATH, dest, alreadyTried);
          });
      }
    });
}

function getModifiedDeps(deps, count, alreadyTried) {
  const modifiedDeps = [];

  for (let i=0; i < count; i++) {
    let dep = deps[random(deps.length-1)];
    while (isAlreadyModified(dep, modifiedDeps) || isAlreadyTried(dep, alreadyTried)) {
      dep = deps[random(deps.length-1)];
    }
    alreadyTried[getKey(dep)] = true;
    modifiedDeps.push(dep);
  }

  return modifiedDeps;
}

function isAlreadyModified(dep, modifiedDeps) {
  return modifiedDeps.find((modDep) => modDep.g === dep.g && modDep.a === dep.a);
}

function isAlreadyTried(dep, alreadyTried) {
  return alreadyTried[getKey(dep)];
}

function getKey(dep) {
  return `${dep.g}:${dep.a}:${dep.v}`;
}
//
// function execApp(pom, dest) {
//   const mvnPkgCmd = './mvnw package -DskipTests';
//   const javaJarCmd = `java -jar target/${pom.project.artifactId[0]}-${pom.project.version[0]}.war`;
//
//   return exec(mvnPkgCmd, dest)
//     .then(() => {
//       console.log(`    ${chalk.green('✔')} ${chalk.yellow(mvnPkgCmd)} in ${chalk.cyan(dest)}`);
//       return exec(javaJarCmd, dest, 20000) // close server after 20s and consider its ok
//         .then(() => {
//           console.log(`    ${chalk.green('✔')} ${chalk.yellow(javaJarCmd)} in ${chalk.cyan(dest)}`);
//         }, () => {
//           console.log(`    ${chalk.red('✘')} ${chalk.yellow(javaJarCmd)} in ${chalk.cyan(dest)}`);
//         });
//     }, () => {
//       console.log(`    ${chalk.red('✘')} ${chalk.yellow(mvnPkgCmd)} in ${chalk.cyan(dest)}`);
//     });
// }

module.exports = createCopy;
