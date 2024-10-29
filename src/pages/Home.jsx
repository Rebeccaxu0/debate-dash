import React, { useState, useEffect } from "react";
import { Container, Button, Offcanvas } from "react-bootstrap";
import DebateComponent from '../components/DebateComponent';
import { useDbUpdate, useDbData } from '../utilities/firebase';
import AuthForm from "../components/AuthForm";
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home({ user, setUser }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [debateData, setDebateData] = useState([]);
  const [tempDebate, setTempDebate] = useState(null);
  const [updateDb] = useDbUpdate(user ? `debates/${user.uid}` : null);
  const [savedDebates, dbError] = useDbData(user ? `debates/${user.uid}` : '');
  const navigate = useNavigate();

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  const handleSaveDebate = (debate) => {
    if (!user) {
      setTempDebate(debate);
      setShowAuthForm(true);
    } else {
      saveDebate(debate);
    }
  };

  const saveDebate = (debate) => {
    const debateID = Date.now();
    updateDb({ [debateID]: debate });
  };

  const handleAuthSuccess = (user) => {
    setUser(user);
    setShowAuthForm(false);
    if (tempDebate) {
      saveDebate(tempDebate);
      setTempDebate(null);
    }
  };

  useEffect(() => {
    if (savedDebates) {
      setDebateData(Object.entries(savedDebates).map(([id, data]) => ({ id, ...data })));
    }
  }, [savedDebates]);

  if (dbError) {
    return <div>Error loading saved debates</div>;
  }

  const handleDebateClick = (debateID) => {
    navigate(`/debate/${debateID}`);
  };

  return (
    <Container fluid className="App">
      <div className="content">
        <DebateComponent onSaveDebate={handleSaveDebate} />
        <Button className="sidebar-toggle" variant="outline-secondary" onClick={toggleSidebar}>
          Saved Debates
        </Button>

        <Offcanvas show={showSidebar} onHide={toggleSidebar}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Saved Debates</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            {debateData.length > 0 ? (
              <div className="saved-debate-card">
                <ul>
                  {debateData.map((debate) => (
                    <li
                      key={debate.id}
                      className="debate-item"
                      onClick={() => handleDebateClick(debate.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <p className="debate-date">
                        {new Date(debate.timestamp).toLocaleDateString()} - {debate.topic}
                      </p>
                      <p className="debate-details">
                        {debate.candidate1} vs {debate.candidate2}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>No saved debates yet.</p>
            )}
          </Offcanvas.Body>
        </Offcanvas>

        {showAuthForm && (
          <AuthForm onAuthSuccess={handleAuthSuccess} onClose={() => setShowAuthForm(false)} />
        )}
      </div>
    </Container>
  );
}

export default Home;
