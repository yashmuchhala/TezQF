var fs = require("fs");
const compileContract = require("./compile");
const deployContract = require("./deploy");
const config = require("../../contractsConfig.json");
const setupContracts = require("./setupContracts");
const admin = require(`../keystore/${config.keyName}`);

require.extensions[".tz"] = function (module, filename) {
  module.exports = fs.readFileSync(filename, "utf8");
};

async function main() {
  // Compile and deploy DAO Contract
  try {
    console.log("Compiling CrowdSale Contract");
    await compileContract(
      "main",
      "CrowdSale",
      `(sp.address('${admin.publicKeyHash}'), 1000000, sp.address('${admin.publicKeyHash}'), 3000)`
    );

    // CrowdSale deployment
    console.log("Deploying CrowdSale Contract");
    const crowdSaleContract = await deployContract(
      "main",
      "CrowdSale",
      "admin"
    );
    console.log("Deployed CrowdSale Contract at:", crowdSaleContract.address);

    console.log("Compiling QuadToken Contract");
    await compileContract(
      "main",
      "QuadToken",
      `(sp.address('${crowdSaleContract.address}'))`
    );
    // QuadToken deployment
    console.log("Deploying QuadToken Contract");
    const tokenContract = await deployContract("main", "QuadToken", "admin");
    console.log("Deployed QuadToken Contract at:", tokenContract.address);

    console.log("Compiling DAO Contract");
    await compileContract(
      "main",
      "DAO",
      `(sp.address('${admin.publicKeyHash}'), sp.address('${tokenContract.address}'))`
    );
    console.log("Deploying DAO Contract");
    const daoContract = await deployContract("main", "DAO", "admin");
    const daoContractAddress = daoContract.address;
    console.log("Deployed DAO Contract at:", daoContractAddress);

    console.log("Compiling RM Contract");
    await compileContract(
      "main",
      "RoundManager",
      `(sp.address('${daoContractAddress}'))`
    );

    // RM deployment
    console.log("Deploying RM contract");
    const roundManagerContract = await deployContract(
      "main",
      "RoundManager",
      "admin"
    );
    console.log("Deployed RM Contract at:", roundManagerContract.address);

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
    console.log("Updated config file");
    console.log("Setting contract addresses in dependant contracts");
    await setupContracts(
      daoContract.address,
      tokenContract.address,
      crowdSaleContract.address,
      roundManagerContract.address
    );
    console.log("COMPLETE");
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
