import * as Dockerode from 'dockerode';

export interface Config {
  appPath: string;
  versionsCount: number;
  engines: Dockerode.DockerOptions[];

  pomPath?: string;
  outputDir?: string;
  blacklist?: string[];
  mutantsLimit?: number;
  containerOptions?: Dockerode.ContainerCreateOptions;
  taskTimeout?: number;
  overwriteContainer?: boolean;
}

export interface Mutant {
  hash: string;
  name: string;
  dir: string;
  dependencies: Dep[];
  valid: boolean;
}

export interface Dep {
  g: string;
  a: string;
  v?: string;
}

export interface Groups {
  [s: string]: {
    artifacts: string[],
    versions: string[],
  };
}

export namespace mvn {
  export interface Pom {
    project: Project;
  }
    
  export interface Project {
    groupId: string[];
    artifactId: string[];
    version: string[];
    packaging: string[];
    dependencies?: Dependencies[];
    dependencyManagement?: DependencyManagement[];
  }

  export interface DependencyManagement {
    dependencies: Dependencies[];
  }

  export interface Dependencies {
    dependency: Dependency[];
  }

  export interface Dependency {
    groupId: string[];
    artifactId: string[];
    version: string[];
    scope?: string;
  }

  // TODO add what you need
}