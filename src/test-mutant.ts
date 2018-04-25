import * as fs from 'fs-extra';
import * as tar from 'tar';
import * as path from 'path';
import * as Docker from 'dockerode';
import { Writable } from 'stream';
import chalk from 'chalk';


import { Mutant, mvn } from './api';
import logger from './logger';
import DefaultConfig from './default-config';

import modifyPom from './modify-pom';
import writePom from './write-pom';

const debug = logger('test-mutant');

/**
 * Copy appPath content to a mutant directory
 * Modifies the pom.xml with the mutated dependencies
 * Creates a Docker image using the app Dockerfile
 * Starts a container using that image and wait for it to finish
 * Success if exit(0) fails otherwise
 * @param docker 
 * @param config 
 * @param pom 
 * @param mutant 
 */
export default function testMutant(docker: Docker, config: DefaultConfig, pom: mvn.Pom, mutant: Mutant) {
  return fs.copy(config.appPath, mutant.dir)
    .then(() => fs.ensureDir(path.join(mutant.dir, '.mutant')))
    .then(() => modifyPom(pom, mutant.dependencies))
    .then((pom) => writePom(pom, path.join(mutant.dir, config.pomPath)))
    .then(() => buildImage(docker, mutant))
    .then(() => removeContainer(docker, mutant, config))
    .then(() => {
      const options = Object.assign({
        Image: mutant.name,
        name: mutant.name,
        AttachStdin: false,
        AttachStdout: false,
        AttachStderr: false,
        Tty: false,
      }, config.containerOptions);
      debug('creating container');
      debug({ image: mutant.name, name: mutant.name, ...config.containerOptions });
      return docker.createContainer(options);
    })
    .then((container) => container.start())
    .then((container) => {
      return container.wait()
        .then((resp: any) => {
          if (resp.StatusCode !== 0) {
            return container.remove()
              .then(() => removeImage(docker, mutant))
              .then(() => { throw resp; });
          }
        });
    });
}

function buildImage(docker: Docker, mutant: Mutant) {
  function imgFoundHandler() {
    debug('skipping image build', mutant.name, '(already exists)');
  }

  function imgNotFoundHandler() {
    debug(`building image ${mutant.name}`);
    const mutantTar = `${mutant.dir}.tar`;

    return fs.readdir(mutant.dir)
    .then((files) => tar.c({ cwd: mutant.dir, gzip: false, file: mutantTar }, files))
    .then(() => {
      return new Promise((resolve, reject) => {
        // TODO put 'nocache' as config options
        docker.buildImage(mutantTar, { t: mutant.name, nocache: true }, (err, stream) => {
          if (err) {
            reject(err);
          } else {
            stream!.pipe(new Writable({
              write(chunk, encoding, callback) {
                // just ignore docker.buildImage output
                // but resolve the process when it's finished
                callback();
              }
            }), { end: true });
            stream!.on('end', resolve);
          }
        });
      });
    })
    .then(() => fs.remove(mutantTar))
    .then(() => new Promise((resolve) => setTimeout(resolve, 3500)));
  }

  return docker.getImage(mutant.name)
    .inspect()
    .then(imgFoundHandler, imgNotFoundHandler);
}

function removeContainer(docker: Docker, mutant: Mutant, config: DefaultConfig) { 
  return Promise.resolve()
    .then(() => {
      if (config.overwriteContainer) {
        const container = docker.getContainer(mutant.name);
        debug(`removing container ${mutant.name} ${chalk.gray('(overwriteContainer: true)')}`);
        return container.remove()
          .then(() => null, (ignore) => null); // ignore error if container does not exists
      }
      return null;
    });
}

function removeImage(docker: Docker, mutant: Mutant) {
  return docker.getImage(mutant.name)
    .remove()
    .then(() => null, () => null);
}
