import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import axios from "axios";
import { ENDPOINTS } from '../config';

interface TopicCardProps {
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

const fetchComments = async (topicId: string) => {
    try {
        const response = await axios.get(ENDPOINTS.GET_COMMENTS(topicId));
        return response.data;
    } catch (error) {
        console.error('Error fetching comments:', error);
        return [];
    }
};

export default function TopicCard({ id, title, content, creator, image, totalInvestment, investmentAmount, currentPosition, commentsCount, publishTime, tokenSymbol }: TopicCardProps) {
    const [comments, setComments] = useState([]);

    useEffect(() => {
        const loadComments = async () => {
            try {
                const data = await fetchComments(id);
                console.log('data', data);
                setComments(data);
            } catch (error) {
                console.error('Error loading comments:', error);
                setComments([]);
            }
        };

        loadComments();
    }, [id]);

    const actualCommentsCount = comments.length || 0;

    return (
        <Link to={`/topic/${id}`} className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="w-full h-52 overflow-hidden">
                <img src={image} alt={title} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
                <h2 className="text-lg font-semibold mb-2">{title}</h2>
                <p className="text-gray-600 mb-4">{content}</p>
                <div className="text-sm text-gray-700 space-y-2">
                    <div className="flex justify-between">
                        <span className="font-medium">Current Position:</span>
                        <span>{currentPosition}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Minimum Investment Amount:</span>
                        <span>
                            {investmentAmount} {tokenSymbol}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Total Investment:</span>
                        <span>
                            {totalInvestment} {tokenSymbol}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Creator:</span>
                        <span>{creator}</span>
                    </div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-200">
                    <Link to={`/topic/${id}`} className="text-blue-600 hover:underline">
                        Comments ({actualCommentsCount})
                    </Link>
                    <span className="text-gray-500 text-sm">{publishTime}</span>
                </div>
            </div>
        </Link>
    );
}