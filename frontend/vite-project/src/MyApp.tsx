
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import ChatApp from './People';
import ModeratorDashboard from './Moderators';
import { Users, Shield } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav className="bg-white shadow-lg border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-slate-800">AlleAI Chat System</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                location.pathname === '/' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users size={20} />
              User Chat
            </Link>
            <Link
              to="/moderator"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                location.pathname === '/moderator' 
                  ? 'bg-green-100 text-green-700' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Shield size={20} />
              Moderator Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<ChatApp />} />
          <Route path="/moderator" element={<ModeratorDashboard />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;