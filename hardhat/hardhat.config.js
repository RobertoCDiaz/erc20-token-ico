require("@nomiclabs/hardhat-waffle");

const ALCHEMY_URL = process.env.ALCHEMY_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: "0.8.4",
  network: {
    url: ALCHEMY_URL,
    accounts: [PRIVATE_KEY],
  }
};
