var fs = require("fs");
const compileContract = require("./compile");
const deployContract = require("./deploy");
const setupContracts = require("./setupContracts");
const config = require("../../contractsConfig.json");
const admin = require(`../keystore/${config.keyName}`);

async function main() {
  try {
    const DEBUG = true;
    // Compile token Contract
    console.log("Compiling QuadToken Contract");
    await compileContract(
      "main",
      "QuadToken",
      `(sp.address('${admin.publicKeyHash}'), ${DEBUG ? "True" : "False"})`
    );
    // Deploy token Contract
    console.log("Deploying token Contract");
    const tokenContract = await deployContract("main", "QuadToken", "admin");
    console.log("Deployed token Contract at:", tokenContract.address);

    // Compile DAO
    console.log("Compiling DAO Contract");
    await compileContract(
      "main",
      "DAO",
      `(sp.address('${admin.publicKeyHash}'), sp.address('${
        tokenContract.address
      }'), ${DEBUG ? "True" : "False"})`
    );

    // Deploy DAO
    console.log("Deploying DAO Contract");
    const daoContract = await deployContract("main", "DAO", "admin");
    console.log("Deployed DAO Contract at:", daoContract.address);

    // Compile CrowdSale Contract
    console.log("Compiling CrowdSale contract");
    await compileContract(
      "main",
      "CrowdSale",
      `(sp.address('${admin.publicKeyHash}'), sp.address('${
        tokenContract.address
      }'), 1000000, 30, sp.address('${admin.publicKeyHash}'), ${
        DEBUG ? "True" : "False"
      } )`
    );
    // Deploy crowdSale Contract
    console.log("Deploying crowdSale Contract");
    const crowdSaleContract = await deployContract(
      "main",
      "CrowdSale",
      "admin"
    );
    console.log("Deployed crowdSale contract at:", crowdSaleContract.address);

    // Compile RM
    console.log("Compiling RM Contract");
    await compileContract(
      "main",
      "RoundManager",
      `(sp.address('${daoContract.address}'), ${DEBUG ? "True" : "False"})`
    );

    // Deploy RM
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
    configFile.tokenContract = crowdSaleContract.address;
    configFile.crowdSaleContract = crowdSaleContract.address;
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

    console.log("Updating env variables for React App");
    const envVariableFileData =
      `REACT_APP_ADMIN_PKH=${admin.publicKeyHash}\n` +
      `REACT_APP_DAO_CONTRACT_ADDRESS=${daoContract.address}\n` +
      `REACT_APP_TOKEN_CONTRACT_ADDRESS=${tokenContract.address}\n` +
      `REACT_APP_CROWDSALE_CONTRACT_ADDRESS=${crowdSaleContract.address}\n` +
      `REACT_APP_ROUND_MANAGER_CONTRACT_ADDRESS=${roundManagerContract.address}`;
    fs.writeFile("./.env", envVariableFileData, function (err) {
      if (err) throw err;
      console.log("Saved all contract addresses to env variables");
    });

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
