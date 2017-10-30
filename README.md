## diversify-mvn
Creates mutants of a given Maven project by modifying the dependencies versions.  
Then build a Docker image using the Dockerfile of the project (should be available at the root of the project) and tries to run it.  
If the output of the `docker run mutant-image` is Exit 0 => Success, otherwise it's a failure.

### Installation
```sh
npm i -g diversify-mvn
```

### Usage
```sh
diversify-mvn config.json
```

### Config
```json
{
  "appPath": <string>,
  "versionsCount": <number>,
  "mutantsLimit": <optional number>,
  "outputDir": <optional string>,
  "engines": [
    <object (dockerode options)>
  ]
}
```

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
