const fs = require('fs-extra');
const tar = require('tar');
const path = require('path');
const { Writable } = require('stream');
const writePom = require('./write-pom');

/**
 * Copy appPath content to a mutant directory
 * Modifies the pom.xml with the mutated dependencies
 * Creates a Docker image using the app Dockerfile
 * Starts a container using that image and wait for it to finish
 * Success if exit(0) fails otherwise
 * @param {*} docker 
 * @param {*} config 
 * @param {*} pom 
 * @param {*} mutant 
 */
function testMutant(docker, config, pom, mutant) {
  mutant.name = 'mutant-' + mutant.hash.substr(0, 7);
  mutant.dir = path.join(config.outputDir, mutant.hash);
  const mutantTar = `${mutant.dir}.tar`;

  return fs.copy(config.appPath, mutant.dir)
    .then(() => fs.ensureDir(path.join(mutant.dir, '.mutant')))
    .then(() => writePom(pom, path.join(mutant.dir, config.pomPath), mutant.dependencies))
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
    .then(() => {
      const options = Object.assign({
        Image: mutant.name,
        name: mutant.name,
        AttachStdin: false,
        AttachStdout: false,
        AttachStderr: false,
        Tty: false,
      }, config.containerOptions || {});
      if (process.env.DEBUG) {
        console.log(`Creating container ${mutant.name} using options:`);
        console.log(options);
      }
      return docker.createContainer(options);
    })
    .then((container) => container.start())
    .then((container) => container.wait())
    .then(({ StatusCode }) => {
      if (StatusCode !== 0) {
        throw new Error(`Mutant ${mutant.hash} process exit (${StatusCode})`);
      }
    });
    // TODO remove images & containers that failed
}

module.exports = testMutant;
