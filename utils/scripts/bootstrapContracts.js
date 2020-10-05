const config = require("../../contractsConfig.json");
const { Tezos } = require("@taquito/taquito");
const { InMemorySigner } = require("@taquito/signer");

async function bootstrapContracts() {
  const admin = require("../keystore/admin");
  const alice = require("../keystore/alice");
  const bob = require("../keystore/bob");
  const charlie = require("../keystore/charlie");
  const john = require("../keystore/john");
  const mike = require("../keystore/mike");
  const trudy = require("../keystore/trudy");

  Tezos.setProvider({ rpc: config.deployConfig.node });

  const daoContract = await Tezos.contract.at(config.daoContractAddress);
  const crowdSaleContract = await Tezos.contract.at(
    config.crowdSaleContractAddress
  );
  const tokenContract = await Tezos.contract.at(config.tokenContractAddress);
  const RoundManagerContract = await Tezos.contract.at(
    config.roundManagerContractAddress
  );

  // Crowdsale test
  Tezos.setProvider({
    signer: new InMemorySigner(alice.privateKey, alice.seed),
  });
  try {
    const op1 = await crowdSaleContract.methods
      .buyTokens(10)
      .send({ amount: 10, mutez: false });
    await op1.confirmation();
  } catch (error) {
    console.log(error);
  }

  Tezos.setProvider({
    signer: new InMemorySigner(bob.privateKey, bob.seed),
  });

  const op2 = await crowdSaleContract.methods
    .buyTokens(10)
    .send({ amount: 10, mutez: false });
  await op2.confirmation();
  try {
    Tezos.setProvider({
      signer: new InMemorySigner(alice.privateKey, john.seed),
    });

    const op3 = await crowdSaleContract.methods
      .buyTokens(100)
      .send({ amount: 100000000, mutez: true });
    await op3.confirmation();
  } catch (error) {
    console.log(error);
  }

  const tokenStorage = await tokenContract.storage();
  console.log("Token balances:", tokenStorage.balances);

  Tezos.setProvider({
    signer: new InMemorySigner(alice.privateKey, alice.seed),
  });
  const startTime = new Date("September 30, 2020 01:00:00");
  const endTime = new Date("October 30, 2020 00:00:00");
  const expiry = new Date("September 10, 2020 00:00:00");

  const op4 = await daoContract.methods.proposeNewRound(
    "Premier Round of TezQF",
    startTime.getTime(),
    endTime.getTime(),
    expiry.getTime()
  );
  await op4.confirmation();
}

(async () => {
  try {
    bootstrapContracts();
  } catch (error) {
    console.log(error);
  }
})();
