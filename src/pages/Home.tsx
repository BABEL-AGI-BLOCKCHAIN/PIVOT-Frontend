import axios from "axios";
import { useEffect, useState } from "react";
import { ENDPOINTS } from "../config";
import TopicCard from "../components/TopicCard";
import Loading from "src/components/ui/loading";
import Masonry from "react-masonry-css";

export interface Topic {
    id: string;
    creator: string;
    image: string;
    createTopic: {
        investment: string;
        promoterId: string;
        tokenAddress: string;
        promoter: {
            avatar?: string;
            twitterHandle?: string;
        };
    };
    metadata: {
        mediaCID: string;
        topicContent: string;
        topicHash: string;
        topicId: string;
        topicTitle: string;
    };
    totalInvestment: number;
    investmentAmount: number;
    investorCount: number;
    currentPosition: number;
    commentCount: number;
    blockTimeStamp: string;
}

const fetchTopics = async (page = 1, limit = 9, sortField = "blockTimeStamp", sortOrder = "desc") => {
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
        console.error("Error fetching topics:", error);
        return { topics: [], pagination: { totalTopics: 0, currentPage: 1, totalPages: 1 } };
    }
};

export default function Home() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        const loadTopics = async () => {
            if (isPending) {
                return;
            }

            setIsPending(true);
            try {
                const data = await fetchTopics(page);
                setTopics(data.topics);
                setTotalPages(data.pagination.totalPages);
            } catch (error) {}

            setIsPending(false);
        };

        loadTopics();
    }, [page]);

    if (isPending) {
        return <Loading />;
    }

    return (
        <div className="pt-20 max-w-6xl mx-auto px-4">
            {/* <div className="grid gap-8 my-6 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
                {topics.map((topic) => (
                    <TopicCard key={topic.id} {...topic} />
                ))}
            </div> */}
            <Masonry
                breakpointCols={{
                    default: 3,
                    1024: 2,
                    768: 1,
                }}
                className="flex gap-4 w-auto"
                columnClassName=""
            >
                {topics.map((item) => (
                    <div key={item.id} className="mb-4 rounded-xl bg-white shadow p-4">
                        <TopicCard key={item.id} {...item} />
                    </div>
                ))}
            </Masonry>
            <div className="flex justify-center items-center mt-6 gap-6">
                <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1} className="px-4 py-2 mx-2 bg-gray-300 rounded-md w-24">
                    Previous
                </button>
                {page}
                <button onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} disabled={page === totalPages} className="px-4 py-2 mx-2 bg-gray-300 rounded-md w-24">
                    Next
                </button>
            </div>
        </div>
    );
}
