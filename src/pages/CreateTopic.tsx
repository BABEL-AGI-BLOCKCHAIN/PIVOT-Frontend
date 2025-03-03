import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateTopic.css";
import { useAccount } from "wagmi";
import PivotTopicABI from "../contracts/PivotTopic_ABI.json";
import ERC20ABI from "../contracts/TopicERC20_ABI.json";

import { formatUnits, maxUint256, parseUnits } from "viem";
import { Address, Chain, keccak256, toBytes } from "viem";
import { BigNumber } from "bignumber.js";
import { readContract, waitForTransactionReceipt, writeContract } from "viem/actions";
import { notification } from "antd";
import { getWagmiPublicClient, getWagmiWalletClient } from "src/utils";
import { usePreProcessing } from "src/hooks/usePreProcessing";
import { pivotTopicContractAddress } from "src/contracts/address";

export default function CreateTopic() {
    const { chainId, address } = useAccount();
    const preProcessing = usePreProcessing();

    const [isPending, setIsPending] = useState(false);
    const [hash, setHash] = useState("");

    const openNotificationWithIcon = () => {
        notification.error({
            message: "error",
            description: "Insufficient balance",
            duration: 3,
        });
    };
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        resource: "",
        investmentAmount: "",
        tokenAddress: "",
    });

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

        try {
            await preProcessing();
            const tokenDecimals = await getTokenDecimals();
            console.log("Form submitted:", formData);

            // 检查余额是否足够
            if (!(await checkBalance(formData.investmentAmount, tokenDecimals))) {
                console.log("Insufficient balance");
                openNotificationWithIcon();
                setIsPending(false);
                return;
            }

            const contractAddress = pivotTopicContractAddress[chainId!];

            const result = (await readContract(publicClient, {
                abi: ERC20ABI,
                address: formData.tokenAddress as Address,
                functionName: "allowance",
                args: [address, contractAddress],
            })) as bigint;
            console.log({ result });

            console.log(formData.investmentAmount, formatUnits(result, tokenDecimals));

            const walletClient = await getWagmiWalletClient();

            if (BigNumber(formData.investmentAmount).gt(formatUnits(result, tokenDecimals))) {
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
                args: [parseUnits(formData.investmentAmount, tokenDecimals), formData.tokenAddress, hashedMessage],
            });
            setHash(hash);
            console.log({ hash });
            const res = await waitForTransactionReceipt(publicClient, { hash });
            console.log({ res });
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
                    <label htmlFor="resource">Resource URL</label>
                    <input type="url" id="resource" name="resource" value={formData.resource} onChange={handleChange} required />
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
