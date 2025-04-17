import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useContractAddress } from "src/hooks/useContractAddress";
import { TopicDetail } from "src/pages/TopicDetail";
import { truncateAddress } from "src/utils";

interface StatsProps {
    topic?: TopicDetail;
}

export default function Stats({ topic }: StatsProps) {
    const ca = useContractAddress();
    const statsList = [
        { title: "PIVOT CA", value: ca, isLink: true, isAddress: true },
        { title: "ERC-20 Token CA", value: topic?.tokenAddress, isLink: true, isAddress: true },
        { title: "Creator", value: topic?.creator, isLink: true, isAddress: true },
        { title: "Twitter", value: topic?.createTopic.promoter.twitterHandle, isLink: true, isTwitter: true, icon: topic?.createTopic.promoter.avatar },
        { title: "Release Time", value: topic?.blockTimeStamp },
        { title: "Current Position", value: topic?.currentPosition },
        { title: "Total Investment", value: `${topic?.totalInvestment}${topic?.tokenSymbol ? "&nbsp;&nbsp;$" : ""}${topic?.tokenSymbol ?? ""}` },
    ].filter((item) => item.value);
    
    return (
        <div className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow-md border border-gray-100">
            {statsList.map((item) => (
                <div className="flex justify-between">
                    <span>{item.title}: </span>
                    <span className="flex gap-1">
                        {item.icon && <img src={item.icon} className="rounded-full size-6" />}
                        <span dangerouslySetInnerHTML={{ __html: item.isAddress ? truncateAddress(item.value) : (item.value as string) }}></span>
                        {item.isLink && (
                            <Link
                                to={item.isTwitter ? `https://x.com/${item.value}` : `https://${process.env.REACT_APP_ENABLE_TESTNETS === "true" ? "sepolia." : ""}etherscan.io/address/${item.value}`}
                                target="_blank"
                                className="inline-flex relative top-[3px]"
                            >
                                <ArrowUpRight className="size-[18px] text-blue-600" />
                            </Link>
                        )}
                    </span>
                </div>
            ))}
        </div>
    );
}
