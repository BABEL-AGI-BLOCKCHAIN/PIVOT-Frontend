import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { usePreProcessing } from "src/hooks/usePreProcessing";
import { readContract } from "viem/actions";
import PivotTopicABI from "../contracts/PivotTopic_ABI.json";
import { getWagmiPublicClient } from "src/utils";
import { Address, formatUnits } from "viem";
import { useAccount } from "wagmi";
import ERC20ABI from "../contracts/TopicERC20_ABI.json";
import { useContractAddress } from "src/hooks/useContractAddress";
import Trade from "src/components/Trade";
import CommentComponent, { Comment } from "src/components/Comment";
import Stats from "src/components/Stats";
import { useChainId } from "src/hooks/useChainId";

export interface TopicDetail {
    id: string;
    title: string;
    content: string;
    author: string;
    image: string;
    totalInvestment: number;
    minimumInvestmentAmount: string;
    currentPosition: number;
    myInvestment: string;
    myWithdrawableAmount: string;
    myTotalIncome: string;
    myPositionsStats: {
        withdrawableAmount: string;
        totalIncome: string;
        position: number;
        investmentDate: string;
    }[];
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

export default function TopicDetail() {
    const { id } = useParams();
    const [topic, setTopic] = useState<TopicDetail>();
    const [newComment, setNewComment] = useState("");
    const [investmentAmount, setInvestmentAmount] = useState("");

    const preProcessing = usePreProcessing();
    const [isPending, setIsPending] = useState(false);
    const [isWithdrawalPending, setIsWithdrawalPending] = useState(false);

    const [hash, setHash] = useState("");
    const [withdrawalHash, setWithdrawalHash] = useState("");
    const { address } = useAccount();
    const chainId = useChainId();

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

    const getMyPositionWithdrawnAmount = async (position: number) => {
        if (!address) {
            return;
        }
        const result = (await readContract(publicClient, {
            abi: PivotTopicABI,
            address: contractAddress,
            functionName: "_positionReceivedIncome",
            args: [address, id!, position],
        })) as bigint;
        console.log({ result });
        return result;
    };

    const getMyWithdrawnAmount = async () => {
        if (!address) {
            return;
        }
        const result = (await readContract(publicClient, {
            abi: PivotTopicABI,
            address: contractAddress,
            functionName: "_receivedIncome",
            args: [address, id!],
        })) as bigint;
        console.log({ result });
        return result;
    };

    const getMyPositions = async () => {
        const positions = [1, 2, 3, 4];
        return positions;
    };

    const getMyPositionsStats = async (positions: number[], fixedInvestment: bigint, currentPosition: bigint) => {
        const res = await Promise.allSettled(
            positions.map(async (item) => {
                const positionTotalIncome = getMyPositionIncome(fixedInvestment, item, currentPosition);
                const withdrawnAmount = await getMyPositionWithdrawnAmount(item);
                const withdrawFee = positionTotalIncome > fixedInvestment ? ((positionTotalIncome - fixedInvestment) * BigInt(3)) / BigInt(1000) : BigInt(0);
                return {
                    position: item,
                    investmentDate: "2024-01-13 10:00",
                    totalIncome: positionTotalIncome - withdrawFee,
                    withdrawableAmount: positionTotalIncome - withdrawnAmount! - withdrawFee,
                };
            })
        );

        return res.filter((item) => item.status === "fulfilled").map((item) => item.value);
    };

    const getMyTotalIncome = (myPositions: number[], fixedInvestment: bigint, currentPosition: bigint) => {
        const totalIncome = myPositions.reduce((acc, item) => {
            return acc + getMyPositionIncome(fixedInvestment, item, currentPosition);
        }, BigInt(0));

        return totalIncome;
    };

    const getMyPositionIncome = (fixedInvestment: bigint, position: number, currentPosition: bigint) => {
        let sum = BigInt(0);
        let _fixedInvestment = fixedInvestment;
        let _position = Number(position);
        let _currentPosition = Number(currentPosition);

        for (let i = _position; i <= _currentPosition; i++) {
            sum = sum += _fixedInvestment / BigInt(i);
        }

        return sum;
    };

    const getTokenInfo = async () => {
        console.log({ contractAddress });
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

    const getCurrentPosition = async () => {
        const result = (await readContract(publicClient, {
            abi: PivotTopicABI,
            address: contractAddress,
            functionName: "_position",
            args: [id],
        })) as bigint;
        return result;
    };

    const getContractData = async (topic: TopicDetail, isInitial?: boolean) => {
        const tokenInfo = isInitial ? await getTokenInfo() : { tokenAddress: topic.tokenAddress, tokenSymbol: topic.tokenSymbol, tokenDecimals: topic.tokenDecimals };
        const minimumInvestmentAmount = await getMinimumInvestmentAmount();
        const currentPosition = await getCurrentPosition();
        const myTokenBalance = await getMyTokenBalance(topic.tokenAddress ?? (tokenInfo as { tokenAddress: Address }).tokenAddress);
        const myInvestment = await getMyInvestment();
        // const myWithdrawnAmount = await getMyWithdrawnAmount();
        const myPositions = await getMyPositions();
        const myPositionsStats = await getMyPositionsStats(myPositions, minimumInvestmentAmount, currentPosition);
        // const myTotalIncome = getMyTotalIncome(myPositions, minimumInvestmentAmount, currentPosition);
        setTopic({
            ...topic,
            ...(isInitial && tokenInfo),
            minimumInvestmentAmount: formatUnits(minimumInvestmentAmount ?? BigInt(0), tokenInfo.tokenDecimals),
            myTokenBalance: formatUnits(myTokenBalance ?? BigInt(0), tokenInfo.tokenDecimals),
            myInvestment: formatUnits(myInvestment ?? BigInt(0), tokenInfo.tokenDecimals),
            // myWithdrawableAmount: formatUnits(myTotalIncome - (myWithdrawnAmount ?? BigInt(0)), tokenInfo.tokenDecimals),
            myPositionsStats: myPositionsStats.map((item) => ({
                ...item,
                withdrawableAmount: formatUnits(item.withdrawableAmount, tokenInfo.tokenDecimals),
                totalIncome: formatUnits(item.totalIncome, tokenInfo.tokenDecimals),
            })),
            myWithdrawableAmount: formatUnits(
                myPositionsStats.reduce((acc, item) => {
                    return acc + item.withdrawableAmount;
                }, BigInt(0)),
                tokenInfo.tokenDecimals
            ),
            myTotalIncome: formatUnits(
                myPositionsStats.reduce((acc, item) => {
                    return acc + item.totalIncome;
                }, BigInt(0)),
                tokenInfo.tokenDecimals
            ),
        });
    };

    useEffect(() => {
        // Mock data - replace with actual API call
        const mockTopic = {
            id: "1",
            title: "Emerging DeFi Project Investment",
            content: "This is a promising DeFi project with an innovative tokenomics model...",
            author: "0x1234...5678",
            image: "https://pbs.twimg.com/media/GgOZFNqXQAA5RGQ?format=jpg&name=small",
            tokenSymbol: "",
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
            ].flatMap((item) => Array(9).fill(item)),
        };
        const newTopic = { ...(topic as TopicDetail), ...mockTopic };
        setTopic(newTopic);
        getContractData(newTopic, true);
    }, [id]);

    useEffect(() => {
        if (!topic) {
            return;
        }
        getContractData(topic, true);
    }, [address]);

    if (!topic) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="pt-20 max-w-6xl mx-auto px-4 pb-8">
            <div className="mb-8">
                {/* <h1 className="text-2xl font-bold mb-4">{topic.title}</h1> */}
                {/* <div className="flex gap-4 text-gray-600 text-sm">
                    <span className="font-medium">Author: {topic.author}</span>
                    <span>Published: {topic.publishTime}</span>
                    <span>Total Investment: {topic.totalInvestment}</span>
                    <span>Current Position: {topic.currentPosition}</span>
                </div> */}
            </div>
            <div className="flex gap-6 ">
                <div className="flex-1">
                    <div>
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                            <h1 className="text-2xl font-bold mb-4">{topic.title}</h1>
                            <div className="mb-8 leading-relaxed">
                                <p>{topic.content}</p>
                            </div>
                            <div className="mb-8">
                                <img src={topic.image} alt={topic.title} className="max-h-64 object-cover rounded-lg" />
                            </div>
                            <CommentComponent topic={topic} />
                        </div>
                    </div>
                </div>
                <div className="w-[400px]">
                    <div>
                        <Trade topic={topic} getContractData={getContractData} />
                    </div>
                    <div className="pt-6">
                        <Stats topic={topic} />
                    </div>
                </div>
            </div>
        </div>
    );
}
