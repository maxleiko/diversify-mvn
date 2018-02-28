import * as Docker from 'dockerode';
import * as Promise from 'bluebird';

/**
 * Dockerode wrapper
 */
export default class DockerEngine {

  docker: Docker;
  available = true;
  opts: Docker.DockerOptions;

  constructor(opts: Docker.DockerOptions) {
    this.opts = Object.assign({ Promise }, opts);
    this.docker = new Docker(this.opts);
  }

  toString() {
    if (this.opts.socketPath) {
      return this.opts.socketPath;
    }
    if (this.opts.host) {
      return `${this.opts.host}:${this.opts.port}`;
    }
    return '<no socketPath nor host:port specified>';
  }
}