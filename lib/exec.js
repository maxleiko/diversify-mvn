const { spawn } = require('child_process');

function exec(cmd, appPath, timeout = -1) {
  return new Promise((resolve, reject) => {
    const cmds = cmd.split(' ');
    const options = { cwd: appPath, stdio: 'ignore' };
    if (process.env.SHOW_LOGS) {
      options.stdio = 'inherit';
    }

    const cmdProcess = spawn(cmds.splice(0, 1)[0], cmds, options);

    let timeoutId;
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        cmdProcess.kill('SIGINT');
      }, timeout);
    }

    cmdProcess.on('exit', (code, signal) => {
      if (signal) {
        if (signal === 'SIGKILL') {
          clearTimeout(timeoutId);
          reject(new Error(`Exec "${cmd}" in "${appPath}" stopped (SIGKILL)`));
        } else if (signal === 'SIGTERM') {
          clearTimeout(timeoutId);
          reject(new Error(`Exec "${cmd}" in "${appPath}" stopped (SIGTERM)`));
        } else if (signal === 'SIGINT') {
          clearTimeout(timeoutId);
          resolve({ code, signal });
        }
      }
      if (code === 1) {
        clearTimeout(timeoutId);
        reject(new Error(`Unable to exec "${cmd}" in "${appPath}" (exit 1)`));
      } else {
        clearTimeout(timeoutId);
        resolve({ code, signal });
      }
    });
  });
}

module.exports = exec;
