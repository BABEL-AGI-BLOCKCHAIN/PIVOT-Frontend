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
import { Address, formatUnits, zeroAddress } from "viem";
import { readContract } from "viem/actions";
import { useAccount } from "wagmi";
import PivotTopicABI from "../contracts/PivotTopic_ABI.json";
import ERC20ABI from "../contracts/TopicERC20_ABI.json";
import { readContracts } from "@wagmi/core";
import { config } from "src/wagmi";
import { Topic } from "./Home";
import { LoaderCircle } from "lucide-react";
import Loading from "src/components/ui/loading";

export interface TopicDetail extends Topic {
    id: string;
    minimumInvestmentAmount: string;
    withdrawalFee: string;
    myInvestment: string;
    myWithdrawableAmount: string;
    myTotalIncome: string;
    myPositionsStats: {
        withdrawableAmount: string;
        totalIncome: string;
        position: number;
        investmentDate: string;
    }[];
    myTokenBalance: string;
    tokenAddress: Address;
    tokenSymbol: string;
    tokenDecimals: number;
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
        if (!address || tokenAddress === zeroAddress) {
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
        // console.log({ result });
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
        // console.log({ result });
        return result;
    };

    const getMyPositions = async () => {
        try {
            const positions = (
                await axios.get(ENDPOINTS.GET_POSITIONS, {
                    params: {
                        id,
                        investor: address,
                    },
                })
            ).data.positions;

            return positions;
        } catch (error) {
            console.error("Error fetching positions:", error);
        }
    };

