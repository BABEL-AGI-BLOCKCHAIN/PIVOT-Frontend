import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateTopic.css";
//import {MyComponent} from '../Contract';
import { Address, Chain, Client, formatEther, keccak256, parseEther, toBytes, Transport } from "viem";
import { ChainIdParameter } from "@wagmi/core/internal";
import { maxUint256 } from "viem";
import { useAccount } from "wagmi";
import PivotTopicABI from "../contracts/PivotTopic_metadata.json";
import ERC20ABI from "../contracts/TopicERC20_metadata.json";
import { getTransactionReceipt, readContract, waitForTransactionReceipt, writeContract } from "viem/actions";
import { config } from "src/wagmi";
import { getPublicClient, getWalletClient } from "@wagmi/core";
import { BigNumber } from "bignumber.js";
// 合约地址（替换为实际部署的合约地址）
const pivotTopicContractAddress = "0x9b764159249880e2d6B9a7F86495371c45aB69bC";

export default function CreateTopic() {
    const navigate = useNavigate();

    const { chainId, address } = useAccount();
    const [isPending, setIsPending] = useState(false);
    const [hash, setHash] = useState("");
    // const { data: hash, isPending, writeContract } = useWriteContract();

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        resource: "",
        investmentAmount: "",
        tokenAddress: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        setIsPending(true);
        e.preventDefault();
        // Add topic creation logic here
        console.log("Form submitted:", formData);
        const { tokenAddress, ...metadata } = formData;
        const message = JSON.stringify(metadata);
        const hashedMessage = keccak256(toBytes(message));
        try {
            const publicClient = getPublicClient(config, { chainId: chainId as ChainIdParameter<typeof config>["chainId"] }) as Client<Transport, Chain>;
            const result = (await readContract(publicClient, {
                abi: ERC20ABI.output.abi,
                address: formData.tokenAddress as Address,
                functionName: "allowance",
                args: [address, pivotTopicContractAddress],
            })) as bigint;
            console.log({ result });

            const walletClient = await getWalletClient(config);
            console.log(formData.investmentAmount, formatEther(result));
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
            console.error("Error calling contract function:", error);
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
