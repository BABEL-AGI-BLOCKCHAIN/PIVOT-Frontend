import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import CommentComponent, { Comment } from "src/components/Comment";
import Stats from "src/components/Stats";
import Trade from "src/components/Trade";
import { ENDPOINTS } from "src/config";
import { useChainId } from "src/hooks/useChainId";
import { useContractAddress } from "src/hooks/useContractAddress";
import { usePreProcessing } from "src/hooks/usePreProcessing";
import { getWagmiPublicClient } from "src/utils";
import { Address, formatUnits } from "viem";
import { readContract } from "viem/actions";
import { useAccount } from "wagmi";
import PivotTopicABI from "../contracts/PivotTopic_ABI.json";
import ERC20ABI from "../contracts/TopicERC20_ABI.json";
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
        const fetchTopic = async () => {
            try {
                const response = await axios.get(ENDPOINTS.GET_TOPIC_BY_ID(id));
                console.log("response", response);
                const topicData = response.data.topic;
                setTopic(topicData);
                getContractData(topicData, true);
            } catch (error) {
                console.error('Error fetching topic:', error);
            }
        };

        fetchTopic();
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
