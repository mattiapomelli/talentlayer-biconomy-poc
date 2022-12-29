import { useContract, useSigner } from "wagmi";

import { LockAbi } from "../abis/lock";

const LOCK_CONTRACT_ADDRESS = "0xbc2d580d309d78714732209156c7a9b78ae5d771";

export const useLockContract = () => {
  const { data: signer } = useSigner();

  return useContract({
    address: LOCK_CONTRACT_ADDRESS,
    abi: LockAbi,
    signerOrProvider: signer,
  });
};
