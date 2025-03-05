import React, { useState, useMemo, useEffect } from "react";
import { useAccount } from "wagmi";
import PivotTopicABI from "../contracts/PivotTopic_ABI.json";
import ERC20ABI from "../contracts/TopicERC20_ABI.json";

import { decodeAbiParameters, formatUnits, isAddress, maxUint256, parseAbiParameters, parseUnits } from "viem";
import { Address, keccak256, toBytes } from "viem";
import { BigNumber } from "bignumber.js";
import { readContract, waitForTransactionReceipt, writeContract } from "viem/actions";
import { notification } from "antd";
import { cn, getWagmiPublicClient, getWagmiWalletClient } from "src/utils";
import { usePreProcessing } from "src/hooks/usePreProcessing";
import { FileUploader } from "src/components/FileUploader";
import { useContractAddress } from "src/hooks/useContractAddress";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export type FormData = {
    title: string;
    content: string;
    resource: string;
    resourceFile: File | null;
    investmentAmount: string;
    tokenAddress: string;
};

export default function CreateTopic() {
    const { chainId, address } = useAccount();
    const preProcessing = usePreProcessing();

    const [isPending, setIsPending] = useState(false);
    const [hash, setHash] = useState("");
    const [topicId, setTopicId] = useState("");

    const openNotificationWithIcon = (description: string) => {
        notification.error({
            message: "error",
            description,
            duration: 3,
        });
    };
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        resource: "",
        resourceFile: null as File | null,
        investmentAmount: "",
        tokenAddress: "",
    });

    const contractAddress = useContractAddress();

    const publicClient = useMemo(() => getWagmiPublicClient(chainId), [chainId]);

    const getTokenDecimals = async () => {
        const tokenDecimals = (await readContract(publicClient, {
            abi: ERC20ABI,
            address: formData.tokenAddress as Address,
            functionName: "decimals",
        })) as number;
        return tokenDecimals;
    };

    const checkBalance = async (paymentAmount: string, tokenDecimals: number) => {
        const result = (await readContract(publicClient, {
            abi: ERC20ABI,
            address: formData.tokenAddress as Address,
            functionName: "balanceOf",
            args: [address],
        })) as bigint;
        console.log(result);
        if (result && BigInt(result) >= parseUnits(paymentAmount, tokenDecimals)) {
            return true;
        }
        return false;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        setHash("");
        setTopicId("");

        try {
            const investmentAmount = Number(formData.investmentAmount).toLocaleString(undefined, { useGrouping: false, minimumFractionDigits: 0, maximumFractionDigits: 18 });
            await preProcessing();

            if (!isAddress(formData.tokenAddress)) {
                console.log("Not a valid ERC20 token contract address");
                openNotificationWithIcon("Not a valid ERC20 token contract address");
                setIsPending(false);
                return;
            }

            const tokenDecimals = await getTokenDecimals();
            console.log("Form submitted:", formData);

            if (!(await checkBalance(investmentAmount, tokenDecimals))) {
                console.log("Insufficient balance");
                openNotificationWithIcon("Insufficient balance");
                setIsPending(false);
                return;
            }

            if (investmentAmount == "0") {
                console.log("Insufficient investment amount");
                openNotificationWithIcon("Insufficient investment amount");
                setIsPending(false);
                return;
            }

            const result = (await readContract(publicClient, {
                abi: ERC20ABI,
                address: formData.tokenAddress as Address,
                functionName: "allowance",
                args: [address, contractAddress],
            })) as bigint;
            console.log({ result });

            console.log(investmentAmount, formatUnits(result, tokenDecimals));

            const walletClient = await getWagmiWalletClient();

            if (BigNumber(investmentAmount).gt(formatUnits(result, tokenDecimals))) {
                const hash = await writeContract(walletClient, {
                    address: formData.tokenAddress as Address,
                    abi: ERC20ABI,
                    functionName: "approve",
                    args: [contractAddress, maxUint256],
                });
                console.log({ hash });
                const res = await waitForTransactionReceipt(publicClient, { hash });
                console.log({ res });
            }

            const { tokenAddress, ...metadata } = formData;
            const message = JSON.stringify(metadata);
            const hashedMessage = keccak256(toBytes(message));

            const hash = await writeContract(walletClient, {
                address: contractAddress,
                abi: PivotTopicABI,
                functionName: "createTopic",
                args: [parseUnits(investmentAmount, tokenDecimals), formData.tokenAddress, hashedMessage],
            });
            setHash(hash);
            console.log({ hash });
            const res = await waitForTransactionReceipt(publicClient, { hash });
            console.log({ res });
            const topic = keccak256(toBytes("CreateTopic(address,uint256,uint256,uint256,address,uint256)"));
            const log = res.logs.find((l) => l.topics[0] === topic);
            if (log?.data) {
                let topicId = decodeAbiParameters(parseAbiParameters(["uint256"]), log.data as any)[0]?.toString();
                setTopicId(topicId);
                console.log({ topicId });
            }

            //navigate('/');
            setIsPending(false);
            notification.success({
                message: "success",
                description: "Successfully created",
                duration: 3,
            });
        } catch (error: any) {
            const err = error.cause?.shortMessage || error.message || error.response?.data;
            if (error?.cause?.name === "ContractFunctionZeroDataError") {
                openNotificationWithIcon("Not a valid ERC20 token contract address");
            } else if (err) {
                openNotificationWithIcon(err.slice(0, 60));
            }

            setIsPending(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="pt-28 max-w-2xl mx-auto px-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
                <h1 className="text-center text-2xl font-semibold mb-6">Create New Topic</h1>

                <div className="mb-4">
                    <label htmlFor="title" className="block font-medium mb-2">
                        Title
                    </label>
                    <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md text-base" />
                </div>

                <div className="mb-4">
                    <label htmlFor="content" className="block font-medium mb-2">
                        Content
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md text-base min-h-[150px] resize-y"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="resource" className="block font-medium mb-2">
                        Media File
                    </label>
                    <FileUploader formData={formData} setFormData={setFormData} />
                </div>

                <div className="mb-4">
                    <label htmlFor="investmentAmount" className="block font-medium mb-2">
                        Investment Amount
                    </label>
                    <input
                        type="number"
                        id="investmentAmount"
                        name="investmentAmount"
                        value={formData.investmentAmount}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md text-base"
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="tokenAddress" className="block font-medium mb-2">
                        ERC20 Token Contract Address
                    </label>
                    <input
                        type="text"
                        id="tokenAddress"
                        name="tokenAddress"
                        value={formData.tokenAddress}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md text-base"
                    />
                </div>

                <button type="submit" className="w-full p-3 bg-blue-600 text-white rounded-md text-md hover:bg-blue-700 font-bold" disabled={isPending}>
                    {isPending ? "Creating Topic..." : "Create Topic"}
                </button>

                <div className={cn("mt-4 break-words", !hash && "hidden")}>
                    <div>Transaction Hash:</div>
                    <div className="text-sm text-gray-600">
                        {hash}{" "}
                        <Link to={`https://${process.env.REACT_APP_ENABLE_TESTNETS === "true" ? "sepolia." : ""}etherscan.io/tx/${hash}`} target="_blank" className="inline-flex relative top-[3px]">
                            <ArrowUpRight className="h-[18px] text-blue-600" />
                        </Link>
                    </div>
                </div>
                <div className={cn("mt-4 break-words", !topicId && "hidden")}>
                    <div className="text-md text-gray-600">
                        <Link to={`/topic/${topicId}`} className="inline-flex relative top-[3px] w-full">
                            <button type="submit" className="w-full p-3 bg-blue-600 text-white rounded-md text-md hover:bg-blue-700 font-bold" disabled={isPending}>
                                View Your Topic
                                <ArrowUpRight className="inline-flex pb-[2px]" />
                            </button>
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}
