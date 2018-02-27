import { Config, Groups } from './api';
import { isNumber, isBoolean } from 'util';
import * as Dockerode from 'dockerode';

export default class DefaultConfig implements Config {
  appPath: string;
  versionsCount: number;
  engines: Dockerode.DockerOptions[];

  pomPath: string;
  outputDir: string;
  blacklist: string[];
  containerOptions: Dockerode.ContainerCreateOptions;
  taskTimeout: number;
  overwriteContainer: boolean;

  mutantsLimit?: number;

  constructor(config: Config) {
    this.appPath = config.appPath;
    this.versionsCount = config.versionsCount;
    this.engines = config.engines;

    this.pomPath = config.pomPath || ''; // defaults to "appPath"
    this.outputDir = config.outputDir || './results';
    this.blacklist = config.blacklist || [];
    this.containerOptions = config.containerOptions || {};
    this.mutantsLimit = config.mutantsLimit;
    this.taskTimeout = isNumber(config.taskTimeout) ? config.taskTimeout : 1500;
    this.overwriteContainer = isBoolean(config.overwriteContainer) ? config.overwriteContainer : false;
  }

  updateMutantsLimit(groups: Groups) {
    this.mutantsLimit = isNumber(this.mutantsLimit) ? this.mutantsLimit : Math.pow(Object.keys(groups).length, (this.versionsCount + 1));
  }
}