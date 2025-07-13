import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import People from './People';
import ModeratorDashboard from './Moderators';
import { Users, Shield } from 'lucide-react';
import LogInPage from './Sign';
import SignUpPage from './SignUp';




const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<People />} />
          <Route path="/moderator" element={<ModeratorDashboard />} />
          <Route path="/sign-in" element={<LogInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/memberpage" element={<div style={{ minHeight: '100vh', background: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><h1 style={{ color: '#FFD600', fontSize: '4rem', fontWeight: 'bold', textAlign: 'center', fontFamily: 'sans-serif' }}>Pocket<br/>Therapist</h1></div>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;