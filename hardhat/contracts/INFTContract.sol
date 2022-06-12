// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
    An interface to interact with the NFT Contract that I developed at https://github.com/RobertoCDiaz/nft-collection.

    By using the `tokenOfOwnerByIndex()` and `balanceOf()` functions, we are able to get the tokens
    owned by an address.
 */
interface INFTContract {
    /**
        Returns the ID of the token located in the `index` position of the tokens list owned by the user
        with address `owner`.
     */
    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256 tokenId);

    /**
        Returns the number of tokens in the `owner` account.
     */
    function balanceOf(address owner) external view returns (uint256 balance);
}