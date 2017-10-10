## diversify-mvn
This script will create clones of the given Maven project, by changing the dependencies versions using a range of the latest available versions based on [Maven Central](http://search.maven.org).

The generated *diversified* projects will be copied in `gen/`  
The complete result of the diversification will be dumped in `gen/result.json`

### Usage
> You need Node.js 7+ in order to use this script

First, install the needed dependencies of the script:
```sh
npm i
```

Then, add a Maven project next to `gen.js`:
```sh
git clone git@github.com:jhipster/jhipster-sample-app.git
```

Finally, start the script with the path to the Maven project as param:
```sh
node gen.js jhipster-sample-app
```
