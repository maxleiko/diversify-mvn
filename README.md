## diversify-mvn
This script will try to create "valid" clones (as in: the tests passes) of the given Maven project, by randomly changing the dependencies versions.

The generated *diversified* projects will be copied in `gen/`

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
