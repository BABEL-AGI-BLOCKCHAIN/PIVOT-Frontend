import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId, useConnect, useSwitchChain } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { notification } from "antd";

export function usePreProcessing() {
    const { status, chain } = useAccount();
    const { switchChainAsync } = useSwitchChain();
    const { openConnectModal } = useConnectModal();

    const preProcessing = async () => {
        let error;
        if (status !== "connected") {
            if (!openConnectModal) {
                notification.info({
                    message: "Check your wallet status",
                    duration: 3,
                });
                throw error;
            }
            openConnectModal();
            throw error;
        }
        if ((process.env.REACT_APP_ENABLE_TESTNETS === "true" && chain?.id !== sepolia.id) || (process.env.REACT_APP_ENABLE_TESTNETS !== "true" && chain?.id !== mainnet.id)) {
            await switchChainAsync({ chainId: process.env.REACT_APP_ENABLE_TESTNETS === "true" ? sepolia.id : mainnet.id });
            notification.info({
                message: "Chain switched. Please retry.",
                duration: 3,
            });
        }
    };

    return preProcessing;
}
