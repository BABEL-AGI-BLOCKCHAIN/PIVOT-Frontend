import { hash } from "crypto";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { TopicDetail } from "src/pages/TopicDetail";

interface StatsProps {
    topic: TopicDetail;
}

export default function Stats({ topic }: StatsProps) {
    const statsList = [
        { title: "Creator", value: topic.author, isLink: true },
        { title: "Release Time", value: topic.publishTime },
        { title: "Current Position", value: topic.currentPosition },
        { title: "Total Investment", value: `${topic.totalInvestment} ${topic.tokenSymbol}` },
    ];
    return (
        <div className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow-md border border-gray-100">
            {statsList.map((item) => (
                <div className="flex justify-between">
                    <span>{item.title}: </span>
                    <span>
                        {item.value}
                        {item.isLink && (
                            <Link
                                to={`https://${process.env.REACT_APP_ENABLE_TESTNETS === "true" ? "sepolia." : ""}etherscan.io/address/${item.value}`}
                                target="_blank"
                                className="inline-flex relative top-[3px]"
                            >
                                <ArrowUpRight className="h-[18px] text-blue-600" />
                            </Link>
                        )}
                    </span>
                </div>
            ))}
        </div>
    );
}
