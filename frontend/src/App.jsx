import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/prelogin/HomePage';
import PricingPage from './pages/prelogin/PricingPage';
import SignupPage from './pages/prelogin/SignupPage';
import LoginPage from './pages/prelogin/LoginPage';
import Preloader from './components/Preloader';

function App() {
  const [loading, setLoading] = useState(true);
  const [appVisible, setAppVisible] = useState(false);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => setAppVisible(true), 100);
    }
  }, [loading]);

  return (
    <>
      {loading && <Preloader onComplete={() => setLoading(false)} />}
      <div className={`app-container ${appVisible ? 'visible' : ''}`}>
        {!loading && (
      <Router>
        <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Router>
        )}
      </div>
    </>
  );
}

export default App;
