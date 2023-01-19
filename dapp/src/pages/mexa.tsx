import styles from "../styles/Home.module.css";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Contract } from "ethers";
import { useAccount, useSigner } from "wagmi";
import { SimpleTalentLayerIdAbi } from "../abis/simple-talent-layer-id";
import { useEffect, useRef, useState } from "react";
import { Biconomy } from "@biconomy/mexa";

const simpleTalentLayerIdAddress = "0xaDfd157Ddc639ce5C5DD0060103B037D8CE1036B";

// The first argument of the Biconomy class is an EIP 1193 type provider that has to be passed.
// If there is a type mismatch you'll have to set the type of the provider as
// External Provider
export type ExternalProvider = {
  isMetaMask?: boolean;
  isStatus?: boolean;
  host?: string;
  path?: string;
  sendAsync?: (
    request: { method: string; params?: Array<any> },
    callback: (error: any, response: any) => void
  ) => void;
  send?: (
    request: { method: string; params?: Array<any> },
    callback: (error: any, response: any) => void
  ) => void;
  request?: (request: { method: string; params?: Array<any> }) => Promise<any>;
};

const Home = () => {
  const { data: signer } = useSigner();
  const { address } = useAccount();

  const [handle, setHandle] = useState("");

  const biconomyRef = useRef<Biconomy>();

  useEffect(() => {
    const initBiconomy = async () => {
      if (!process.env.NEXT_PUBLIC_BICONOMY_DASHBOARD_API_KEY) {
        throw new Error(
          "NEXT_PUBLIC_BICONOMY_DASHBOARD_API_KEY is not defined"
        );
      }

      const biconomy = new Biconomy(window.ethereum as ExternalProvider, {
        apiKey: process.env.NEXT_PUBLIC_BICONOMY_DASHBOARD_API_KEY,
        contractAddresses: [simpleTalentLayerIdAddress],
        debug: true,
      });

      await biconomy.init();
      biconomyRef.current = biconomy;
    };

    initBiconomy();
  }, []);

  useEffect(() => {
    if (!signer) return;

    const getHandle = async () => {
      const simpleTalentLayerId = new Contract(
        simpleTalentLayerIdAddress,
        SimpleTalentLayerIdAbi,
        signer.provider
      );

      const handle = await simpleTalentLayerId.handles(address);
      setHandle(handle);
    };

    getHandle();
  }, [address, signer]);

  const onMint = async () => {
    if (!biconomyRef.current || !signer) return;

    // To create contract instances you can do:
    const simpleTalentLayerId = new Contract(
      simpleTalentLayerIdAddress,
      SimpleTalentLayerIdAbi,
      biconomyRef.current.ethersProvider
    );

    const tx = await simpleTalentLayerId.mint("alice", {
      value: 100,
    });
    await tx.wait();
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>Mexa Example</h1>
        <ConnectButton />

        <div>Handle: {handle}</div>

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
