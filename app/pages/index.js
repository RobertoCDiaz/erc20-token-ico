import Head from 'next/head'
import styles from '../styles/Home.module.css'

import Web3Modal from "web3modal";
import { Contract, providers, utils } from "ethers";
import { useEffect, useRef, useState } from 'react';

const { ICO_CONTRACT_ADDRESS, ICO_CONTRACT_ABI } =  require("../constants/index");

export default function Home() {
  // keeps track of whether there is currently a transaction being mined
  const [isLoading, setIsLoading] = useState(false);
  // is a wallet connected (e.g. metamask)
  const [isWalletConnected, setIsWalletConnected] = useState(true);
  // how many tokens the user owns
  const [ownedTokens, setOwnedTokens] = useState(0);
  // how many tokens have been minted overall
  const [mintedTokens, setMintedTokens] = useState(0);

  // Web3Modal reference.
  const web3modal = useRef();

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
   * Connects to a Ethereum wallet (e.g. metamask).
   */
  const connectToWallet = async () => {
    try {
      if (!isWalletConnected) {
        await getProviderOrSigner();
        setIsWalletConnected(true);
      }
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
    const onMintButtonClick = () => {
      const amount = inputRef.current.value;
      
      // ...
    }

    // Normal mint section that also shows a claim option
    return <div className={styles.controlCenter}>
      <input ref={inputRef} placeholder="Amount of tokens to mint" className={styles.input} type="number" name="amount" id="amount" title="asdf" />
      { Control("Mint!", onMintButtonClick) }
      <p>You can also <span className={styles.clickableText}>claim</span> 10 tokens for free for each NFT you own!</p>
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
  }

  useEffect(() => {
    initialProcessing();
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
          <p>Overall, a total of <span className={styles.highlight}>{mintedTokens}/10000</span> tokens have been minted!</p>
          <StateControl />
        </div>
        <img className={styles.image} src="https://raw.githubusercontent.com/RobertoCDiaz/nft-collection/main/app/public/nfts/0.svg" alt="NFT logo" />
      </div>
    </div>
  )
}
