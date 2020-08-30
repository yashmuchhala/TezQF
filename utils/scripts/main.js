var fs = require("fs");
const conseiljs = require("conseiljs");
const fetch = require("node-fetch");
var log = require("loglevel");

const compileContract = require("./compile");
const deployContract = require("./deploy");
const config = require("../../contractsConfig.json");
const admin = require(`../keystore/${config.keyName}`);

require.extensions[".tz"] = function (module, filename) {
  module.exports = fs.readFileSync(filename, "utf8");
};

async function main() {
  const logger = log.getLogger("conseiljs");
  logger.setLevel(5, false);

  conseiljs.registerLogger(logger);
  conseiljs.registerFetch(fetch);

  // Compile and deploy DAO Contract
  try {
    console.log("Compiling DAO Contract");
    await compileContract(
      "main",
      "DAO",
      `(sp.address('${admin.publicKeyHash}'))`
    );
    console.log("Deploying DAO Contract");
    const daoContract = await deployContract("main", "DAO", "admin");
    const daoContractAddress = daoContract.address;
    console.log("Deployed DAO Contract at:", daoContractAddress);
    // Compile and deploy token and round manager
    console.log("Compiling CrowdSale Contract");
    await compileContract(
      "main",
      "CrowdSale",
      `(sp.address('${admin.publicKeyHash}'), sp.address('${daoContractAddress}'))`
    );
    console.log("Compiling QuadToken Contract");
    await compileContract(
      "main",
      "QuadToken",
      `(sp.address('${daoContractAddress}'))`
    );

    console.log("Compiling RM Contract");
    await compileContract(
      "main",
      "RoundManager",
      `(sp.address('${daoContractAddress}'))`
    );

    console.log("Deploying CrowdSale Contract");
    const crowdSaleContract = await deployContract(
      "main",
      "CrowdSale",
      "admin"
    );
    console.log("Deploying QuadToken Contract");
    const tokenContract = await deployContract("main", "QuadToken", "admin");
    console.log("Deployed QuadToken Contract at:", tokenContract.address);
    console.log("Deploying RM contract");
    const roundManagerContract = await deployContract(
      "main",
      "RoundManager",
      "admin"
    );
    console.log("Deployed QuadToken Contract at:", tokenContract.address);
    console.log("Updating config file");
    // Update the contract addresses
    var configFile = JSON.parse(
      fs.readFileSync("./contractsConfig.json").toString()
    );

    configFile.daoContractAddress = daoContract.address;
    configFile.crowdSaleContractAddress = crowdSaleContract.address;
    configFile.tokenContractAddress = tokenContract.address;
    configFile.roundManagerContractAddress = roundManagerContract.address;
    fs.writeFile(
      "./contractsConfig.json",
      JSON.stringify(configFile, null, 2),
      () => {}
    );
    console.log("Updated config file [COMPLETE]");
  } catch (error) {
    if (!error.response) {
      console.log("Error:", error);
      return;
    }
    const response = JSON.parse(error.response);
    if (response[0].contents) {
      console.log(
        "Error:",
        JSON.parse(error.response)[0].contents[0].metadata.operation_result
      );
      return;
    } else if (error.response[0]) {
      console.log("Error:", response[0]);
      return;
    } else {
      console.log("Error:", error);
      return;
    }
  }

  return;
}

main();
