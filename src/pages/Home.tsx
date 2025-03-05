import { useState, useEffect } from "react";
import TopicCard from "../components/TopicCard";

interface Topic {
    id: string;
    title: string;
    content: string;
    creator: string;
    image: string;
    totalInvestment: number;
    investmentAmount: number;
    currentPosition: number;
    commentsCount: number;
    publishTime: string;
    tokenSymbol: string;
}

export default function Home() {
    const [topics, setTopics] = useState<Topic[]>([]);

    useEffect(() => {
        // 这里模拟从API获取数据
        // 实际应用中需要替换为真实的API调用
        const mockTopics: Topic[] = [
            {
                id: "1",
                title: "Investment opportunities: Emerging DeFi projects",
                content: "This is a promising DeFi project with an innovative token economy model...",
                creator: "0x1234...5678",
                image: "https://pbs.twimg.com/media/GgOZFNqXQAA5RGQ?format=jpg&name=small",
                totalInvestment: 1000000,
                investmentAmount: 1000,
                currentPosition: 500,
                commentsCount: 42,
                publishTime: "2024-01-13 10:00",
                tokenSymbol: "USDT",
            },
            // 可以添加更多模拟数据
        ].flatMap((item) => Array(9).fill(item));

        setTopics(mockTopics);
    }, []);

    return (
        <div className="pt-20 max-w-6xl mx-auto px-4">
            <div className="grid gap-8 my-6 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
                {topics.map((topic) => (
                    <TopicCard key={topic.id} {...topic} />
                ))}
            </div>
        </div>
    );
}
