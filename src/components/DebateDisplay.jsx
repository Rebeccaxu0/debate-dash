import React from "react";
import { Card } from "react-bootstrap";
import './DebateDisplay.css';

const DebateDisplay = ({ statement1, statement2, response1, response2, candidate1, candidate2 }) => {
  return (
    <div className="debate-container">
      {statement1 && (
        <Card className="debate-card left-card mt-3">
          <Card.Body>
            <Card.Title>{candidate1}'s Initial Statement:</Card.Title>
            <Card.Text>{statement1}</Card.Text>
          </Card.Body>
        </Card>
      )}
      {statement2 && (
        <Card className="debate-card right-card mt-3">
          <Card.Body>
            <Card.Title>{candidate2}'s Initial Statement:</Card.Title>
            <Card.Text>{statement2}</Card.Text>
          </Card.Body>
        </Card>
      )}
      {response1 && (
        <Card className="debate-card left-card mt-3">
          <Card.Body>
            <Card.Title>{candidate1}'s Response:</Card.Title>
            <Card.Text>{response1}</Card.Text>
          </Card.Body>
        </Card>
      )}
      {response2 && (
        <Card className="debate-card right-card mt-3">
          <Card.Body>
            <Card.Title>{candidate2}'s Response:</Card.Title>
            <Card.Text>{response2}</Card.Text>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default DebateDisplay;
