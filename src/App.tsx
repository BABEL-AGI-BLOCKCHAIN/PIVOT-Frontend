
import Header from './components/Header';
import Home from './pages/Home';
import CreateTopic from './pages/CreateTopic';
import TopicDetail from './pages/TopicDetail';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TwitterCallback from './pages/TwitterCallback';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateTopic />} />
          <Route path="/topic/:id" element={<TopicDetail />} />
          <Route path="/twitter/callback" element={<TwitterCallback />} />
        </Routes>
      </div>
      <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        padding: 12,
      }}
    >
      
    </div>
    </Router>
    
  );
};

export default App;
