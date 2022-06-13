// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./INFTContract.sol";

contract MyToken is ERC20, Ownable {
    // price for one token at the moment of the ICO
    uint256 public _price;

    // limit of tokens available
    uint256 public _tokenLimit;

    // keeps track of how many tokens have been minted
    uint256 public tokenCount;

    // number of tokens given to NFT holders for each NFT.
    uint256 public tokensPerNFT = 10;

    // instance of the NFT contract
    INFTContract _nftContract;

    // keeps track of which NFTs have been claimed
    mapping (uint256 => bool) claimedNFTs;

    /**
        Initializes the token contract.
     */
    constructor(uint256 icoTokenPrice, uint256 tokenLimit, address nftContractAddress) ERC20("MTI", "My Token ICO") {
        // set values provided on deployment
        _price = icoTokenPrice;
        _tokenLimit = tokenLimit * (10 ** 18);

        // get the actual NFT contract and associate to our interface
        _nftContract = INFTContract(nftContractAddress);
    }

    /**
        Mint `amount` tokens for the user.

        Before finishing the transaction, this will make sure that the correct price is paid and the requested amount of tokens do not exceed
        currently available tokens.
     */
    function mint(uint256 amount) public payable {
        uint256 _priceToPay = amount * _price;

        require(msg.value >= _priceToPay, "Ether sent is incorrect.");
        require(tokenCount + (amount * (10 ** 18)) <= _tokenLimit, "Your requested amount of tokens will surpass the currently available tokens. Please, try to mint a lower amount.");

        _mint(msg.sender, amount * (10 ** 18));
        tokenCount += amount * (10 ** 18);
    }

    /**
        Mints for the sender all the tokens they deserve for owning NFTs.
     */
    function claim() public {
        // gets how many NFTs the user owns
        uint256 _nftCount = _nftContract.balanceOf(msg.sender);

        // if user don't own any NFTs, revert transaction
        require(_nftCount > 0, "You don't own any WNC NFTs.");

        // this will keep track of how many NFTs the user have not used yet to claim tokens
        uint256 unclaimedNFTs;

        // checks for unclaimed NFTs.
        for (uint256 i = 0; i < _nftCount; ++i) {
            uint256 currentNFTId = _nftContract.tokenOfOwnerByIndex(msg.sender, i);
            if (!claimedNFTs[currentNFTId]) {
                claimedNFTs[currentNFTId] = true;
                unclaimedNFTs++;
            } 
        }

        // if unclaimed nfts is equal to 0, cut the transaction off.
        require(unclaimedNFTs > 0, "You have claimed all of your NFTs");

        // mint all the corresponding tokens for all the nfts the user owns.
        _mint(msg.sender, unclaimedNFTs * tokensPerNFT * (10 ** 18));
    }

    /**
        Returns the amount of NFTs the user owns.
     */
    function ownedNFTs() public view returns(uint256) {
        return _nftContract.balanceOf(msg.sender);
    }

    /**
        Sends to the owner account all the collected
        Ether.
     */
    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;

        (bool sent, ) = _owner.call{ value: amount }("");
        require(sent, "Failed to withdraw Ether");
    }

    // function to receive Ether. msg.data must be empty.
    receive() external payable {}

    // fallback function is called when msg.data is not empty
    fallback() external payable {}
}