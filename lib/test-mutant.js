const fs = require('fs-extra');
const tar = require('tar');
const path = require('path');
const { Writable } = require('stream');
const writePom = require('./write-pom');

function testMutant(docker, config, pom, mutant) {
  // TODO do the real work here instead of this fake long-polling process
  //  - copy app folder
  //  - modify pom.xml with mutant deps
  //  - executes the test commands
  mutant.name = 'mutant-' + mutant.hash.substr(0, 7);
  mutant.dir = path.join(config.outputDir, mutant.hash);
  const mutantTar = `${mutant.dir}.tar`;

  return fs.copy(config.appPath, mutant.dir)
    .then(() => fs.ensureDir(path.join(mutant.dir, '.mutant')))
    .then(() => writePom(pom, mutant.dependencies, mutant.dir))
    .then(() => fs.readdir(mutant.dir))
    .then((files) => tar.c({ cwd: mutant.dir, gzip: false, file: mutantTar }, files))
    .then(() => {
      return new Promise((resolve, reject) => {
        docker.buildImage(mutantTar, { t: mutant.name }, (err, stream) => {
          if (err) {
            reject(err);
          } else {
            stream.pipe(new Writable({
              write(chunk, encoding, callback) {
                // just ignore docker.buildImage output
                // but resolve the process when it's finished
                callback();
              }
            }), { end: true });
            stream.on('end', resolve);
          }
        });
      });
    })
    .then(() => fs.remove(mutantTar))
    .then(() => new Promise((resolve) => setTimeout(resolve, 3500)))
    .then(() => docker.createContainer({
      Image: mutant.name,
      name: mutant.name,
      AttachStdin: false,
      AttachStdout: false,
      AttachStderr: false,
      Tty: false,
    }))
    .then((container) => container.start())
    .then((container) => container.wait())
    .then(({ StatusCode }) => {
      if (StatusCode !== 0) {
        throw new Error(`Mutant ${mutant.hash} process exit (${StatusCode})`);
      }
    });
}

module.exports = testMutant;
