export interface Config {
  appPath: string;
  versionsCount: number;
  engines: { [s: string]: string }[];

  pomPath?: string;
  outputDir?: string;
  blacklist?: string[];
  mutantsLimit?: number;
  containerOptions?: { [s: string]: string[] | string | boolean | number }
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
    dependencies?: Dependencies[];
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