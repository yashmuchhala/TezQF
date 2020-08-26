// var fs = require("fs");
const conseiljs = require("conseiljs");
const { SoftSigner } = require("conseiljs-softsigner");
// const fetch = require("node-fetch");
// var log = require("loglevel");
const config = require("../../contractsConfig.json");

// require.extensions[".tz"] = function (module, filename) {
//   module.exports = fs.readFileSync(filename, "utf8");
// };

// const logger = log.getLogger("conseiljs");
// logger.setLevel("debug", false);

async function deployContract(filename, className, keyName) {
  const tezosNode = config.interactionConfig.node;
  const keystore = require(`../keystore/${keyName}`);
  const signer = await SoftSigner.createSigner(
    conseiljs.TezosMessageUtils.writeKeyWithHint(keystore.privateKey, "edsk")
  );
  const amount = config.deployConfig.amount;
  const contractCode = require(`../../${
    config.buildDirectory + filename + "/" + className
  }/${filename}_compiled.tz`);
  const contractStorage = require(`../../${
    config.buildDirectory + filename + "/" + className
  }/${filename}_storage_init.tz`);
  const delegateAddress =
    config.deployConfig.delegateAddress.length != 0
      ? config.deployConfig.delegateAddress
      : undefined;
  const fee = config.deployConfig.fee;
  const storageLimit = config.deployConfig.storageLimit;
  const gasLimit = config.deployConfig.gasLimit;

  const result = await conseiljs.TezosNodeWriter.sendContractOriginationOperation(
    tezosNode,
    signer,
    keystore,
    amount,
    delegateAddress,
    fee,
    storageLimit,
    gasLimit,
    contractCode,
    contractStorage,
    conseiljs.TezosParameterFormat.Michelson
  );

  return {
    address:
      result.results.contents[0].metadata.operation_result
        .originated_contracts[0],
    operationGroupID: result.operationGroupID,
  };
}

// (async () => {
//   conseiljs.registerLogger(logger);
//   conseiljs.registerFetch(fetch);

//   // Compile and deploy demo Contract and get it's address
//   const contract = await deployContract("demo", "MyContract", "admin");
//   console.log("Address", contract.address);
// })();

module.exports = deployContract;
