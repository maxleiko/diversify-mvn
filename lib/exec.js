const { spawn } = require('child_process');

function exec(cmd, args, appPath) {
  const promise = new Promise((resolve, reject) => {
    const options = { cwd: appPath, stdio: 'ignore' };
    if (process.env.SHOW_LOGS) {
      options.stdio = 'inherit';
    }

    const fullCmd = `${cmd} ${args.join(' ')}`;
    const cmdProcess = spawn(cmd, args, options);

    cmdProcess.on('exit', (code, signal) => {
      if (signal) {
        if (signal === 'SIGKILL') {
          reject(new Error(`Exec "${fullCmd}" in "${appPath}" stopped (SIGKILL)`));
        } else if (signal === 'SIGTERM') {
          reject(new Error(`Exec "${fullCmd}" in "${appPath}" stopped (SIGTERM)`));
        } else if (signal === 'SIGINT') {
          resolve({ code, signal });
        }
      }
      if (code === 0) {
        resolve({ code, signal });
      } else {
        reject(new Error(`Unable to exec "${fullCmd}" in "${appPath}" (exit ${code})`));
      }
    });
  });

  return promise;
}

module.exports = exec;
