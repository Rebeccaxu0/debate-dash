import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { Pencil } from "react-bootstrap-icons";
import "./DebateTopicInput.css";

const DebateTopicInput = ({ topic, handleTopicChange, disabled, onSubmit }) => {
  const [isEditing, setIsEditing] = useState(true);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsEditing(false);
    onSubmit();
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  return (
    <div className="debate-topic-container">
      <h2 className="debate-topic-label">The Topic is...</h2>
      {isEditing ? (
        <Form onSubmit={handleFormSubmit} className="debate-topic-form d-flex align-items-center">
          <Form.Group className="flex-grow-1">
            <Form.Control
              as="textarea"
              value={topic}
              onChange={handleTopicChange}
              placeholder="Enter the debate topic"
              rows={2}
              disabled={disabled}
              className="debate-topic-textarea"
            />
          </Form.Group>
          <Button
            type="submit"
            className="debate-topic-submit-btn ml-2"
            disabled={disabled || !topic.trim()}
          >
            ↵
          </Button>
        </Form>
      ) : (
        <div className="debate-topic-display">
          <h2 className="debate-topic-title">{topic}</h2>
          {!disabled && (
            <Button
              variant="link"
              onClick={handleEditClick}
              className="debate-topic-edit-btn ml-2"
              disabled={disabled}
            >
              <Pencil />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default DebateTopicInput;