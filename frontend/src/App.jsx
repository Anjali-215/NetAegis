import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/prelogin/HomePage';
import PricingPage from './pages/prelogin/PricingPage';
import SignupPage from './pages/prelogin/SignupPage';
import LoginPage from './pages/prelogin/LoginPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
