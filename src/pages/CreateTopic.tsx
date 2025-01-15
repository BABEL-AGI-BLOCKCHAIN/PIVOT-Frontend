import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateTopic.css';

export default function CreateTopic() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',
    investmentAmount: '',
    tokenAddress: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add topic creation logic here
    console.log('Form submitted:', formData);
    navigate('/');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="create-topic">
      <form onSubmit={handleSubmit} className="create-topic-form">
        <h1>Create New Topic</h1>
        
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Image URL</label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="investmentAmount">Investment Amount</label>
          <input
            type="number"
            id="investmentAmount"
            name="investmentAmount"
            value={formData.investmentAmount}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="tokenAddress">ERC20 Token Contract Address</label>
          <input
            type="text"
            id="tokenAddress"
            name="tokenAddress"
            value={formData.tokenAddress}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="submit-button">
          Create Topic
        </button>
      </form>
    </div>
  );
}

