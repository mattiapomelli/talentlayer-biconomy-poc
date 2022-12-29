import styles from "../styles/Home.module.css";
import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BigNumber, ethers, providers } from "ethers";
import { ChainId, SmartAccountConfig } from "@biconomy/core-types";
import SmartAccount from "@biconomy/smart-account";
import { useAccount, useProvider, useSigner } from "wagmi";
import { useLockContract } from "../hooks/use-contract";

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
  const provider = useProvider();
  const { data: signer } = useSigner();
  const { address } = useAccount();

  const lockContract = useLockContract();
  const [contractBalance, setContractBalance] = useState<BigNumber>(
    BigNumber.from(0)
  );

  const [smartAccount, setSmartAccount] = useState<SmartAccount | null>(null);

  useEffect(() => {
    if (!signer?.provider || !address) return;

    const setupSmartAccount = async () => {
      const walletProvider = new providers.Web3Provider(
        (signer?.provider as providers.Web3Provider).provider
      );

      let smartAccount = new SmartAccount(walletProvider, options);
      smartAccount = await smartAccount.init();

      setSmartAccount(smartAccount);
    };

    setupSmartAccount();
  }, [address, signer?.provider]);

  useEffect(() => {
    if (!lockContract) return;

    const getLockBalance = async () => {
      const balance = await provider.getBalance(lockContract.address);
      setContractBalance(balance);
    };

    getLockBalance();
  }, [lockContract, provider]);

  const onDeposit = async () => {
    if (!lockContract || !smartAccount) return;

    smartAccount.on("txHashGenerated", (response: any) => {
      console.log(">>> txHashGenerated event received via emitter", response);
    });

    smartAccount.on("txMined", (response: any) => {
      console.log(">>> txMined event received via emitter", response);
    });

    smartAccount.on("error", (response: any) => {
      console.log(">>> error event received via emitter", response);
    });

    const tx = await lockContract.populateTransaction.deposit({ value: 100 });
    const { to, ...rest } = tx;

    const txResponse = await smartAccount.sendGasLessTransaction({
      transaction: {
        to: to || "",
        ...rest,
      },
    });

    console.log("Transaction hash", txResponse.hash);
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
          <button onClick={onDeposit}>Deposit</button>
        </div>
        <div>
          <p>Contract Balance: {contractBalance.toString()}</p>
        </div>
      </main>
    </div>
  );
};

export default Home;
