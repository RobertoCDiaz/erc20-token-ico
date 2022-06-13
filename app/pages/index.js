import Head from 'next/head'
import styles from '../styles/Home.module.css'

import Web3Modal from "web3modal";
import { Contract, providers, utils, BigNumber } from "ethers";
import { useEffect, useRef, useState } from 'react';

import { ICO_CONTRACT_ADDRESS, ICO_CONTRACT_ABI } from '../constants';

export default function Home() {
  // keeps track of whether there is currently a transaction being mined
  const [isLoading, setIsLoading] = useState(false);
  // is a wallet connected (e.g. metamask)
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  // how many tokens the user owns
  const [ownedTokens, setOwnedTokens] = useState(0);
  // how many tokens have been minted overall
  const [mintedTokens, setMintedTokens] = useState(0);
  // stores the limit of tokens available
  const [tokenLimit, setTokenLimit] = useState(0);
  // whether the user owns NFTS or not
  const [owsnNFTs, setOwnsNFTs] = useState(false);
  // address of the connected account
  const [userAddress, setUserAddress] = useState(null);
  // whether the user is the owner of the contract of not
  const [isOwner, setIsOwner] = useState(false);

  // Web3Modal reference.
  const web3modal = useRef();

  /**
   * A helper function that truncates an address to match the `0x000...0000` format.
   * 
   * This was made to save space and not show a whole address.
   * 
   * E.g.:
   * 
   *  address = 0xe7b1B5602D27fDD41c8fE06e9Fa121a21F0DaD97
   * 
   *  truncateAddress(address) = "0xe7b...aD97"
   * 
   * @param {strign} address - Address to be truncated.
   * @returns Truncated address.
   */
  const truncateAddress = (address) => {
    return address.substring(0, 5) + "..." + address.substring(address.length - 4);
  }

  /**
   * Returns a provider or a signer to operate on the Rinkeby Testnet.
   * 
   * @param {boolean} shouldBeSigner - Whether the return element should be a signer or not.
   * @returns Provider or signer, as needed.
   */
  const getProviderOrSigner = async (shouldBeSigner = false) => {
    const provider = await web3modal.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    if ((await web3Provider.getNetwork()).chainId !== 4) {
      alert("This app works on the rinkeby network");
      throw new Error("Current network is not rinkeby");
    }

    return shouldBeSigner ?
      web3Provider.getSigner():
      web3Provider;
  }

  /**
   * Updates some of the state variables of the dApp.
   * To be more network-efficient, there are some variables that can only be updated once (at start),
   * that's why you can tell the function if it's the first time that you want to update the state of the
   * dApp.
   * 
   * Variables to always be updated are:
   *  - mintedTokens
   *  - ownedTokens
   * 
   * If `firstTime` argument is true, this variables will also be set:
   *  - tokenLimit
   *  - ownsNFTs
   * 
   * @param {boolean} firstTime - Set to true if its the first time you update the state variables.
   */
  const updateStateVariables = async (firstTime = false) => {
    try {
      const signer = await getProviderOrSigner(true);

      const contract = new Contract(
        ICO_CONTRACT_ADDRESS, 
        ICO_CONTRACT_ABI, 
        signer
      );

      setMintedTokens(utils.formatEther(await contract.tokenCount()));
      setOwnedTokens(utils.formatEther(await contract.balanceOf(signer.getAddress())));

      const address = await signer.getAddress();
      setUserAddress(address)

      // checks if user is owner or not
      const owner = await contract.owner();
      if (owner.toLowerCase() == address.toLowerCase()) {
        setIsOwner(true);
      }

      if (!firstTime)
        return;

      setTokenLimit(utils.formatEther(await contract._tokenLimit()));
      setOwnsNFTs(
        (await contract.ownedNFTs()).gt(0)
      );
    } catch(err) {
      console.error(err);
    }
  }

  /**
   * Mint a certain amount of tokens.
   * 
   * @param {int} amount - Amount of tokens to mint for the user.
   */
  const mint = async (amount) => {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(
        ICO_CONTRACT_ADDRESS, 
        ICO_CONTRACT_ABI, 
        signer
      );

      // gets the actual price of a token (in terms of wei) as as BigNumber
      const pricePerToken = await contract._price();

      // because `pricePerToken` is a BigNumber, we can't operate with it as if it was a Number,
      // so to compute the total price to pay, we have to multiply using the`BigNumber.mul()` function
      // the resulting value will be another BigNumber, the total amount of wei we have to pay
      const priceToPay = pricePerToken.mul(amount);

      // `priceToPay` is already in terms of wei, so we don't need to use `utils.parseEther()` to convert
      // an Ether magnitude to wei
      const tx = await contract.mint(amount, { value: priceToPay });

      // wait for the transaction to be mined
      setIsLoading(true);
      await tx.wait();
      setIsLoading(false);

      alert(`Succesfully minted ${amount} tokens!`);
      await updateStateVariables();
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * If a users owns NFTs, tries to mint a certain amount of tokens for
   * each NFT that has not been claimed yet.
   */
  const claimTokensForNFTs = async () => {
    try {
      if (!owsnNFTs) {
        alert("You don't own any NFTs");
      }
  
      const contract = new Contract(ICO_CONTRACT_ADDRESS, ICO_CONTRACT_ABI, await getProviderOrSigner(true));
  
      const tx = await contract.claim();
  
      setIsLoading(true);
      await tx.wait();
      setIsLoading(false);
  
      alert("You have claimed 10 tokens for each NFT you own!");
      await updateStateVariables();
    } catch(err) {
      console.log(err);
    }
  }

  const withdrawEther = async () => {
    const contract = new Contract(
      ICO_CONTRACT_ADDRESS,
      ICO_CONTRACT_ABI,
      await getProviderOrSigner(true),
    );

    const tx = await contract.withdraw();
    await tx.wait();

    alert("All the colected Ether has been sent to the owner's address");
  }

  /**
   * Connects to a Ethereum wallet (e.g. metamask).
   */
  const connectToWallet = async () => {
    try {
      await getProviderOrSigner();

      setIsWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * A helper component to concentrate a heavily repeated piece of code.
   * 
   * This is basically a button that can have (or not) a informational message above.
   * 
   * @param {string} buttonText - Text that the button will have.
   * @param {() => void} buttonOnClick - What to do on button click.
   * @param {string} info - Text of the info message, leave it as null if no message is to be rendered.
   * @returns Control component.
   */
  const Control = (buttonText = null, buttonOnClick = () => {}, info = null) => {
    return <div className={styles.controlCenter}>
      { info && <p className={styles.description}>{info}</p> }
      { buttonText && <div onClick={buttonOnClick} className={styles.button}>{buttonText}</div> }
    </div>
  }

  /**
   * A section of the UI that shows different components depending of the state of the dApp.
   * 
   * @returns StateControl component.
   */
  const StateControl = () => {
    if (isLoading) {
      // if a transaction is being mined, then only show a `loading` message, no button
      return Control(null, null, "Loading...");
    }

    if (!isWalletConnected) {
      // if there is not a wallet connected, show a `connect to wallet` button
      return Control(
        "Connect to wallet", 
        connectToWallet, 
        "You are not connected to a wallet!"
      );
    }

    // tokens input element
    let inputRef = useRef(null);

    // what to do when mint button is clicked
    const onMintButtonClick = async () => {
      if (inputRef.current.value == "")
        return;

      const amount = parseInt(inputRef.current.value);

      if (amount == 0)
        return;
      
      await mint(amount)
    }

    // Normal mint section that also shows a claim option
    return <div className={styles.controlCenter}>
      <input ref={inputRef} placeholder="Amount of tokens to mint" className={styles.input} type="number" name="amount" id="amount" title="asdf" />
      { Control("Mint!", onMintButtonClick) }
      { owsnNFTs && <p>You can also <span onClick={claimTokensForNFTs} className={styles.clickableText}>claim</span> 10 tokens for free for each NFT you own!</p>}
    </div>;
  }

  /**
   * A function that executes all the asynchronous operations needed at start.
   * 
   * This was separated into a different function because useEffect will not accept async operations.
   */
  const initialProcessing = async () => {
    // tries to connect to a wallet at start.
    await connectToWallet();

    // reads state from blockchain to update some basic state variables for the first time
    await updateStateVariables(true);
  }

  useEffect(() => {
    if (!isWalletConnected) {
      web3modal.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });

      initialProcessing();
    }

  }, [isWalletConnected]);

  return (
    <div className={styles.app}>
      <Head>
        <title>ICO</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.content}>
        <div className={styles.info}>
          <h1>Welcome to the new crypto-token ICO!</h1>
          <p className={styles.description}>Here you can mint tokens for a price of 0.001 Ether!</p>
          <p className={styles.description}>Currently, you own a total of <span className={styles.highlight}>{ ownedTokens }</span> tokens</p>
          <p>Overall, a total of <span className={styles.highlight}>{mintedTokens}/{tokenLimit}</span> tokens have been minted!</p>
          <StateControl />
        </div>
        <img className={styles.image} src="https://raw.githubusercontent.com/RobertoCDiaz/nft-collection/main/app/public/nfts/0.svg" alt="NFT logo" />
      </div>
      <footer className={styles.footer}>
        {userAddress && <div className="connection">
          Connected as <span className={styles.address}>{truncateAddress(userAddress)}</span> on the rinkeby network
        </div>}
        {isOwner && <div>
          You are the owner of the contract. You can <span onClick={withdrawEther} className={styles.clickableText}>withdraw</span> all the collected Ether to your account.
        </div>}
      </footer>
    </div>
  )
}
