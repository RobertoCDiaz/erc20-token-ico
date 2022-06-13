# ERC-20 Token ICO

A project that launches a brand new cryptocoin using the ERC-20 standard for tokens on the Ethereum Blockchain.

Check it out [in production](https://erc20-token-ico-three.vercel.app/).

## Project requirements.

* There should be a limit on how many token there are available. This must be provided as an argument when deploying the token smart contract.
* Every WNC NFT holder should get 10 tokens for free, having in mind that they would pay for the gas fees. All of this token will not be took into account to the stablished limit of tokens
* The price of one token at the time of ICO must be also provided as an argument to the contract deployment, and should be in terms of $ETH.
* Build a website which users can visit for the ICO.

## Installation

1. Clone repository and cd into it:
```bash
git clone https://github.com/RobertoCDiaz/erc20-token-ico
cd erc20-token-ico
```

2. Get into both the `app` and `hardhat` repositories and install their npm dependencies:
```bash
cd app && npm i && cd ../hardhat && npm i
```

## Smart Contract configuration and deployment
The Solidity Smart contract at [MyToken.sol](hardhat/contracts/MyToken.sol) defines a brand new cryto-token to be launched to the Ethereum blockchain. This token will then have a Initial Coin Offering in which users will have the ability to mint whatever amount of tokens they want for a price. Additionally, those accounts in possesion of NFTs based on [this other repo's ](https://github.com/RobertoCDiaz/nft-collection) contract can claim free tokens for each NFT they own.

Because this dApp has some values defined by the deployer (total initial supply, price per token, etc.) and the ICO contract depends on other contract instances, there are some values that we will need to configure before actually deploying the contract.

Go into the `hardhat` directory. Once there, do as following steps indicate. 

1. Create an Alchemy node in the Rinkeby network
    * Sign up to the [Alchemy](https://www.alchemyapi.io) service and create a new app using the Rinkeby network

2. Configure environment variables
    * Create a `.env` as a copy of the `.env-template` file and replace the values of the following variables.
    * **NFT_CONTRACT_ADDRESS** is the address of the NFT Contract created at [this repo](https://github.com/RobertoCDiaz/nft-collection).
    * **PRIVATE_KEY** is the private key for your account on the Rinkeby Network. You can use Metamask for this.
    * **ALCHEMY_URL** is the URL with the API Key that Alchemy provides on the dashboard for your new app (the one created on the previous step).
```bash
NFT_CONTRACT_ADDRESS=
ALCHEMY_URL=
PRIVATE_KEY=
```

3. Run the `deploy` npm command to compile and deploy the smart contract

```bash
cd hardhat
npm run deploy
```

## Web dApp server start

To start a development server to preview the application on your localhost, go to the `app` directory and run the following command:

```bash
npm run dev
```

This will run a development server for the Next.js app.
