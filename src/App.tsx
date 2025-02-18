
import Header from './components/Header';
import Home from './pages/Home';
import CreateTopic from './pages/CreateTopic';
import TopicDetail1 from './pages/TopicDetail';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateTopic />} />
          <Route path="/topic/:id" element={<TopicDetail1 />} />
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
