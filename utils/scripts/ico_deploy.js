const fs = require("fs");
const compile = require("./compile");
const deploy = require("./deploy");
const config = require("../../contractsConfig.json");
const admin = require(`../keystore/${config.keyName}`);

async function main() {
  try {
    //Compile crowdsale
    console.log("Compiling CrowdSale Contract");
    await compile(
      "main",
      "CrowdSale",
      `(sp.address('${admin.publicKeyHash}'), 1000000, sp.address('${admin.publicKeyHash}'), 3000)`
    );

    //Deploy crowdsale
    console.log("Deploying CrowdSale Contract");
    const crowdSaleContract = await deploy("main", "CrowdSale", "admin");
    console.log("Deployed CrowdSale Contract at:", crowdSaleContract.address);

    //Compile Token
    console.log("Compiling QuadToken Contract");
    await compile(
      "main",
      "QuadToken",
      `(sp.address('${crowdSaleContract.address}'))`
    );

    //Deploy Token
    console.log("Deploying QuadToken Contract");
    const tokenContract = await deploy("main", "QuadToken", "admin");
    console.log("Deployed QuadToken Contract at:", tokenContract.address);

    config.crowdSaleContract = crowdSaleContract.address;
    config.tokenContract = tokenContract.address;

    console.log("\n--ICO Contracts Deployed--");

    //Update Config
    var configFile = JSON.parse(
      fs.readFileSync("./contractsConfig.json").toString()
    );

    configFile.crowdSaleContractAddress = crowdSaleContract.address;
    configFile.tokenContractAddress = tokenContract.address;

    fs.writeFile(
      "./contractsConfig.json",
      JSON.stringify(configFile, null, 2),
      () => {}
    );

    console.log("\n--Config Updated--");
  } catch (err) {
    console.log("Error: ", err);
  }
}

main();
