import { Link } from "react-router-dom";
import "./TopicCard.css";

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
        <Link to={`/topic/${id}`} className="topic-card">
            <div className="topic-image">
                <img src={image} alt={title} />
            </div>
            <div className="topic-content">
                <h2>{title}</h2>
                <p>{content}</p>
                <div className="topic-meta">
                    <div className="investment-info">
                        <div className="investment-stats">
                            <div className="investment-stats-item">
                                <span>Current Position: </span>
                                <span>{currentPosition}</span>
                            </div>
                            <div className="investment-stats-item">
                                <span> Minimum Investment Amount: </span>
                                <span>
                                    {investmentAmount} {tokenSymbol}
                                </span>
                            </div>
                            <div className="investment-stats-item">
                                <span> Total Investment: </span>
                                <span>
                                    {totalInvestment} {tokenSymbol}
                                </span>
                            </div>
                            <div className="investment-stats-item">
                                <span> Creator: </span>
                                <span> {creator}</span>
                            </div>
                        </div>
                    </div>
                    <div className="topic-footer">
                        <Link to={`/topic/${id}`} className="comments-link">
                            Comments ({commentsCount})
                        </Link>
                        <span className="publish-time">{publishTime}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
