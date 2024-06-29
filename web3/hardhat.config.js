require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
const PRIVATE_KEY = "983833d689e1a9481c585d846a50676cea2825bbbdcd5c0e2f624a13d54c0455";
const RPC_URL = "https://polygon-amoy.drpc.org";
module.exports = {
  defaultNetwork: "polygon_amoy",
  networks: {
    hardhat: {
      chainId: 80002,
    },
    polygon_amoy: {
      url: "https://polygon-amoy.drpc.org",
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
