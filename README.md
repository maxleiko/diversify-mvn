## diversify-mvn
Creates mutants of a given Maven project by modifying the dependencies versions.  
Then build a Docker image using the Dockerfile of the project (should be available at the root of the project) and tries to run it.  
If the output of the `docker run mutant-image` is Exit 0 => Success, otherwise it's a failure.

### Installation
```sh
git clone git@github.com:maxleiko/diversify-mvn.git
cd diversify-mvn
npm install
npm run build
npm link
```

### Usage
```sh
diversify-mvn config.json
```

### Config
```ts
export interface Config {
  appPath: string;
  versionsCount: number;
  engines: Dockerode.DockerOptions[];

  pomPath?: string; // ''
  outputDir?: string; // '.results'
  blacklist?: string[]; // []
  mutantsLimit?: number; // computed
  containerOptions?: Dockerode.ContainerCreateOptions; // {}
  taskTimeout?: number; // 1500
  overwriteContainer?: boolean; // false
}
```
> `Dockerode.DockerOptions` and `Dockerode.ContainerCreateOptions` come from [dockerode](https://github.com/apocas/dockerode)

Example:
```json
{
  "appPath": "java-websocket",
  "versionsCount": 2,
  "engines": [
    { "socketPath": "/var/run/docker.sock" },
    { "host": "10.0.0.1", "port": 2375 },
    { "host": "10.0.0.2", "port": 2375 },
    { "host": "10.0.0.3", "port": 2375 }
  ]
}
```

### Blacklist dependencies
Sometimes you do not want some dependencies to be diversified, for that we've introduced "blacklist".  
Blacklist is an array of strings:
```json
{
  "blacklist": [
    "groupId:artifactId",
    "allThatGroupId"
  ]
}
```
In this example, the dependency `groupId:artifactId` will not be changed by the program, and all the dependencies that have `allThatGroupId` as groupId will also not be changed.

### Debug
```sh
DEBUG=diversify-mvn:* diversify-mvn config.json
```

### Operating System diversification with Polyverse.io
If you want to go further into the diversification of your mutants, you can add [Polyverse.io](https://polyverse.io) to your Docker images. This will replace all the currently installed packages (only Ubuntu, CentOS and Alpine supported) with diversified ones.

To add this layer of diversification, add those lines to your Dockerfile:
### Ubuntu
```
...
RUN curl https://repo.polyverse.io/install.sh | sh -s czcw7pjshny8lzzog8bgiizfr
RUN apt-get update && apt-get -y --allow-change-held-packages install --reinstall $(dpkg --get-selections | awk '{print $1}')
...
```
### Alpine
```
...
RUN curl https://repo.polyverse.io/install.sh | sh -s czcw7pjshny8lzzog8bgiizfr
RUN sed -n -i '/repo.polyverse.io/p' /etc/apk/repositories && apk upgrade --update-cache --available
...
```
### CentOS
```
...
RUN curl https://repo.polyverse.io/install.sh | sh -s czcw7pjshny8lzzog8bgiizfr
RUN yum reinstall -y \*
...
```
