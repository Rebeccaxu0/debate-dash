import React from 'react';
import { Offcanvas, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { XSquare } from 'react-bootstrap-icons';
import './SavedDebatesSideBar.css';

function SavedDebatesSideBar({ showSidebar, toggleSidebar, debateData, selectedDebateId, setSelectedDebateId }) {
  const navigate = useNavigate();

  const handleDebateClick = (debateId) => {
    if (selectedDebateId === debateId) {
      setSelectedDebateId(null);
    } else {
      setSelectedDebateId(debateId);
      navigate(`/debate/${debateId}`);
    }
  };

  const truncateText = (text, maxLength = 45) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <Offcanvas show={showSidebar} onHide={toggleSidebar} style={{ width: '300px' }}>
      <Offcanvas.Header>
        <Offcanvas.Title
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#444',
            padding: '10px 0',
            textAlign: 'center',
            borderBottom: '2px solid #ddd'
          }}>
          Saved Debates
        </Offcanvas.Title>
        <XSquare onClick={toggleSidebar} className="close-icon-button" title="Close Sidebar" />
      </Offcanvas.Header>
      <Offcanvas.Body>
        {debateData.length > 0 ? (
          <div>
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
              {debateData.slice().reverse().map((debate) => (
                <OverlayTrigger
                key={debate.id}
                placement="top"
                overlay={<Tooltip>{debate.topic}</Tooltip>}
              >
                <li
                  key={debate.id}
                  className={`debate-item ${selectedDebateId === debate.id ? 'selected' : ''}`}
                  onClick={() => handleDebateClick(debate.id)}
                >
                  <p className="debate-date">
                    {new Date(debate.timestamp).toLocaleDateString()} - {truncateText(debate.topic)}
                  </p>
                  <p className="debate-details">
                    {debate.candidate1} vs {debate.candidate2}
                  </p>
                </li>
                </OverlayTrigger>
              ))}
            </ul>
          </div>
        ) : (
          <p className="no-debates">No saved debates yet.</p>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default SavedDebatesSideBar;
