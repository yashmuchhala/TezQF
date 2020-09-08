var fs = require("fs");
const compileContract = require("./compile");
const deployContract = require("./deploy");
const setupContracts = require("./setupContracts");
const config = require("../../contractsConfig.json");
const admin = require(`../keystore/${config.keyName}`);

async function main() {
  try {
    //Retrieve token contract address
    const tokenAddress = config.tokenContractAddress;

    //Compile DAO
    console.log("Compiling DAO Contract");
    await compileContract(
      "main",
      "DAO",
      `(sp.address('${admin.publicKeyHash}'), sp.address('${tokenAddress}'))`
    );

    //Deploy DAO
    console.log("Deploying DAO Contract");
    const daoContract = await deployContract("main", "DAO", "admin");
    console.log("Deployed DAO Contract at:", daoContract.address);

    //Compile RM
    console.log("Compiling RM Contract");
    await compileContract(
      "main",
      "RoundManager",
      `(sp.address('${daoContract.address}'))`
    );

    //Deploy RM
    console.log("Deploying RM contract");
    const roundManagerContract = await deployContract(
      "main",
      "RoundManager",
      "admin"
    );
    console.log("Deployed RM Contract at:", roundManagerContract.address);

    //Update Config
    console.log("Updating config file");

    var configFile = JSON.parse(
      fs.readFileSync("./contractsConfig.json").toString()
    );

    configFile.daoContractAddress = daoContract.address;
    configFile.roundManagerContractAddress = roundManagerContract.address;

    fs.writeFile(
      "./contractsConfig.json",
      JSON.stringify(configFile, null, 2),
      () => {}
    );

    console.log("Updated config file");
    console.log("Setting contract addresses in dependant contracts");

    await setupContracts(daoContract.address, roundManagerContract.address);

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
