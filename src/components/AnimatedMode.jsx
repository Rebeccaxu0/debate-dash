import React, { useState } from "react";
import { Row, Col, Button, Form, Card } from "react-bootstrap";
import "./DebateComponent.css";
import "./AnimatedMode.css";

const AnimatedMode = ({
    candidate1,
    candidate2,
    getAvatarForSpeaker,
    getLatestMessage,
    continueDebate,
    closingStatements,
    c1ConversationHistory,
    c2ConversationHistory,
    isSimulated,
    isMediationEnabled
}) => {
    const [isAskingQuestion, setIsAskingQuestion] = useState(false);
    const [userQuestion, setUserQuestion] = useState("");

    const handleAskQuestion = () => {
        setIsAskingQuestion(true);
    };

    const handleSubmitQuestion = () => {
        // console.log("User Question: ", userQuestion);
        continueDebate(c1ConversationHistory, c2ConversationHistory, 0, userQuestion);
        setUserQuestion("");
        setIsAskingQuestion(false);
    };

    const handleSkipQuestion = () => {
        setIsAskingQuestion(false);
        continueDebate(c1ConversationHistory, c2ConversationHistory, 0);
    };

    return (
        <div className="animated-mode mt-3">
            <Row>
                <Col md={4} className="speaker-col">
                    <div className="speaker-container">
                        {/* <h3>{candidate1}</h3> */}
                        <img
                            src={getAvatarForSpeaker(candidate1)}
                            alt={`${candidate1} Avatar`}
                            className="speaker-avatar"
                        />
                        <div className="caption left-caption">
                            {getLatestMessage(candidate1)}
                        </div>
                    </div>
                </Col>

                {isSimulated && isMediationEnabled && (
                    <Col md={4} className="mediator-col">
                        {isAskingQuestion ? (
                            <Card className="mediator-card">
                                <Card.Body>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Type your question here..."
                                        value={userQuestion}
                                        onChange={(e) => setUserQuestion(e.target.value)}
                                    />
                                    <div className="button-group-right mt-3">
                                        <Button variant="primary" onClick={handleSubmitQuestion}>
                                            Submit Question
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            className="ml-2"
                                            onClick={handleSkipQuestion}
                                        >
                                            Skip
                                        </Button>
                                        <Button variant="danger" onClick={() => closingStatements(c1ConversationHistory, c2ConversationHistory)}>
                                            Closing
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        ) : (
                            <Card className="mediator-card">
                                <Card.Body>
                                    <p>
                                        Would you like to add/ask anything before {candidate1} responds to {candidate2}?
                                    </p>
                                    <div className="button-group-right">
                                        <Button variant="primary" onClick={handleAskQuestion}>
                                            Yes
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            className="ml-2"
                                            onClick={handleSkipQuestion}
                                        >
                                            No
                                        </Button>

                                        <Button variant="danger" onClick={() => closingStatements(c1ConversationHistory, c2ConversationHistory)}>
                                            Closing
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        )}
                    </Col>
                )}

                <Col md={4} className="speaker-col">
                    <div className="speaker-container">
                        {/* <h3>{candidate2 === "Yourself" ? "You" : candidate2}</h3> */}
                        <img
                            src={getAvatarForSpeaker(candidate2)}
                            alt={`${candidate2} Avatar`}
                            className="speaker-avatar"
                        />
                        <div className="caption">
                            {getLatestMessage(candidate2 === "Yourself" ? "You" : candidate2)}
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default AnimatedMode;
