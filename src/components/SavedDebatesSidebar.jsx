import React from 'react';
import { Offcanvas } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function SavedDebatesSidebar({ showSidebar, toggleSidebar, debateData }) {
  const navigate = useNavigate();

  return (
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
                  onClick={() => navigate(`/debate/${debate.id}`)}
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
  );
}

export default SavedDebatesSidebar;
