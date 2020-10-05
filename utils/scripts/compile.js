const exec = require("child_process").exec;
const config = require("../../contractsConfig.json");

async function compileContract(filename, className, params) {
  return new Promise((resolve, reject) => {
    const filePath = config.location + filename + ".py";
    const buildDirectory =
      config.buildDirectory + filename + "/" + className + "/";
    const classAndParams = `"${className + params}"`;

    exec(
      `./utils/smartpy-cli/SmartPy.sh compile ./${filePath} ${classAndParams} ./${buildDirectory}`,
      function (error, stdout, stderr) {
        console.log("stdout: " + stdout);
        console.log("stderr: " + stderr);
        resolve();
        if (error !== null) {
          console.log("exec error: " + error);
          reject(error);
        }
      }
    );
  });
}
// (async () => {
//   const params = `(sp.address('${admin.publicKeyHash}'))`;
//   await compileContract("main", "DAO", params);
// })();
module.exports = compileContract;
