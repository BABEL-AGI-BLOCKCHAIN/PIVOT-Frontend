import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import "./TopicDetail.css";
import { usePreProcessing } from "src/hooks/usePreProcessing";
import { notification } from "antd";
import { readContract, waitForTransactionReceipt, writeContract } from "viem/actions";
import PivotTopicABI from "../contracts/PivotTopic_ABI.json";
import BigNumber from "bignumber.js";
import { pivotTopicContractAddress } from "src/contracts/address";
import { formatDecimal, getWagmiPublicClient, getWagmiWalletClient } from "src/utils";
import { maxUint256, Address, formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import ERC20ABI from "../contracts/TopicERC20_ABI.json";
import { mainnet, sepolia } from "viem/chains";
import { useContractAddress } from "src/hooks/useContractAddress";

interface Comment {
    id: string;
    author: string;
    content: string;
    timestamp: string;
}

interface TopicDetail {
    id: string;
    title: string;
    content: string;
    author: string;
    image: string;
    totalInvestment: number;
    minimumInvestmentAmount: string;
    currentPosition: number;
    myInvestment: string;
    myIncome: string;
    commentsCount: number;
    publishTime: string;
    tokenName: string;
    tokenLogo: string;
    tokenAddress: Address;
    tokenSymbol: string;
    tokenDecimals: number;
    myTokenBalance: string;
    comments: Comment[];
}

export default function TopicDetail1() {
    const { id } = useParams();
    const [topic, setTopic] = useState<TopicDetail>();
    const [newComment, setNewComment] = useState("");
    const [investmentAmount, setInvestmentAmount] = useState("");

    const preProcessing = usePreProcessing();
    const [isPending, setIsPending] = useState(false);
    const [isWithdrawalPending, setIsWithdrawalPending] = useState(false);

    const [hash, setHash] = useState("");
    const [withdrawalHash, setWithdrawalHash] = useState("");
    const { chainId, address } = useAccount();

    const publicClient = useMemo(() => getWagmiPublicClient(chainId), [chainId]);

    const contractAddress = useContractAddress();

    const getMyInvestment = async () => {
        if (!address) {
            return;
        }
        const myInvestment = (await readContract(publicClient, {
            abi: PivotTopicABI,
            address: contractAddress,
            functionName: "getInvestment",
            args: [address, id],
        })) as bigint;
        return myInvestment;
    };

    const getMyTokenBalance = async (tokenAddress: Address) => {
        if (!address) {
            return;
        }
        const result = (await readContract(publicClient, {
            abi: ERC20ABI,
            address: tokenAddress as Address,
            functionName: "balanceOf",
            args: [address],
        })) as bigint;
        return result;
    };

    const getMyIncome = async (address: Address, topicId: string) => {
        if (!address) {
            return;
        }
        const result = (await readContract(publicClient, {
            abi: PivotTopicABI,
            address: contractAddress,
            functionName: "getIncome",
            args: [address, topicId],
        })) as bigint;
        return result;
    };

    const getTokenInfo = async () => {
        const tokenAddress = (await readContract(publicClient, {
            abi: PivotTopicABI,
            address: contractAddress,
            functionName: "topicCoin",
            args: [id],
        })) as Address;

        const tokenSymbol = (await readContract(publicClient, {
            abi: ERC20ABI,
            address: tokenAddress,
            functionName: "symbol",
        })) as string;

        const tokenDecimals = (await readContract(publicClient, {
            abi: ERC20ABI,
            address: tokenAddress,
            functionName: "decimals",
        })) as number;
        return { tokenAddress, tokenSymbol, tokenDecimals };
    };

    const getMinimumInvestmentAmount = async () => {
        const result = (await readContract(publicClient, {
            abi: PivotTopicABI,
            address: contractAddress,
            functionName: "getFixedInvestment",
            args: [id],
        })) as bigint;
        return result;
    };

    const getContractData = async (topic: TopicDetail, isInitial?: boolean) => {
        const tokenInfo = isInitial ? await getTokenInfo() : { tokenAddress: topic.tokenAddress, tokenSymbol: topic.tokenSymbol, tokenDecimals: topic.tokenDecimals };
        const minimumInvestmentAmount = isInitial && (await getMinimumInvestmentAmount());
        const myTokenBalance = await getMyTokenBalance(topic.tokenAddress ?? (tokenInfo as { tokenAddress: Address }).tokenAddress);
        const myInvestment = await getMyInvestment();
        const myIncome = await getMyIncome(address as Address, id!);

        setTopic({
            ...topic,
            ...(isInitial && tokenInfo),
            ...(isInitial && { minimumInvestmentAmount: formatUnits((minimumInvestmentAmount as bigint) ?? BigInt(0), tokenInfo.tokenDecimals) }),
            myTokenBalance: formatUnits(myTokenBalance ?? BigInt(0), tokenInfo.tokenDecimals),
            myInvestment: formatUnits(myInvestment ?? BigInt(0), tokenInfo.tokenDecimals),
            myIncome: formatUnits(myIncome ?? BigInt(0), tokenInfo.tokenDecimals),
        });
    };

    useEffect(() => {
        // Mock data - replace with actual API call
        const mockTopic = {
            id: "1",
            title: "Emerging DeFi Project Investment",
            content: "This is a promising DeFi project with an innovative tokenomics model...",
            author: "0x1234...5678",
            image: "https://placeholder.com/800x400",
            totalInvestment: 1000000,
            investmentAmount: 1000,
            currentPosition: 500,
            commentsCount: 42,
            publishTime: "2024-01-13 10:00",
            tokenName: "USDT",
            tokenLogo: "https://placeholder.com/token-logo.png",
            comments: [
                {
                    id: "1",
                    author: "0xabcd...efgh",
                    content: "Great investment opportunity!",
                    timestamp: "2024-01-13 11:00",
                },
            ],
        };
        const newTopic = { ...(topic as TopicDetail), ...mockTopic };
        setTopic(newTopic);
        getContractData(newTopic, true);
    }, [id]);

    const openNotificationWithIcon = (description: string) => {
        notification.error({
            message: "error",
            description,
            duration: 3,
        });
    };

    const checkInvestmentAmount = async (investmentAmount: string) => {
        if (Number(investmentAmount) > 0 && BigNumber(investmentAmount).mod(topic!.minimumInvestmentAmount).toNumber() == 0) {
            return true;
        }
        return false;
    };

    const checkBalance = async (paymentAmount: string) => {
        if (topic?.myTokenBalance && BigNumber(topic?.myTokenBalance).gte(paymentAmount)) {
            return true;
        }
        return false;
    };

    const handleInvestment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isPending) {
            return;
        }
        setIsPending(true);
        setHash("");
        try {
            await preProcessing();

            const tokenAddress = topic?.tokenAddress;
            const investmentAmountLocaleString = Number(investmentAmount).toLocaleString(undefined, { useGrouping: false, minimumFractionDigits: 0, maximumFractionDigits: 18 });

            if (!tokenAddress) {
                return;
            }

            if (!(await checkBalance(investmentAmountLocaleString))) {
                openNotificationWithIcon("Insufficient balance");
                setIsPending(false);
                return;
            }

            if (!(await checkInvestmentAmount(investmentAmountLocaleString))) {
                openNotificationWithIcon("It is not a multiple of the creator's investment amount");
                setIsPending(false);
                return;
            }

            const result = (await readContract(publicClient, {
                abi: ERC20ABI,
                address: tokenAddress,
                functionName: "allowance",
                args: [address, contractAddress],
            })) as bigint;

            console.log(investmentAmountLocaleString, formatUnits(result, topic.tokenDecimals));

            const walletClient = await getWagmiWalletClient();

            if (BigNumber(investmentAmountLocaleString).gt(formatUnits(result, topic.tokenDecimals))) {
                const hash = await writeContract(walletClient, {
                    address: tokenAddress,
                    abi: ERC20ABI,
                    functionName: "approve",
                    args: [contractAddress, maxUint256],
                });
                console.log({ hash });
                const res = await waitForTransactionReceipt(publicClient, { hash });
                console.log({ res });
            }

            const hash = await writeContract(walletClient, {
                address: contractAddress,
                abi: PivotTopicABI,
                functionName: "invest",
                args: [id, parseUnits(investmentAmountLocaleString, topic.tokenDecimals)],
            });
            setHash(hash);
            console.log({ hash });
            const res = await waitForTransactionReceipt(publicClient, { hash });
            console.log({ res });
            //navigate('/');
            setIsPending(false);

            notification.success({
                message: "success",
                description: "Successfully invested",
                duration: 3,
            });
            getContractData(topic);
        } catch (error) {
            console.log(error);
            setIsPending(false);
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isWithdrawalPending) {
            return;
        }
        setIsWithdrawalPending(true);
        setWithdrawalHash("");
        try {
            await preProcessing();

            const tokenAddress = topic?.tokenAddress;

            if (!tokenAddress) {
                return;
            }

            const walletClient = await getWagmiWalletClient();

            const hash = await writeContract(walletClient, {
                address: contractAddress,
                abi: PivotTopicABI,
                functionName: "withdraw",
                args: [id],
            });
            setWithdrawalHash(hash);
            const res = await waitForTransactionReceipt(publicClient, { hash });
            console.log({ res });
            //navigate('/');
            setIsWithdrawalPending(false);

            notification.success({
                message: "success",
                description: "Successfully withdrawn",
                duration: 3,
            });
            getContractData(topic);
        } catch (error) {
            console.log(error);
            setIsWithdrawalPending(false);
        }
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        // Add comment submission logic here
        console.log("New comment:", newComment);
        setNewComment("");
    };

    if (!topic) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="topic-detail">
            <div className="topic-header">
                <h1>{topic.title}</h1>
                <div className="topic-meta">
                    <span className="author">Author: {topic.author}</span>
                    <span className="publish-time">Published: {topic.publishTime}</span>
                    <span>Total Investment: {topic.totalInvestment}</span>
                    <span>Current Position: {topic.currentPosition}</span>
                </div>
            </div>

            <div className="topic-image">
                <img src={topic.image} alt={topic.title} />
            </div>

            <div className="topic-content">
                <p>{topic.content}</p>
            </div>

            <div className="investment-section">
                <div className="investment-info">
                    <h2>Invest</h2>

                    <div className="investment-stats-wrapper">
                        <div className="investment-stats">
                            <span>Minimum Investment Amount: {formatDecimal(topic.minimumInvestmentAmount)}</span>
                            <span>{topic.tokenSymbol}</span>
                        </div>

                        <div className="investment-stats">
                            <span>My Token Balance: {formatDecimal(topic.myTokenBalance)}</span>
                            <span>{topic.tokenSymbol}</span>
                        </div>

                        <div className="investment-stats">
                            <span>My Investment: {formatDecimal(topic.myInvestment)}</span>
                            <span>{topic.tokenSymbol}</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleInvestment} className="investment-form">
                    <input type="number" value={investmentAmount} onChange={(e) => setInvestmentAmount(e.target.value)} placeholder="Enter investment amount" required />
                    <button type="submit" disabled={!topic.tokenAddress}>
                        {isPending ? "Investing..." : "Invest"}{" "}
                    </button>
                </form>
                {hash && <div>Transaction Hash of Investing the PIVOT Topic: {hash}</div>}
            </div>

            <div className="investment-section">
                <div className="investment-info">
                    <h2>Withdraw</h2>

                    <div className="investment-stats-wrapper">
                        <div className="investment-stats">
                            <span>Withdrawable amount: {formatDecimal(topic.myIncome)}</span>
                            <span>{topic.tokenSymbol}</span>
                        </div>

                        <div className="investment-stats">
                            <span>My Token Balance: {formatDecimal(topic.myTokenBalance)}</span>
                            <span>{topic.tokenSymbol}</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleWithdraw} className="investment-form">
                    <button type="submit" disabled={!topic.tokenAddress}>
                        {isWithdrawalPending ? "Withdrawing..." : "Withdraw"}{" "}
                    </button>
                </form>
                {withdrawalHash && <div>Transaction Hash of Withdrawal: {withdrawalHash}</div>}
            </div>

            <div className="comments-section">
                <h2>Comments ({topic.commentsCount})</h2>
                <form onSubmit={handleComment} className="comment-form">
                    <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." required />
                    <button type="submit">Submit Comment</button>
                </form>

                <div className="comments-list">
                    {topic.comments.map((comment) => (
                        <div key={comment.id} className="comment">
                            <div className="comment-header">
                                <span className="comment-author">{comment.author}</span>
                                <span className="comment-time">{comment.timestamp}</span>
                            </div>
                            <p className="comment-content">{comment.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
