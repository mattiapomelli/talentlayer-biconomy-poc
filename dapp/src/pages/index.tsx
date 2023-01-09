import styles from "../styles/Home.module.css";
import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers, providers } from "ethers";
import { ChainId, SmartAccountConfig } from "@biconomy/core-types";
import SmartAccount from "@biconomy/smart-account";
import { useAccount, useProvider, useSigner } from "wagmi";

const options: Partial<SmartAccountConfig> = {
  activeNetworkId: ChainId.GOERLI,
  supportedNetworksIds: [ChainId.GOERLI],
  networkConfig: [
    {
      chainId: ChainId.GOERLI,
      dappAPIKey: process.env.NEXT_PUBLIC_BICONOMY_DAPP_API_KEY,
    },
  ],
};

const Home = () => {
  const { data: signer } = useSigner();
  const { address } = useAccount();

  const [smartAccount, setSmartAccount] = useState<SmartAccount | null>(null);

  useEffect(() => {
    if (!signer?.provider || !address) return;

    const setupSmartAccount = async () => {
      const walletProvider = new providers.Web3Provider(
        (signer?.provider as providers.Web3Provider).provider
      );

      const smartAccount = new SmartAccount(walletProvider, options);
      await smartAccount.init();

      setSmartAccount(smartAccount);
    };

    setupSmartAccount();
  }, [address, signer?.provider]);

  const onDeposit = async () => {
    if (!smartAccount) return;

    const tokenAddress = "0xC2C527C0CACF457746Bd31B2a698Fe89de2b6d49";
    const recipientAddress = "0x498c3DdbEe3528FB6f785AC150C9aDb88C7d372c";

    // One needs to prepare the transaction data
    // Here we will be transferring ERC 20 tokens from the Smart Contract Wallet to an address
    const erc20Interface = new ethers.utils.Interface([
      "function transfer(address _to, uint256 _value)",
    ]);

    // Encode an ERC-20 token transfer to recipientAddress of the specified amount
    const encodedData = erc20Interface.encodeFunctionData("transfer", [
      recipientAddress,
      1 * 10 ** 6,
    ]);

    // You need to create transaction objects of the following interface
    const tx = {
      to: tokenAddress, // destination smart contract address
      data: encodedData,
    };

    // Optional: Transaction subscription. One can subscribe to various transaction states
    // Event listener that gets triggered once a hash is generetaed
    smartAccount.on("txHashGenerated", (response: any) => {
      console.log(">>> txHashGenerated event received via emitter", response);
    });
    smartAccount.on("onHashChanged", (response: any) => {
      console.log(">>> onHashChanged event received via emitter", response);
    });
    // Event listener that gets triggered once a transaction is mined
    smartAccount.on("txMined", (response: any) => {
      console.log(">>> txMined event received via emitter", response);
    });
    // Event listener that gets triggered on any error
    smartAccount.on("error", (response: any) => {
      console.log(">>> error event received via emitter", response);
    });

    // Sending gasless transaction
    const txResponse = await smartAccount.sendGaslessTransaction({
      transaction: tx,
    });
    console.log(">>> tx hash generated", txResponse.hash);

    // If you do not subscribe to listener, one can also get the receipt like shown below
    const receipt = await txResponse.wait();
    console.log(">>> tx receipt", receipt);
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>Biconomy SDK Next.js Rainbow Example</h1>
        <ConnectButton />

        {smartAccount && (
          <div>
            <h2>Smart Account Address</h2>
            <p>{smartAccount.address}</p>
          </div>
        )}
        <div>
          <button className={styles.button} onClick={onDeposit}>
            Call
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;
