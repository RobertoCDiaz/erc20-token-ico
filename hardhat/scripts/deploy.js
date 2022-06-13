const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });

const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;

async function main() {
    const contract = await (await ethers.getContractFactory("MyToken")).deploy(
        // price per token
        ethers.utils.parseEther("0.001"),
        // token amount limit
        10_000,
        // nft contract address
        NFT_CONTRACT_ADDRESS,
    );

    console.log("Token Contract Address: ", contract.address);
}

main()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    })