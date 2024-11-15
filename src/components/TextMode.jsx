import React from "react";
import { Card } from "react-bootstrap";
import "./DebateComponent.css";

const TextMode = ({ debateMessages, candidate1, candidate2 }) => {
  return (
    <div>
      {debateMessages.map((msg, idx) => (
        <Card
          key={idx}
          className={
            msg.speaker === "Mediator"
              ? "debate-card mediator-card mt-3"
              : msg.speaker === candidate1
              ? "debate-card left-card mt-3"
              : "debate-card right-card mt-3"
          }
        >
          <Card.Body>
            <Card.Title>{msg.speaker}</Card.Title>
            <Card.Text>{msg.message}</Card.Text>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default TextMode;
