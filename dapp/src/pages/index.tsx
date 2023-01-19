import styles from "../styles/Home.module.css";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Contract } from "ethers";
import { useAccount, useSigner } from "wagmi";
import { useSmartAccount } from "../contexts/smart-account-context";
import { SimpleTalentLayerIdAbi } from "../abis/simple-talent-layer-id";
import { useEffect, useState } from "react";

const simpleTalentLayerIdAddress = "0x1c9F590C75C0AcBA1C12AD8eB58368D9777461F0";

const Home = () => {
  const { data: signer } = useSigner();
  const { address } = useAccount();

  const { smartAccount, loading } = useSmartAccount();
  const [handle, setHandle] = useState("");

  useEffect(() => {
    if (!signer || !smartAccount) return;

    const getHandle = async () => {
      const simpleTalentLayerId = new Contract(
        simpleTalentLayerIdAddress,
        SimpleTalentLayerIdAbi,
        signer.provider
      );

      const handle = await simpleTalentLayerId.handles(smartAccount.address);
      setHandle(handle);
    };

    getHandle();
  }, [smartAccount, signer, address]);

  const onMint = async () => {
    if (!smartAccount || !signer) return;

    const simpleTalentLayerId = new Contract(
      simpleTalentLayerIdAddress,
      SimpleTalentLayerIdAbi,
      signer.provider
    );

    const value = 100;
    const mintTx = await simpleTalentLayerId.populateTransaction.mint("frank", {
      value,
    });

    const tx = {
      to: simpleTalentLayerIdAddress,
      data: mintTx.data,
      value,
    };

    const txResponse = await smartAccount.sendGaslessTransaction({
      transaction: tx,
    });

    console.log("Txn hash: ", txResponse.hash);
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>Biconomy New SDK Example</h1>

        <ConnectButton />

        <div className={styles.handleContainer}>Handle: {handle}</div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            {smartAccount && (
              <div>
                <h2>Smart Account Address</h2>
                <p>{smartAccount.address}</p>
              </div>
            )}
          </>
        )}

        <div className={styles.buttonContainer}>
          <button className={styles.button} onClick={onMint}>
            Mint
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;
