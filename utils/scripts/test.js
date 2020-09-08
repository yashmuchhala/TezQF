const exec = require("child_process").exec;
const config = require("../../contractsConfig.json");

function testContract(filename) {
  const filePath = config.location + filename + ".py";
  exec(
    `./utils/smartpy-cli/SmartPy.sh test ./${filePath} ./${config.testBuildDirectory}`,
    function (error, stdout, stderr) {
      console.log("stdout: " + stdout);
      if (error !== null) {
        console.log("exec error: " + error);
      }
      if (stderr !== "") {
        console.log("stderr: " + stderr);
      }

      if (process.argv.includes("--verbose")) {
        exec(
          `cat ./${config.testBuildDirectory}/scenario_interpreted/scenario-interpreter-log.txt`,
          function (errorChild, stdoutChild, stderrChild) {
            console.log("stdoutChild: " + stdoutChild);
            if (errorChild !== null) {
              console.log("exec errorChild: " + errorChild);
            }

            if (stderrChild !== "") {
              console.log("stderrChild: " + stderrChild);
            }
          }
        );
      }
    }
  );
}

testContract("main");
