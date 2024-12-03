import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { Pencil, VolumeUp } from "react-bootstrap-icons";
import "./CandidateSelector.css";

const CandidateSelector = ({
  candidate,
  handleCandidateChange,
  label,
  disabled,
  position,
  isSpeaking,
  changeCandidateToUser,
}) => {
  const [isEditing, setIsEditing] = useState(true);
  const [tempCandidate, setTempCandidate] = useState(candidate || "");

  const handleSaveCandidate = () => {
    if (tempCandidate.trim()) {
      handleCandidateChange(tempCandidate);
      setIsEditing(false);
    }
  };

  const handleEditCandidate = () => {
    setIsEditing(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !disabled && tempCandidate.trim()) {
      e.preventDefault();
      handleSaveCandidate();
    }
  };

  const buttonClass =
    position === "left" ? "candidate-submit-btn-left" : "candidate-submit-btn-right";
  const candidateStyle =
    position === "left" ? "candidate-name-left" : "candidate-name-right";

  return (
    <div className="candidate-selector">
      {changeCandidateToUser ? (
        <span className={`candidate-name ${candidateStyle}`}>
          {candidate}
        </span>
      ) : (
        <>
          {isEditing ? (
            <div className="d-flex align-items-center justify-content-center">
              <Form.Control
                type="text"
                value={tempCandidate}
                onChange={(e) => setTempCandidate(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Enter ${label}'s name`}
                disabled={disabled}
                className="candidate-input"
              />
              <Button
                type="submit"
                variant="success"
                className={`candidate-submit-btn ${buttonClass} ml-2`}
                disabled={!tempCandidate.trim()}
                onClick={handleSaveCandidate}
              >
                ↵
              </Button>
            </div>
          ) : (
            <div className="d-flex align-items-center justify-content-center">
              <span className={`candidate-name ${candidateStyle}`}>
                {candidate}
              </span>
              {!disabled && (
                <Button
                  variant="link"
                  onClick={handleEditCandidate}
                  className="candidate-edit-btn ml-2"
                >
                  <Pencil />
                </Button>
              )}
              {isSpeaking && (
                <span className="candidate-audio-icon ml-2">
                  <VolumeUp />
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CandidateSelector;
