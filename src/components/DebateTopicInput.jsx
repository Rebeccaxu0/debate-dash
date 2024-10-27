import React from "react";
import { Form } from "react-bootstrap";

const DebateTopicInput = ({ topic, handleTopicChange, disabled }) => {
  return (
    <Form.Group>
      <Form.Label>Debate Topic</Form.Label>
      <Form.Control
        as="textarea"
        value={topic}
        onChange={handleTopicChange}
        placeholder="Enter the debate topic"
        rows="4"
        disabled={disabled}
      />
    </Form.Group>
  );
};

export default DebateTopicInput;
