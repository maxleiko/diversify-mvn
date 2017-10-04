## diversify-jhipster
This script will change the given JHipster app **pom.xml** and **bower.json** file using the last 10 versions of respectively **spring-boot-starter-parent** and all **angular**-related dependencies.

The generated *diversified* projects will be copied in `gen/`

### Usage
> You need Node.js 7+ in order to use this script

First, install the needed dependencies of the script:
```sh
npm i
```

Then, add a JHipster app next to `gen.js`:
```sh
git clone git@github.com:jhipster/jhipster-sample-app.git
```

Finally, start the script with the path to the JHipster app as param:
```sh
node gen.js jhipster-sample-app
```

Expected output:
```
╭leiko@kevtop2 ~/dev/diversify-jhipster
╰➤ node gen.js jhipster-sample-app
Created: gen/jhipster-sample-app-0 with Spring 1.4.5.RELEASE and Angular 1.6.0-rc.2
Created: gen/jhipster-sample-app-1 with Spring 1.4.6.RELEASE and Angular 1.6.0
Created: gen/jhipster-sample-app-2 with Spring 1.4.7.RELEASE and Angular 1.5.10
Created: gen/jhipster-sample-app-3 with Spring 1.5.1.RELEASE and Angular 1.6.1
Created: gen/jhipster-sample-app-4 with Spring 1.5.2.RELEASE and Angular 1.5.11
Created: gen/jhipster-sample-app-5 with Spring 1.5.3.RELEASE and Angular 1.6.2
Created: gen/jhipster-sample-app-6 with Spring 1.5.4.RELEASE and Angular 1.6.3
Created: gen/jhipster-sample-app-7 with Spring 1.5.5.RELEASE and Angular 1.6.4
Created: gen/jhipster-sample-app-8 with Spring 1.5.6.RELEASE and Angular 1.6.5
Created: gen/jhipster-sample-app-9 with Spring 1.5.7.RELEASE and Angular 1.6.6
Done.
```

### TODOs:  
 - [ ] Smartify the SemVer handling (for now it's just the 10 last)
 - [ ] Add more diversification (not only Spring boot parent & Angular, but all deps)
 - [ ] Buy a bike
