const config = require("../../contractsConfig.json");
const { Tezos } = require("@taquito/taquito");
const { InMemorySigner } = require("@taquito/signer");

async function setupContracts(
  daoContractAddress,
  tokenContractAddress,
  crowdSaleContractAddress,
  roundManagerContractAddress
) {
  const keystore = require(`../keystore/${config.keyName}`);
  Tezos.setProvider({ rpc: config.deployConfig.node });
  Tezos.setProvider({
    signer: new InMemorySigner(keystore.privateKey, keystore.seed),
  });
  const daoContract = await Tezos.contract.at(daoContractAddress);
  const crowdSaleContract = await Tezos.contract.at(crowdSaleContractAddress);

  const crowdSaleContractSetTokenOp = await crowdSaleContract.methods
    .setTokenContract(tokenContractAddress)
    .send();
  await crowdSaleContractSetTokenOp.confirmation();
  console.log(
    "CrowdSale Contract Set Token Contract DONE",
    crowdSaleContractSetTokenOp.hash
  );

  const daoContractSetRoundManagerOp = await daoContract.methods
    .setRoundManagerContract(roundManagerContractAddress)
    .send();
  await daoContractSetRoundManagerOp.confirmation();
  console.log(
    "Dao Contract Set RM Contract DONE",
    daoContractSetRoundManagerOp.hash
  );
}

// (async () => {
//   await setupContracts();
// })();

module.exports = setupContracts;
