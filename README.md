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

Once you have generated all the clones you get a `gen/result.json` file.  
This file can be used afterwards with `compose.js` in order to create variants of your app using multiple group of dependencies:

> :warning: Move the first `gen/result.json` to another directory as all the scripts will delete `gen/` when started  

Then use the `compose.js` script:
```sh
mv gen/result.json jhipster-sample-app.json
node compose.js jhipster-sample-app jhipster-sample-app.json 10
```

This will create another file at `gen/compose-result.json`
