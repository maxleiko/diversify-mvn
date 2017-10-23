const { spawn } = require('child_process');
const exec = require('./exec');

function execClone(clone) {
  return new Promise((resolve) => {
    function execCurl() {
      exec('curl', ['http://localhost:8080'], clone.path).then(
        () => Object.assign({ isValid: true  }, clone),
        () => Object.assign({ isValid: false }, clone)
      ).then((result) => {
        if (runProcess) {
          runProcess.kill();
        }
        resolve(result);
      });
    }

    const timeoutId = setTimeout(execCurl, parseInt(process.env.TIMEOUT || 60000, 10));
    const runProcess = spawn('mvn', ['spring-boot:run'], { cwd: clone.path });

    runProcess.stdout.on('data', (data) => {
      const logLine = (data + '').trim();
      if (logLine.endsWith(`----------------------------------------------------------
	Application 'jhipsterSampleApplication' is running! Access URLs:
	Local: 		http://localhost:8080
	External: 	http://127.0.1.1:8080
	Profile(s): 	[swagger, dev]
----------------------------------------------------------`)) {
        clearTimeout(timeoutId);
        execCurl();
      }
    });

    runProcess.on('exit', (code) => {
      if (code !== 0) {
        clearTimeout(timeoutId);
        resolve(Object.assign({ isValid: false }, clone));
      }
    });
  });
}

module.exports = execClone;
