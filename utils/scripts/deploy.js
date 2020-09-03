var fs = require("fs");
const { Tezos } = require("@taquito/taquito");
const config = require("../../contractsConfig.json");
const { InMemorySigner } = require("@taquito/signer");

require.extensions[".tz"] = function (module, filename) {
  module.exports = fs.readFileSync(filename, "utf8");
};

async function deployContract(filename, className, keyName) {
  const keystore = require(`../keystore/${keyName}`);
  Tezos.setProvider({ rpc: config.deployConfig.node });
  Tezos.setProvider({ signer: new InMemorySigner(keystore.privateKey, "tif") });
  const contractCode = require(`../../${
    config.buildDirectory + filename + "/" + className
  }/${filename}_compiled.json`);
  const contractInitialStorage = require(`../../${
    config.buildDirectory + filename + "/" + className
  }/${filename}_storage_init.tz`);
  var completedContractAddress,
    isDeployed = false;
  await Tezos.contract
    .originate({
      code: contractCode,
      init: contractInitialStorage,
    })
    .then((originationOp) => {
      // console.log(
      //   `Waiting for confirmation of origination for ${originationOp.contractAddress}...`
      // );
      completedContractAddress = originationOp.contractAddress;
      return originationOp.contract();
    })
    .then((contract) => {
      // console.log(`Origination completed.`);
      isDeployed = true;
    })
    .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`));
  return {
    address: completedContractAddress,
    success: isDeployed,
  };
}

// (async () => {

//   // Compile and deploy demo Contract and get it's address
//   const contract = await deployContract("main", "DAO", "admin");
//   console.log("Address", contract.address);
// })();

module.exports = deployContract;
