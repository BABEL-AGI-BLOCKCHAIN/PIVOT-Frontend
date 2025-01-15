import { Link } from 'react-router-dom';
import './TopicCard.css';

interface TopicCardProps {
  id: string;
  title: string;
  content: string;
  author: string;
  image: string;
  totalInvestment: number;
  investmentAmount: number;
  currentPosition: number;
  commentsCount: number;
  publishTime: string;
  tokenName: string;
  tokenLogo: string;
}

export default function TopicCard({
  id,
  title,
  content,
  author,
  image,
  totalInvestment,
  investmentAmount,
  currentPosition,
  commentsCount,
  publishTime,
  tokenName,
  tokenLogo,
}: TopicCardProps) {
  return (
    <div className="topic-card">
      <Link to={`/topic/${id}`} className="topic-image">
        <img src={image} alt={title} />
      </Link>
      <div className="topic-content">
        <Link to={`/topic/${id}`} className="topic-title">
          <h2>{title}</h2>
        </Link>
        <p>{content}</p>
        <div className="topic-meta">
          <div className="author">
            <span>Author: {author}</span>
          </div>
          <div className="investment-info">
            <div className="token-info">
              <img src={tokenLogo} alt={tokenName} className="token-logo" />
              <span>{tokenName}</span>
            </div>
            <div className="investment-stats">
              <span>Total Investment: {totalInvestment}</span>
              <span>Investment Amount: {investmentAmount}</span>
              <span>Current Position: {currentPosition}</span>
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
    </div>
  );
}

