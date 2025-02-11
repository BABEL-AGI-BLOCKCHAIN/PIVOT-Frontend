import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateTopic.css";
import { useAccount } from "wagmi";
import PivotTopicABI from "../contracts/PivotTopic_metadata.json";
import ERC20ABI from "../contracts/TopicERC20_metadata.json";

import { maxUint256 } from "viem";
import { Address, Chain, Client, formatEther, keccak256, parseEther, toBytes, Transport } from "viem";
import { BigNumber } from "bignumber.js";
import { readContract, waitForTransactionReceipt, writeContract } from "viem/actions";
import { notification } from "antd";
import { getWagmiPublicClient, getWagmiWalletClient } from "src/utils";
import { usePreProcessing } from "src/hooks/usePreProcessing";

// 合约地址（替换为实际部署的合约地址）
const pivotTopicContractAddress = "0x9b764159249880e2d6B9a7F86495371c45aB69bC";

export default function CreateTopic() {
    const navigate = useNavigate();

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

    const checkBalance = async (paymentAmount: string) => {
        const result = (await readContract(publicClient, {
            abi: ERC20ABI.output.abi,
            address: formData.tokenAddress as Address,
            functionName: "balanceOf",
            args: [address],
        })) as bigint;
        console.log(result);
        if (result && BigInt(result) >= parseEther(paymentAmount)) {
            return true;
        }
        return false;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);

        try {
            await preProcessing();

            console.log("Form submitted:", formData);

            // 检查余额是否足够
            if (!(await checkBalance(formData.investmentAmount))) {
                console.log("Insufficient balance");
                openNotificationWithIcon();
                setIsPending(false);
                return;
            }

            const result = (await readContract(publicClient, {
                abi: ERC20ABI.output.abi,
                address: formData.tokenAddress as Address,
                functionName: "allowance",
                args: [address, pivotTopicContractAddress],
            })) as bigint;
            console.log({ result });

            console.log(formData.investmentAmount, formatEther(result));

            const walletClient = await getWagmiWalletClient();

            if (BigNumber(formData.investmentAmount).gt(formatEther(result))) {
                const hash = await writeContract(walletClient, {
                    address: formData.tokenAddress as Address,
                    abi: ERC20ABI.output.abi,
                    functionName: "approve",
                    args: [pivotTopicContractAddress, maxUint256],
                });
                console.log({ hash });
                const res = await waitForTransactionReceipt(publicClient, { hash });
                console.log({ res });
            }

            const { tokenAddress, ...metadata } = formData;
            const message = JSON.stringify(metadata);
            const hashedMessage = keccak256(toBytes(message));

            const hash = await writeContract(walletClient, {
                address: pivotTopicContractAddress,
                abi: PivotTopicABI.output.abi,
                functionName: "createTopic",
                args: [parseEther(formData.investmentAmount), formData.tokenAddress, hashedMessage],
            });
            setHash(hash);
            console.log({ hash });
            const res = await waitForTransactionReceipt(publicClient, { hash });
            console.log({ res });
            //navigate('/');
            setIsPending(false);
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

                {hash && <div>Transaction Hash: {hash}</div>}
            </form>
        </div>
    );
}
