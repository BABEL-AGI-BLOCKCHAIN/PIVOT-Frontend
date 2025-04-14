import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ENDPOINTS } from "../config";
import { Topic } from "src/pages/Home";
import { truncateAddress } from "src/utils";
import { config } from "src/wagmi";
import { useReadContracts } from "wagmi";
import ERC20ABI from "../contracts/TopicERC20_ABI.json";
import { Address, formatUnits } from "viem";

// const fetchComments = async (topicId: string) => {
//     try {
//         const response = await axios.get(ENDPOINTS.GET_COMMENTS(topicId));
//         return response.data;
//     } catch (error) {
//         console.error("Error fetching comments:", error);
//         return [];
//     }
// };

export default function TopicCard({ id, createTopic, metadata, totalInvestment, investmentAmount, currentPosition, investorCount, commentCount, blockTimeStamp }: Topic) {
    // const [comments, setComments] = useState([]);
    const res = useReadContracts({
        contracts: [
            {
                abi: ERC20ABI as any[],
                address: createTopic.tokenAddress as Address,
                functionName: "symbol",
            },
            {
                abi: ERC20ABI,
                address: createTopic.tokenAddress as Address,
                functionName: "decimals",
            },
        ],
    });
    console.log(res.data);

    // useEffect(() => {
    //     const loadComments = async () => {
    //         try {
    //             const data = await fetchComments(id);
    //             console.log("data", data);
    //             setComments(data);
    //         } catch (error) {
    //             console.error("Error loading comments:", error);
    //             setComments([]);
    //         }
    //     };

    //     loadComments();
    // }, [id]);

    // const actualCommentsCount = comments.length || 0;

    return (
        <Link to={`/topic/${id}`} className="h-fit bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {metadata?.mediaCID && (
                <div className="w-full h-52 overflow-hidden">
                    <img src={metadata?.mediaCID ? `${process.env.REACT_APP_IPFS_GATEWAY}${metadata.mediaCID}` : ""} className="w-full h-full object-cover" />
                </div>
            )}
            <div className="p-4">
                <h2 className="text-lg font-semibold mb-2">{metadata?.topicTitle}</h2>
                <p className="text-gray-600 mb-4">{metadata?.topicContent}</p>
                <div className="text-sm text-gray-700 space-y-2">
                    <div className="flex justify-between">
                        <span className="font-medium">Current Position:</span>
                        <span>{currentPosition}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Minimum Investment Amount:</span>
                        <span>
                            {formatUnits(BigInt(createTopic.investment), (res.data?.[1]?.result as number) ?? 18)} {(res.data?.[0]?.result && "$" + (res.data?.[0]?.result as unknown as string)) ?? ""}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Total Investment:</span>
                        <span>
                            {formatUnits(BigInt(totalInvestment), (res.data?.[1]?.result as number) ?? 18)} {(res.data?.[0]?.result && "$" + (res.data?.[0]?.result as unknown as string)) ?? ""}
                        </span>
                    </div>{" "}
                    <div className="flex justify-between">
                        <span className="font-medium">Token Address:</span>
                        <span>{truncateAddress(createTopic.tokenAddress)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Creator:</span>
                        <span>{truncateAddress(createTopic.promoterId)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Twitter:</span>
                        <div className="flex items-center gap-1">
                            {createTopic.promoter.avatar && <img src={createTopic.promoter.avatar} className="rounded-full size-6" />}
                            <span>{createTopic.promoter.twitterHandle}</span>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-200">
                    <Link to={`/topic/${id}`} className="text-blue-600 hover:underline">
                        Comments ({commentCount})
                    </Link>
                    <span className="text-gray-500 text-sm">{new Date(blockTimeStamp).toLocaleString()}</span>
                </div>
            </div>
        </Link>
    );
}
