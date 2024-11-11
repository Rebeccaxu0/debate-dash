import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import SavedDebatePage from './pages/SavedDebatePage';
import Banner from './components/Banner';
import AuthForm from './components/AuthForm';
import SavedDebatesSidebar from './components/SavedDebatesSideBar';
import { auth, signOut, onAuthStateChanged, useDbData } from './utilities/firebase';

function App() {

  const [user, setUser] = useState(null);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [debateData, setDebateData] = useState([]);
  const [selectedDebateId, setSelectedDebateId] = useState(null);
  const [savedDebates, dbError] = useDbData(user ? `debates/${user.uid}` : '');

  // Track authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  // Track debate save changes
  useEffect(() => {
    if (savedDebates) {
      setDebateData(Object.entries(savedDebates).map(([id, data]) => ({ id, ...data })));
    }
  }, [savedDebates]);

  const handleSignOut = () => {
    signOut(auth).then(() => {
      setUser(null);
    });
  };

  const handleAuthSuccess = (user) => {
    setUser(user);
    setShowAuthForm(false);
  };

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  if (dbError) {
    return <div>Error loading saved debates</div>;
  }

  return (
    <Router>
      <Banner
        user={user}
        onSignIn={() => setShowAuthForm(true)}
        onSignOut={handleSignOut}
        onToggleSidebar={toggleSidebar}
        setSelectedDebateId={setSelectedDebateId}
      />
      <Routes>
        <Route path="/" element={<Home user={user} setUser={setUser} />} />
        <Route path="/debate/:debateID" element={<SavedDebatePage user={user} />} />
      </Routes>
      <SavedDebatesSidebar
        showSidebar={showSidebar}
        toggleSidebar={toggleSidebar}
        debateData={debateData}
        selectedDebateId={selectedDebateId}
        setSelectedDebateId={setSelectedDebateId}
      />
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
