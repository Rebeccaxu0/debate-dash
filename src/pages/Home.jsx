import React, { useState, useEffect } from "react";
import { Modal, Container } from "react-bootstrap";
import DebateComponent from '../components/DebateComponent';
import { useDbUpdate, useDbData } from '../utilities/firebase';
import AuthForm from "../components/AuthForm";
import './Home.css';

function Home({ user, setUser }) {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [debateData, setDebateData] = useState([]);
  const [tempDebate, setTempDebate] = useState(null);
  const [updateDb] = useDbUpdate(user ? `debates/${user.uid}` : null);
  const [savedDebates, dbError] = useDbData(user ? `debates/${user.uid}` : '');
  const [showModal, setShowModal] = useState(false);

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

    setShowModal(true);
    setTimeout(() => setShowModal(false), 2000);
  };

  const handleAuthSuccess = (newUser) => {
    setUser(newUser);
    setShowAuthForm(false);
  };

  useEffect(() => {
    if (user && tempDebate) {
      saveDebate(tempDebate);
      setTempDebate(null);
    }
  }, [user, tempDebate]);

  useEffect(() => {
    if (savedDebates) {
      setDebateData(Object.entries(savedDebates).map(([id, data]) => ({ id, ...data })));
    }
  }, [savedDebates]);

  if (dbError) {
    return <div>Error loading saved debates</div>;
  }

  return (
    <Container fluid className="App">
      <div className="content">
        <DebateComponent onSaveDebate={handleSaveDebate} />

        {showAuthForm && (
          <AuthForm onAuthSuccess={handleAuthSuccess} onClose={() => setShowAuthForm(false)} />
        )}

        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <div className="custom-modal">
            <h5 className="custom-modal-title">Debate Saved Successfully!</h5>
            <p className="custom-modal-body">You can find your saved debate in the backlog.</p>
          </div>
        </Modal>
      </div>
    </Container>
  );
}

export default Home;
