import { Link } from "react-router-dom";

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

export default function TopicCard({ id, title, content, creator, image, totalInvestment, investmentAmount, currentPosition, commentsCount, publishTime, tokenSymbol }: TopicCardProps) {
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
                        Comments ({commentsCount})
                    </Link>
                    <span className="text-gray-500 text-sm">{publishTime}</span>
                </div>
            </div>
        </Link>
    );
}
