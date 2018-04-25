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
    repositories?: Repositories[];
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

  export interface Repositories {
    repository: Repository[];
  }

  export interface Repository {
    id: string[];
    layout: string[];
    name: string[];
    url: string[];
  }

  // TODO add what you need
  export interface MetaData {
    metadata: {
      groupId: string[];
      artifactId: string[];
      versioning: Versioning[];
    };
  }

  export interface Versioning {
    latest: string[];
    release: string[];
    lastUpdated: number[];
    versions: Versions[];
  }

  export interface Versions {
    version: string[];
  }
}