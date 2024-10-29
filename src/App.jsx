import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import SavedDebatePage from './pages/SavedDebatePage';
import Banner from './components/Banner';
import AuthForm from './components/AuthForm';
import { auth, signOut, onAuthStateChanged } from './utilities/firebase';

function App() {

  const [user, setUser] = useState(null);
  const [showAuthForm, setShowAuthForm] = useState(false);
  
  // Track authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const handleSignOut = () => {
    signOut(auth).then(() => {
      setUser(null);
    });
  };
  const handleAuthSuccess = (user) => {
    setUser(user);
    setShowAuthForm(false);
  };


  return (
    <Router>
      <Banner
        user={user}
        onSignIn={() => setShowAuthForm(true)}
        onSignOut={handleSignOut}
      />
      <Routes>
        <Route path="/" element={<Home user={user} setUser={setUser} />} />
        <Route path="/debate/:debateID" element={<SavedDebatePage user={user} />} />
      </Routes>
      {showAuthForm && (
        <div className="auth-modal">
          <AuthForm
            onAuthSuccess={handleAuthSuccess}
            onClose={() => setShowAuthForm(false)}
          />
        </div>
      )}
    </Router>
  );
}

export default App;
