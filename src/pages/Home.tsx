import axios from 'axios';
import { useEffect, useState } from "react";
import { ENDPOINTS } from '../config';
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

const fetchTopics = async (page = 1, limit = 10, sortField = 'blockTimeStamp', sortOrder = 'desc') => {
    try {
        const response = await axios.get(ENDPOINTS.GET_TOPICS, {
            params: {
                page,
                limit,
                sortField,
                sortOrder,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching topics:', error);
        return { topics: [], pagination: { totalTopics: 0, currentPage: 1, totalPages: 1 } };
    }
};

export default function Home() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const loadTopics = async () => {
            const data = await fetchTopics(page);
            setTopics(data.topics);
            setTotalPages(data.pagination.totalPages);
        };

        loadTopics();
    }, [page]);


    return (
        <div className="pt-20 max-w-6xl mx-auto px-4">
            <div className="grid gap-8 my-6 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
                {topics.map((topic) => (
                    <TopicCard key={topic.id} {...topic} />
                ))}
            </div>
            <div className="flex justify-center mt-6">
                <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="px-4 py-2 mx-2 bg-gray-300 rounded-md"
                >
                    Previous
                </button>
                <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className="px-4 py-2 mx-2 bg-gray-300 rounded-md"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