    const getMyPositionsStats = async (positions: { position: number; blockTimeStamp: string }[], fixedInvestment: bigint, currentPosition: bigint, withdrawalFee: bigint) => {
        const res = await Promise.allSettled(
            positions.map(async (item) => {
                const positionTotalIncome = getMyPositionIncome(fixedInvestment, item.position, currentPosition);
                const withdrawnAmount = await getMyPositionWithdrawnAmount(item.position);
                const withdrawFee = positionTotalIncome > fixedInvestment ? ((positionTotalIncome - fixedInvestment) * BigInt(withdrawalFee)) / BigInt(1000) : BigInt(0);
                return {
                    position: item.position,
                    investmentDate: item.blockTimeStamp,
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
        const tokenAddress = (await readContract(publicClient, {
            abi: PivotTopicABI,
            address: contractAddress,
            functionName: "topicCoin",
            args: [id],
        })) as Address;
        if (tokenAddress === zeroAddress) {
            return { tokenAddress, tokenSymbol: "", tokenDecimals: 18 };
        }
        // const tokenSymbol = (await readContract(publicClient, {
        //     abi: ERC20ABI,
        //     address: tokenAddress,
        //     functionName: "symbol",
        // })) as string;

        const res = await readContracts(config, {
            contracts: [
                {
                    abi: ERC20ABI as any[],
                    address: tokenAddress,
                    functionName: "symbol",
                },
                {
                    abi: ERC20ABI,
                    address: tokenAddress,
                    functionName: "decimals",
                },
            ],
        });

        return { tokenAddress, tokenSymbol: (res[0].result as string) ?? "", tokenDecimals: (res[1].result as number) ?? 18 };
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

    const getWithdrawalFee = async () => {
        const result = (await readContract(publicClient, {
            abi: PivotTopicABI,
            address: contractAddress,
            functionName: "_commissionrate",
            args: [],
        })) as bigint;
        return result;
    };

    const getContractData = async (topic?: TopicDetail, isInitial?: boolean) => {
        const tokenInfo = isInitial ? await getTokenInfo() : { tokenAddress: topic?.tokenAddress, tokenSymbol: topic?.tokenSymbol, tokenDecimals: topic?.tokenDecimals };
        const minimumInvestmentAmount = await getMinimumInvestmentAmount();
        const currentPosition = await getCurrentPosition();
        const withdrawalFee = await getWithdrawalFee();
        const myTokenBalance = await getMyTokenBalance(topic?.tokenAddress ?? (tokenInfo as { tokenAddress: Address }).tokenAddress);
        const myInvestment = await getMyInvestment();
        // const myWithdrawnAmount = await getMyWithdrawnAmount();
        const myPositions = await getMyPositions();
        const myPositionsStats = await getMyPositionsStats(myPositions, minimumInvestmentAmount, currentPosition, withdrawalFee);
        // const myTotalIncome = getMyTotalIncome(myPositions, minimumInvestmentAmount, currentPosition);
        const contractData = {
            ...topic,
            ...(isInitial && tokenInfo),
            withdrawalFee: `${Number(withdrawalFee) / 10}%`,
            minimumInvestmentAmount: formatUnits(minimumInvestmentAmount ?? BigInt(0), tokenInfo?.tokenDecimals ?? 18),
            currentPosition: Number(currentPosition),
            myTokenBalance: formatUnits(myTokenBalance ?? BigInt(0), tokenInfo?.tokenDecimals ?? 18),
            myInvestment: formatUnits(myInvestment ?? BigInt(0), tokenInfo?.tokenDecimals ?? 18),
            // myWithdrawableAmount: formatUnits(myTotalIncome - (myWithdrawnAmount ?? BigInt(0)), tokenInfo.tokenDecimals),
            myPositionsStats: myPositionsStats.map((item) => ({
                ...item,
                withdrawableAmount: formatUnits(item.withdrawableAmount, tokenInfo?.tokenDecimals ?? 18),
                totalIncome: formatUnits(item.totalIncome, tokenInfo?.tokenDecimals ?? 18),
            })),
            myWithdrawableAmount: formatUnits(
                myPositionsStats.reduce((acc, item) => {
                    return acc + item.withdrawableAmount;
                }, BigInt(0)),
                tokenInfo?.tokenDecimals ?? 18
            ),
            myTotalIncome: formatUnits(
                myPositionsStats.reduce((acc, item) => {
                    return acc + item.totalIncome;
                }, BigInt(0)),
                tokenInfo?.tokenDecimals ?? 18
            ),
        };

        setTopic(contractData as TopicDetail);
        return contractData;
    };

    useEffect(() => {
        const fetchTopic = async () => {
            try {
                const response: any = await axios.get(ENDPOINTS.GET_TOPIC_BY_ID(id!));
                console.log("response", response);
                const topicData: any = response.data.topic;
                const contractData = await getContractData(topicData, true);
                console.log({ contractData });
                setTopic({
                    ...contractData,
                    ...topicData,
                    creator: topicData.createTopic.promoterId,
                    blockTimeStamp: new Date(topicData.blockTimeStamp).toLocaleString(),
                    totalInvestment: formatUnits(topicData.totalInvestment, contractData?.tokenDecimals ?? 18),
                });
            } catch (error) {
                console.error("Error fetching topic:", error);
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
        return <Loading />;
    }

    return (
        <div className="pt-20 max-w-6xl mx-auto px-4 pb-8">
            <div className="flex gap-6 ">
                <div className="flex-1">
                    <div>
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                            <h1 className="text-2xl font-bold mb-4">{topic?.metadata?.topicTitle}</h1>
                            <div className="mb-8 leading-relaxed">
                                <p>{topic?.metadata?.topicContent}</p>
                            </div>
                            <div className="mb-8">
                                {/* <img src={topic.image} className="max-h-64 object-cover rounded-lg" /> */}
                                {topic?.metadata?.mediaCID && (
                                    <div className="w-full h-52 overflow-hidden">
                                        <img src={topic.metadata?.mediaCID ? `${process.env.REACT_APP_IPFS_GATEWAY}${topic.metadata.mediaCID}` : ""} className="w-full h-full object-cover" />
                                    </div>
                                )}
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
