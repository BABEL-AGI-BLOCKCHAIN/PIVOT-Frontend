import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { arbitrum, base, baseSepolia, holesky, mainnet, optimism, polygon, sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
    appName: "RainbowKit demo",
    projectId: "53f430e8690ee482bda6cdd221b6ad41",
    chains: [process.env.REACT_APP_ENABLE_TESTNETS === "true" ? sepolia : mainnet],
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http("https://eth-sepolia.public.blastapi.io"),
    },
});
