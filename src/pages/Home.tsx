import { useState, useEffect } from 'react';
import TopicCard from '../components/TopicCard';
import './Home.css';

interface Topic {
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

export default function Home() {
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    // 这里模拟从API获取数据
    // 实际应用中需要替换为真实的API调用
    const mockTopics: Topic[] = [
      {
        id: '1',
        title: 'Investment opportunities: Emerging DeFi projects',
        content: 'This is a promising DeFi project with an innovative token economy model...',
        author: '0x1234...5678',
        image: 'https://placeholder.com/800x400',
        totalInvestment: 1000000,
        investmentAmount: 1000,
        currentPosition: 500,
        commentsCount: 42,
        publishTime: '2024-01-13 10:00',
        tokenName: 'USDT',
        tokenLogo: 'https://placeholder.com/token-logo.png',
      },
      // 可以添加更多模拟数据
    ];

    setTopics(mockTopics);
  }, []);

  return (
    <div className="home">
      <div className="topics-container">
        {topics.map(topic => (
          <TopicCard key={topic.id} {...topic} />
        ))}
      </div>
    </div>
  );
}

