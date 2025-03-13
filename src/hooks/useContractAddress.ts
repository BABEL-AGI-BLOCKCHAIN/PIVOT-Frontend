import { useAccount } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { pivotTopicContractAddress } from "src/contracts/address";
import { useMemo } from "react";

export function useContractAddress() {
    const { chainId } = useAccount();

    const contractAddress = useMemo(() => {
        let contractAddressObj = pivotTopicContractAddress[chainId!];

        if ((contractAddressObj && !contractAddressObj.env.includes(process.env.REACT_APP_ENABLE_TESTNETS === "true" ? "dev" : "pro")) || !contractAddressObj) {
            return pivotTopicContractAddress[process.env.REACT_APP_ENABLE_TESTNETS === "true" ? sepolia.id : mainnet.id].address;
        }

        return contractAddressObj.address;
    }, [chainId]);

    return contractAddress;
}
