import React, { useState, useMemo } from "react";
import "./CreateTopic.css";
import { useAccount } from "wagmi";
import PivotTopicABI from "../contracts/PivotTopic_ABI.json";
import ERC20ABI from "../contracts/TopicERC20_ABI.json";

import { decodeAbiParameters, formatUnits, maxUint256, parseAbiParameters, parseUnits } from "viem";
import { Address, keccak256, toBytes } from "viem";
import { BigNumber } from "bignumber.js";
import { readContract, waitForTransactionReceipt, writeContract } from "viem/actions";
import { notification } from "antd";
import { getWagmiPublicClient, getWagmiWalletClient } from "src/utils";
import { usePreProcessing } from "src/hooks/usePreProcessing";
import { pivotTopicContractAddress } from "src/contracts/address";
import { FileUploader } from "src/components/FileUploader";
import { useContractAddress } from "src/hooks/useContractAddress";

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

    // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = e.target.files?.[0];
    //     if (file && file.size > 5 * 1024 * 1024) {
    //         console.error("The file size exceeds 5MB. Please choose a smaller file.");
    //         return;
    //     }
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onloadend = () => {
    //             setFormData((data) => ({ ...data, resource: reader.result as string, resourceFile: file }));
    //         };
    //         reader.readAsDataURL(file);
    //     }
    // };

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

        try {
            const investmentAmount = Number(formData.investmentAmount).toLocaleString(undefined, { useGrouping: false, minimumFractionDigits: 0, maximumFractionDigits: 18 });
            await preProcessing();
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
                let topicId = decodeAbiParameters(parseAbiParameters(["uint256"]), log.data as any)[0];
                console.log({ topicId });
            }

            //navigate('/');
            setIsPending(false);
            notification.success({
                message: "success",
                description: "Successfully created",
                duration: 3,
            });
        } catch (error) {
            console.log(error);
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
        <div className="create-topic">
            <form onSubmit={handleSubmit} className="create-topic-form">
                <h1>Create New Topic</h1>

                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label htmlFor="content">Content</label>
                    <textarea id="content" name="content" value={formData.content} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label htmlFor="resource">Media File</label>
                    {/* <input type="url" id="resource" name="resource" value={formData.resource} onChange={handleChange} required /> */}
                    <FileUploader formData={formData} setFormData={setFormData} />
                </div>

                <div className="form-group">
                    <label htmlFor="investmentAmount">Investment Amount</label>
                    <input type="number" id="investmentAmount" name="investmentAmount" value={formData.investmentAmount} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label htmlFor="tokenAddress">ERC20 Token Contract Address</label>
                    <input type="text" id="tokenAddress" name="tokenAddress" value={formData.tokenAddress} onChange={handleChange} required />
                </div>

                <button type="submit" className="submit-button" disabled={isPending}>
                    {isPending ? "Creating Topic..." : "Create Topic"}
                </button>

                {hash && <div>Transaction Hash of Creating a PIVOT Topic: {hash}</div>}
            </form>
        </div>
    );
}
