import { getPublicClient, getWalletClient, Transport } from "@wagmi/core";
import { ChainIdParameter } from "@wagmi/core/internal";
import { config } from "src/wagmi";
import { Client, Chain } from "viem";
import Decimal from "decimal.js";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getWagmiPublicClient(chainId?: number) {
    return getPublicClient(config, { chainId: chainId as ChainIdParameter<typeof config>["chainId"] }) as Client<Transport, Chain>;
}

export async function getWagmiWalletClient() {
    return await getWalletClient(config);
}

export function formatDecimal(value: Decimal.Value, decimalPlaces = 2, roundingMode = Decimal.ROUND_DOWN) {
    if (!value) {
        return "0";
    }
    return new Decimal(value).toDecimalPlaces(decimalPlaces, roundingMode).toString();
}
