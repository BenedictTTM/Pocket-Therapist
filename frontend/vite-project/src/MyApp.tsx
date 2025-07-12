import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import People from './People';
import ModeratorDashboard from './Moderators';
import { Users, Shield } from 'lucide-react';
import LogInPage from './Sign';
import SignUpPage from './SignUp';




const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Routes>
          <Route path="/" element={<People />} />
          <Route path="/moderator" element={<ModeratorDashboard />} />
          <Route path="/sign-in" element={<LogInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/memberpage" element={<People />} /> {/* <-- Add this line */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;