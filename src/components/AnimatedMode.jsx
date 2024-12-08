import React, { useState, useEffect } from "react";
import { Row, Col, Button, Form, Card } from "react-bootstrap";
import { getCandidateHeadshot } from "../utilities/searchAPI";
import "./DebateComponent.css";
import "./AnimatedMode.css";
import { initializeSpeechRecognition } from "../utilities/speechToText";

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
    isMediationEnabled,
    isUserDebating,
    userResponse,
    setUserResponse,
    handleUserSubmit,
    handleRequestClosing,
    isClosing,
    onDone,
    currentSpeaker,
    currentChunk,
    isTTSEnabled,
}) => {
    const [isAskingQuestion, setIsAskingQuestion] = useState(false);
    const [userQuestion, setUserQuestion] = useState("");

    const [isRecording, setIsRecording] = useState(false);
    const [recognition, setRecognition] = useState(null);

    const [candidate1Headshot, setCandidate1Headshot] = useState(null);
    const [candidate2Headshot, setCandidate2Headshot] = useState(null);
    const [c2LastMessage, setC2LastMessage] = useState("");

    useEffect(() => {
        const recognitionInstance = initializeSpeechRecognition(
            (transcript) => setUserResponse(transcript), // Update response on result
            () => setIsRecording(false) // Stop recording when recognition ends
        );
        setRecognition(recognitionInstance);
    }, [setUserResponse]);

    useEffect(() => {
        const fetchHeadshots = async () => {
            if (candidate1) {
                const headshot1 = await getCandidateHeadshot(candidate1);
                setCandidate1Headshot(headshot1);
            }
            if (candidate2 && candidate2 !== "Yourself") {
                const headshot2 = await getCandidateHeadshot(candidate2);
                setCandidate2Headshot(headshot2);
            }
        };

        fetchHeadshots();
    }, [candidate1, candidate2]);

    const handleStartRecording = () => {
        if (recognition) {
            setIsRecording(true);
            recognition.start();
        }
    };

    const handleStopRecording = () => {
        if (recognition) {
            setIsRecording(false);
            recognition.stop();
        }
    };

    const handleAskQuestion = () => {
        setIsAskingQuestion(true);
    };

    const handleC2LastMessage = () => {
        setC2LastMessage(getLatestMessage(candidate2));
    }

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
                        {candidate1 && (
                            <>
                                <img
                                    src={candidate1Headshot || getAvatarForSpeaker(candidate1)}
                                    alt={`${candidate1} Avatar`}
                                    className={`speaker-avatar ${
                                        currentSpeaker === candidate1 ? "speaker-avatar-speaking" : ""
                                    }`}
                                />
                                <div className="caption left-caption">
                                    {/* {getLatestMessage(candidate1)} */}
                                    {currentSpeaker === candidate1 && isTTSEnabled ? currentChunk : getLatestMessage(candidate1)}
                                </div>
                            </>
                        )}
                    </div>
                </Col>

                {isMediationEnabled ? (
                    <Col md={4} className="mediator-col">
                    <Button 
                    className="switch-btn"
                    disabled={!isSimulated || getLatestMessage(candidate2) === c2LastMessage}
                    onClick={() => handleC2LastMessage()}>Move onto Candidate 2's Answer
                    </Button>
                    <br></br><br></br>
                        {isSimulated ? (
                            isAskingQuestion ? (
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
                                            Would you like to add/ask anything before the candidates respond to each other?
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
                            )
                        ) : (
                            <Card className="mediator-card">
                                <Card.Body>
                                    <p>Mediation will start when the simulation begins.</p>
                                </Card.Body>
                            </Card>
                        )}
                    </Col>
                ) : (
                    <Col md={4} className="mediator-placeholder"></Col>
                )}

                <Col md={4} className="speaker-col">
                    <div className="speaker-container">
                        {candidate2 && (
                            <>
                                {
                                    (isUserDebating && isSimulated) ? (
                                        <Card className="debate-card user-input-card">
                                            <Card.Body>
                                                <Form.Control
                                                    as="textarea"
                                                    value={userResponse}
                                                    onChange={(e) => setUserResponse(e.target.value)}
                                                    placeholder="Write your response here..."
                                                    rows={8}
                                                    className="user-debate-textbox"
                                                />
                                                <div className="button-group mt-3">
                                                    {isRecording ? (
                                                        <Button
                                                            variant="danger"
                                                            onClick={handleStopRecording}
                                                            title="Stop recording your speech"
                                                        >
                                                            <i className="bi bi-mic-mute-fill"></i>
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="primary"
                                                            onClick={handleStartRecording}
                                                            title="Start recording your speech"
                                                        >
                                                            <i className="bi bi-mic-fill"></i>
                                                        </Button>
                                                    )}
                                                    {isClosing ? (
                                                        <Button
                                                            variant="primary"
                                                            onClick={onDone}
                                                            disabled={!userResponse.trim()}
                                                            title="End the debate"
                                                        >
                                                            <i className="bi bi-stop-circle-fill"></i>
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                variant="primary"
                                                                onClick={handleUserSubmit}
                                                                disabled={!userResponse.trim()}
                                                                title="Submit your response"
                                                            >
                                                                <i className="bi bi-send-fill"></i>
                                                            </Button>
                                                            <Button
                                                                variant="danger"
                                                                className="ml-3"
                                                                onClick={handleRequestClosing}
                                                                title="Request a closing statement"
                                                            >
                                                                <i className="bi bi-arrow-bar-right"></i>
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    ) : (
                                        <>
                                            {!isUserDebating && (
                                                <>
                                                    <img
                                                        src={candidate2Headshot || getAvatarForSpeaker(candidate2)}
                                                        alt={`${candidate2} Avatar`}
                                                        className={`speaker-avatar ${
                                                            currentSpeaker === candidate2 ? "speaker-avatar-speaking" : ""
                                                        }`}
                                                    />
                                                    <div className="caption">
                                                        {candidate2 === "Yourself" ? getLatestMessage("You") : (currentSpeaker === candidate2 && isTTSEnabled ? currentChunk : c2LastMessage)}
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}
                            </>
                        )}
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default AnimatedMode;
