const fs = require('fs-extra');
const path = require('path');
const writePom = require('./write-pom');

function testMutant(docker, config, pom, mutant) {
  // TODO do the real work here instead of this fake long-polling process
  //  - copy app folder
  //  - modify pom.xml with mutant deps
  //  - executes the test commands
  mutant.name = 'mutant-' + mutant.hash.substr(0, 7);
  mutant.dir = path.join(config.outputDir, mutant.hash);
  return fs.copy(config.appPath, mutant.dir)
    .then(() => fs.ensureDir(path.join(mutant.dir, '.mutant')))
    .then(() => writePom(pom, mutant.dependencies, mutant.dir))
    .then(() => docker.buildImage({ context: mutant.dir, src: ['Dockerfile'] }, { t: mutant.name }))
    .then(() => docker.createContainer({ Image: mutant.name, name: mutant.name }))
    .then((container) => container.start());
}

module.exports = testMutant;
