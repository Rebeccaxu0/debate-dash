import React from "react";
import { Card, Button, Form } from "react-bootstrap";
import "./DebateComponent.css";

const UserInputCard = ({
  userResponse,
  setUserResponse,
  onSubmitResponse,
  onClosingStatement,
  isClosing,
  onDone,
}) => (
  <Card className="debate-card right-card mt-3">
    <Card.Body>
      <Card.Title>
        {isClosing ? "Please Make Your Closing Statement" : "Your Turn"}
      </Card.Title>
      <Form.Control
        as="textarea"
        value={userResponse}
        onChange={(e) => setUserResponse(e.target.value)}
        placeholder="Write your response"
        rows="3"
      />
      <div className="button-group-right mt-3">
        {isClosing ? (
          <Button variant="primary" onClick={onDone}>
            End Debate
          </Button>
        ) : (
          <>
            <Button variant="primary" onClick={onSubmitResponse}>
              Submit Response
            </Button>
            <Button
              variant="danger"
              className="ml-3"
              onClick={onClosingStatement}
            >
              Make Closing Statement
            </Button>
          </>
        )}
      </div>
    </Card.Body>
  </Card>
);

export default UserInputCard;
