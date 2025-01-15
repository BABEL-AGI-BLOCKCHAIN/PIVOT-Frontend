import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './TopicDetail.css';

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

interface TopicDetail {
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
  comments: Comment[];
}

export default function TopicDetail1() {
  const { id } = useParams();
  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [newComment, setNewComment] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockTopic: TopicDetail = {
      id: '1',
      title: 'Emerging DeFi Project Investment',
      content: 'This is a promising DeFi project with an innovative tokenomics model...',
      author: '0x1234...5678',
      image: 'https://placeholder.com/800x400',
      totalInvestment: 1000000,
      investmentAmount: 1000,
      currentPosition: 500,
      commentsCount: 42,
      publishTime: '2024-01-13 10:00',
      tokenName: 'USDT',
      tokenLogo: 'https://placeholder.com/token-logo.png',
      comments: [
        {
          id: '1',
          author: '0xabcd...efgh',
          content: 'Great investment opportunity!',
          timestamp: '2024-01-13 11:00'
        }
      ]
    };

    setTopic(mockTopic);
  }, [id]);

  const handleInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add investment logic here
    console.log('Investment amount:', investmentAmount);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add comment submission logic here
    console.log('New comment:', newComment);
    setNewComment('');
  };

  if (!topic) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="topic-detail">
      <div className="topic-header">
        <h1>{topic.title}</h1>
        <div className="topic-meta">
          <span className="author">Author: {topic.author}</span>
          <span className="publish-time">Published: {topic.publishTime}</span>
        </div>
      </div>

      <div className="topic-image">
        <img src={topic.image} alt={topic.title} />
      </div>

      <div className="topic-content">
        <p>{topic.content}</p>
      </div>

      <div className="investment-section">
        <div className="investment-info">
          <div className="token-info">
            <img src={topic.tokenLogo} alt={topic.tokenName} className="token-logo" />
            <span>{topic.tokenName}</span>
          </div>
          <div className="investment-stats">
            <span>Total Investment: {topic.totalInvestment}</span>
            <span>Investment Amount: {topic.investmentAmount}</span>
            <span>Current Position: {topic.currentPosition}</span>
          </div>
        </div>

        <form onSubmit={handleInvestment} className="investment-form">
          <input
            type="number"
            value={investmentAmount}
            onChange={(e) => setInvestmentAmount(e.target.value)}
            placeholder="Enter investment amount"
            required
          />
          <button type="submit">Invest</button>
        </form>
      </div>

      <div className="comments-section">
        <h2>Comments ({topic.commentsCount})</h2>
        <form onSubmit={handleComment} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            required
          />
          <button type="submit">Submit Comment</button>
        </form>

        <div className="comments-list">
          {topic.comments.map((comment) => (
            <div key={comment.id} className="comment">
              <div className="comment-header">
                <span className="comment-author">{comment.author}</span>
                <span className="comment-time">{comment.timestamp}</span>
              </div>
              <p className="comment-content">{comment.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

