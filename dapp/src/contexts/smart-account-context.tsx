import React, { createContext, useContext, useEffect, useState } from "react";
import { providers } from "ethers";
import SmartAccount from "@biconomy/smart-account";
import { ChainId, SmartAccountConfig } from "@biconomy/core-types";
import { useAccount, useSigner } from "wagmi";

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

interface SmartAccountContextValue {
  smartAccount: SmartAccount | null;
  loading: boolean;
}

// Context
export const SmartAccountContext = createContext<
  SmartAccountContextValue | undefined
>(undefined);

// Provider
export const SmartAccountProvider = ({ children }: any) => {
  const { data: signer } = useSigner();
  const { address } = useAccount();

  const [smartAccount, setSmartAccount] = useState<SmartAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSmartAccount = async () => {
      if (!signer?.provider || !address) return;

      try {
        const walletProvider = new providers.Web3Provider(
          (signer.provider as providers.Web3Provider).provider
        );

        const smartAccount = new SmartAccount(walletProvider, options);
        await smartAccount.init();

        setSmartAccount(smartAccount);

        console.log("Smart account: ", smartAccount);

        smartAccount.on("txHashGenerated", (response: any) => {
          console.log("txHashGenerated event received via emitter", response);
        });

        smartAccount.on("txHashChanged", (response: any) => {
          console.log("txHashChanged event received via emitter", response);
        });

        smartAccount.on("txMined", (response: any) => {
          console.log("txMined event received via emitter", response);
        });

        smartAccount.on("error", (response: any) => {
          console.log("error event received via emitter", response);
        });

        // Get smart account data and state?

        setLoading(false);
      } catch (error: any) {
        setLoading(false);
        console.error("Error getting smart account: ", error);
      }
    };

    getSmartAccount();
  }, [signer?.provider, address]);

  return (
    <SmartAccountContext.Provider
      value={{
        smartAccount,
        loading,
      }}
    >
      {children}
    </SmartAccountContext.Provider>
  );
};

export const useSmartAccount = () => {
  const context = useContext(SmartAccountContext);

  if (context === undefined) {
    throw new Error(
      "useSmartAccount must be used within an SmartAccountProvider"
    );
  }

  return context;
};
