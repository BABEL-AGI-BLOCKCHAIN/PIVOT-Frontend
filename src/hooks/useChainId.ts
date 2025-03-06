import { useAccount } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { pivotTopicContractAddress } from "src/contracts/address";
import { useMemo } from "react";

export function useChainId() {
    const chainId = useMemo(() => {
        return process.env.REACT_APP_ENABLE_TESTNETS === "true" ? sepolia.id : mainnet.id;
    }, []);

    return chainId;
}
