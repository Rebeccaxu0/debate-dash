import React, { useState, useEffect, useRef } from "react";
import CandidateSelector from './CandidateSelector';
import DebateTopicInput from './DebateTopicInput';
import SimulateButton from './SimulateButton';
import { Container, Card, Button, Form, Row, Col } from "react-bootstrap";
import { getCandidateResponse } from '../utilities/openaiApi';
import { getCandidateStance } from '../utilities/searchAPI';
import './DebateComponent.css';
import avatar from './avatar.png';

function DebateComponent({ onSaveDebate }) {
  const [mediatorInput, setMediatorInput] = useState("");
  const [candidate1, setCandidate1] = useState("");
  const [candidate2, setCandidate2] = useState("");
  const [topic, setTopic] = useState("");
  const [c1ConversationHistory, setC1ConversationHistory] = useState([]);
  const [c2ConversationHistory, setC2ConversationHistory] = useState([]);
  const [debateMessages, setDebateMessages] = useState([]);
  const [userResponse, setUserResponse] = useState("");
  const [isUserDebating, setIsUserDebating] = useState(false);
  const [isUserDebatingClosing, setIsUserDebatingClosing] = useState(false);
  const [isDebateOver, setIsDebateOver] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  const [isMediationEnabled, setIsMediationEnabled] = useState(false);

  // Track the end of the debate messages
  const messagesEndRef = useRef(null);

  // Scroll automatically if the user is debating
  useEffect(() => {
    if (isUserDebating && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [debateMessages, isUserDebating]);

  // Add a condition to enable/disable the button
  const isSimulateDisabled = !candidate1 || !candidate2 || !topic || isSimulated;


  const simulateDebate = async () => {

    // First statement from Candidate 1
    const initialStatement1 = { role: "system", content: `You are ${candidate1}. Imitate everything from personality to speech style. You are debating with ${candidate2}.` };
    const candidateArticle1 = await getCandidateStance(`${candidate1} policies on ${topic}`);
    // const ragModelInput = {role: ""}`Using the following information: ${candidateArticle}`;
    const userPrompt1 = { role: "user", content: `Using the following information: ${candidateArticle1}. Please give your opening statement on "${topic}". Please limit to one paragraph.` };

    let c1History = [...c1ConversationHistory, initialStatement1, userPrompt1];
    const candidate1Response = await getCandidateResponse(c1History);

    c1History.push({ role: "system", content: candidate1Response });
    setC1ConversationHistory(c1History);

    setDebateMessages(prev => [...prev, { speaker: candidate1, message: candidate1Response }]);

    if (candidate2 === "Yourself") {
      // Update system setting to chat with user.
      const userSystemStatement = { role: "system", content: `You are ${candidate1}. Imitate everything from personality to speech style. You are debating with user on "${topic}".` };
      c1History.push(userSystemStatement);
      setC1ConversationHistory(c1History);

      setIsUserDebating(true);
    } else {
      // First statement from Candidate 2
      const initialStatement2 = { role: "system", content: `You are ${candidate2}. Imitate everything from personality to speech style. You are debating with ${candidate1}.` };
      const candidateArticle2 = await getCandidateStance(`${candidate2} policies on ${topic}`);
      const userPrompt2 = { role: "user", content: ` ${candidate1} responded first, with this: "${candidate1Response}". Using the following information: ${candidateArticle2}. Please give your opening statement on "${topic}" and respond. Please limit to one paragraph.` };

      let c2History = [...c2ConversationHistory, initialStatement2, userPrompt2];
      const candidate2Response = await getCandidateResponse(c2History);

      c2History.push({ role: "system", content: candidate2Response });
      setC2ConversationHistory(c2History);

      setDebateMessages(prev => [...prev, { speaker: candidate2, message: candidate2Response }]);

      // Disable the fields after simulation starts
      setIsSimulated(true);

      // await continueDebate(c1History, c2History, 0);

      // closingStatements(c1History, c2History);
    }
  };


  const closingStatements = async (c1History, c2History) => {
    const prevCandidate2Response = c2History[c2History.length - 1].content;

    const userPrompt1 = { role: "user", content: ` ${candidate2} responded with this: "${prevCandidate2Response}". Please make a closing statement ${topic}. Please limit to one paragraph.` };
    c1History.push(userPrompt1);

    const candidate1Response = await getCandidateResponse(c1History);

    c1History.push({ role: "system", content: candidate1Response });
    setC1ConversationHistory(c1History);

    setDebateMessages(prev => [...prev, { speaker: candidate1, message: candidate1Response }]);

    const userPrompt2 = { role: "user", content: ` ${candidate1} responded with this: "${candidate1Response}". Please make a closing statement on ${topic}. Please limit to one paragraph.` };

    c2History.push(userPrompt2);
    const candidate2Response = await getCandidateResponse(c2History);

    c2History.push({ role: "system", content: candidate2Response });
    setC2ConversationHistory(c2History);  // Update state

    setDebateMessages(prev => [...prev, { speaker: candidate2, message: candidate2Response }]);

    setIsDebateOver(true);
  };


  const continueDebate = async (c1History, c2History, cCount) => {
    // Candidate 1 responds to candidate 2
    const prevCandidate2Response = c2History[c2History.length - 1].content;

    const userPrompt1 = { role: "user", content: ` ${candidate2} responded with this: "${prevCandidate2Response}". Please respond for the debate. Please limit to one paragraph.` };
    c1History.push(userPrompt1);

    const candidate1Response = await getCandidateResponse(c1History);

    c1History.push({ role: "system", content: candidate1Response });
    setC1ConversationHistory(c1History);

    setDebateMessages(prev => [...prev, { speaker: candidate1, message: candidate1Response }]);


    // Candidate 2 responds to candidate 1
    const userPrompt2 = { role: "user", content: ` ${candidate1} responded with this: "${candidate1Response}". Please respond for the debate. Please limit to one paragraph.` };

    c2History.push(userPrompt2);
    const candidate2Response = await getCandidateResponse(c2History);

    c2History.push({ role: "system", content: candidate2Response });
    setC2ConversationHistory(c2History);  // Update state

    setDebateMessages(prev => [...prev, { speaker: candidate2, message: candidate2Response }]);

    // Trigger the next cycle
    // triggerNextCycle(c1History, c2History, cCount + 1);
  };

  const triggerNextCycle = (c1History, c2History, cCount) => {
    if (cCount < 1) {
      setTimeout(() => {
        continueDebate(c1History, c2History, cCount);
      }, 1000);
    }
  };


  const handleUserSubmit = async () => {
    const userInput = { role: "user", content: userResponse };
    const c1History = [...c1ConversationHistory, userInput];

    setDebateMessages(prev => [...prev, { speaker: "You", message: userResponse }]);
    setUserResponse("");

    setIsUserDebating(false);

    const candidate1Response = await getCandidateResponse(c1History);
    c1History.push({ role: "system", content: candidate1Response });

    setC1ConversationHistory(c1History);
    setDebateMessages(prev => [...prev, { speaker: candidate1, message: candidate1Response }]);

    setTimeout(() => {
      setIsUserDebating(true);  // Set to true to allow user to respond
    }, 1000);
  };


  const handleClosingStatement = async () => {
    const userInput = { role: "user", content: userResponse };
    const c1History = [...c1ConversationHistory, userInput];
    setDebateMessages(prev => [...prev, { speaker: "You", message: userResponse }]);

    setIsUserDebating(false);

    const userPrompt1 = { role: "user", content: `Please make a closing statement ${topic}. Please limit to one paragraph.` };
    c1History.push(userPrompt1);

    const candidate1Response = await getCandidateResponse(c1History);
    c1History.push({ role: "system", content: candidate1Response });

    setC1ConversationHistory(c1History);
    setDebateMessages(prev => [...prev, { speaker: candidate1, message: candidate1Response }]);
    setUserResponse("");

    setTimeout(() => {
      setIsUserDebatingClosing(true);  // Set to true to allow user to respond
    }, 1000);
  };

  const handleDone = () => {
    setDebateMessages(prev => [...prev, { speaker: "You", message: userResponse }]);
    setIsUserDebatingClosing(false);
    setIsDebateOver(true);
  }

  const handleSave = () => {
    const debateData = {
      topic: topic,
      candidate1: candidate1,
      candidate2: candidate2,
      messages: debateMessages,
      timestamp: Date.now()
    };
    onSaveDebate(debateData);
  };

  const getAvatarForSpeaker = (speaker) => {
    if (speaker === candidate1) {
      return avatar; // Candidate 1 avatar
    } else if (speaker === candidate2) {
      return speaker === "You" ? avatar : avatar; // Candidate 2 avatar
    } else {
      return avatar; // Default avatar
    }
  };

  const getLatestMessage = (speaker) => {
    // Find the latest message from the speaker
    for (let i = debateMessages.length - 1; i >= 0; i--) {
      if (debateMessages[i].speaker === speaker) {
        return debateMessages[i].message;
      }
    }
    return "Waiting for response..."; // Placeholder if no message
  };

  return (
    <Container className="App">
      <Row>
        <Col md={6}>
          <CandidateSelector
            label="Select Candidate 1:"
            candidate={candidate1}
            handleCandidateChange={(e) => setCandidate1(e.target.value)}
            disabled={isSimulated}
          />
        </Col>
        <Col md={6}>
          <CandidateSelector
            label="Select Candidate 2:"
            candidate={candidate2}
            handleCandidateChange={(e) => setCandidate2(e.target.value)} includeSelf={true}
            disabled={isSimulated}
          />
        </Col>
      </Row>
      <DebateTopicInput
        topic={topic}
        handleTopicChange={(e) => setTopic(e.target.value)}
        disabled={isSimulated}
      />

      {/* Checkbox toggles for Text Mode and Mediate */}
      <Form.Check
        type="switch"
        id="text-mode-switch"
        label="Text Mode"
        checked={isTextMode}
        onChange={() => setIsTextMode(prev => !prev)}
        className="mt-3"
      />
      <Form.Check
        type="switch"
        id="mediate-mode-switch"
        label="Mediate"
        checked={isMediationEnabled}
        onChange={() => setIsMediationEnabled(prev => !prev)}
        className="mt-3"
      />

      <SimulateButton
        onClick={simulateDebate}
        disabled={isSimulateDisabled}
      />

      {isTextMode ? (
        debateMessages.map((msg, idx) => (
          <Card
            className={
              msg.speaker === candidate1
                ? "debate-card left-card mt-3"
                : "debate-card right-card mt-3"
            }
            key={idx}
          >
            <Card.Body>
              <Card.Title>{msg.speaker}</Card.Title>
              <Card.Text>{msg.message}</Card.Text>
            </Card.Body>
          </Card>
        ))
      ) : (
        <div className="animated-mode mt-3">
          <Row>
            {/* Speaker 1 */}
            <Col md={4} className="speaker-col">
              <div className="speaker-container">
                <h3>{candidate1}</h3>
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
            {isSimulated && (
                <Col>
                <Form.Control
                  className="mediator-input"
                  type="text"
                  placeholder="Add mediator input here..."
                  value={mediatorInput}
                  onChange={(e) => setMediatorInput(e.target.value)}
                />
                <br></br><br></br>
                <Button onClick={() => continueDebate(c1ConversationHistory, c2ConversationHistory, 0)}>Respond to Each Other</Button>
                <br></br><br></br>
                <Button onClick={() => closingStatements(c1ConversationHistory, c2ConversationHistory)}>Make Closing Statements</Button>
                </Col>
            )}
            {/* Speaker 2 */}
            <Col md={4} className="speaker-col">
              <div className="speaker-container">
                <h3>{candidate2 === "Yourself" ? "You" : candidate2}</h3>
                <img
                  src={getAvatarForSpeaker(candidate2 === "Yourself" ? "You" : candidate2)}
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
      )}

      {/* Auto scroll when new messages are added only when the user is debating */}
      <div ref={messagesEndRef} />

      {isUserDebating && (
        <Card className="debate-card right-card mt-3">
          <Card.Body>
            <Card.Title>Your Turn</Card.Title>
            <Form.Control
              as="textarea"
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              placeholder="Write your response"
              rows="3"
            />
            <div className="button-group-right mt-3">
              <Button variant="primary" onClick={handleUserSubmit}>
                Submit Response
              </Button>
              <Button variant="danger" className="ml-3" onClick={handleClosingStatement}>
                Make Closing Statement
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {isUserDebatingClosing && (
        <Card className="debate-card right-card mt-3">
          <Card.Body>
            <Card.Title>Please Make Your Closing Statement</Card.Title>
            <Form.Control
              as="textarea"
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              placeholder="Write your response"
              rows="3"
            />
            <div className="button-group-right mt-3">
              <Button variant="primary" onClick={handleDone}>
                End Debate
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {isDebateOver && (
        <Card className="mt-3">
          <Card.Body>
            <Card.Title>Debate Ended</Card.Title>
            <Button variant="primary" onClick={handleSave}>Save Debate</Button>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}

export default DebateComponent;
