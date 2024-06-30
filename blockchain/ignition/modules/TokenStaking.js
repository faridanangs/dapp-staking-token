const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DeployTokenStaking", (m) => {

  const contracts = ["TokenStaking", "Buchains"]

  contracts.map((name) => {
    const lock = m.contract(name, []);
    return { lock };
  })

});
