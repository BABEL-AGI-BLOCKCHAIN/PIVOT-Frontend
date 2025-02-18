import { getPublicClient, getWalletClient, Transport } from "@wagmi/core";
import { ChainIdParameter } from "@wagmi/core/internal";
import { config } from "src/wagmi";
import { Client, Chain } from "viem";

export function getWagmiPublicClient(chainId?: number) {
    return getPublicClient(config, { chainId: chainId as ChainIdParameter<typeof config>["chainId"] }) as Client<Transport, Chain>;
}

export async function getWagmiWalletClient() {
    return await getWalletClient(config);
}
