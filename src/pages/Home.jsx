import React, { useState, useEffect, useRef } from "react";
import CandidateSelector from '../components/CandidateSelector';
import DebateTopicInput from '../components/DebateTopicInput';
import SimulateButton from '../components/SimulateButton';
import { Container, Card, Button, Form, Row, Col } from "react-bootstrap";
import { getCandidateResponse } from '../utilities/openaiApi';
import './Home.css';

function Home() {
  const [candidate1, setCandidate1] = useState("");
  const [candidate2, setCandidate2] = useState("");
  const [topic, setTopic] = useState("");
  const [c1ConversationHistory, setC1ConversationHistory] = useState([]);
  const [c2ConversationHistory, setC2ConversationHistory] = useState([]);
  const [debateMessages, setDebateMessages] = useState([]);
  const [userResponse, setUserResponse] = useState("");
  const [isUserDebating, setIsUserDebating] = useState(false);
  const [isDebateOver, setIsDebateOver] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);

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
    // Disable the fields after simulation starts
    setIsSimulated(true);

    // First statement from Candidate 1
    const initialStatement1 = { role: "system", content: `You are ${candidate1}. Imitate everything from personality to speech style. You are debating with ${candidate2}.` };
    const userPrompt1 = { role: "user", content: `Please give your opening statement on "${topic}".` };

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
      const userPrompt2 = { role: "user", content: ` ${candidate1} responded first, with this: "${candidate1Response}". Please give your opening statement on "${topic}" and respond.` };

      let c2History = [...c2ConversationHistory, initialStatement2, userPrompt2];
      const candidate2Response = await getCandidateResponse(c2History);

      c2History.push({ role: "system", content: candidate2Response });
      setC2ConversationHistory(c2History);

      setDebateMessages(prev => [...prev, { speaker: candidate2, message: candidate2Response }]);

      continueDebate(c1History, c2History, 0);
    }
  };


  const continueDebate = async (c1History, c2History, cCount) => {
    // Candidate 1 responds to candidate 2
    const prevCandidate2Response = c2History[c2History.length - 1].content;

    const userPrompt1 = { role: "user", content: ` ${candidate2} responded with this: "${prevCandidate2Response}". Please respond for the debate.` };
    c1History.push(userPrompt1);

    const candidate1Response = await getCandidateResponse(c1History);

    c1History.push({ role: "system", content: candidate1Response });
    setC1ConversationHistory(c1History);

    setDebateMessages(prev => [...prev, { speaker: candidate1, message: candidate1Response }]);


    // Candidate 2 responds to candidate 1
    const userPrompt2 = { role: "user", content: ` ${candidate1} responded with this: "${candidate1Response}". Please respond for the debate.` };

    c2History.push(userPrompt2);
    const candidate2Response = await getCandidateResponse(c2History);

    c2History.push({ role: "system", content: candidate2Response });
    setC2ConversationHistory(c2History);  // Update state

    setDebateMessages(prev => [...prev, { speaker: candidate2, message: candidate2Response }]);

    // Trigger the next cycle
    triggerNextCycle(c1History, c2History, cCount + 1);
  };

  const triggerNextCycle = (c1History, c2History, cCount) => {
    if (cCount < 2) {
      setTimeout(() => {
        continueDebate(c1History, c2History, cCount);
      }, 1000);
    } else {
      setIsDebateOver(true);
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


  const handleDone = () => {
    setIsUserDebating(false);
    setIsDebateOver(true);
    setDebateMessages(prev => [...prev, { speaker: "You", message: "I am done debating." }]);
  };

  return (
    <Container className="App">
      <h1>Debate Dash</h1>
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
      <SimulateButton
        onClick={simulateDebate}
        disabled={isSimulateDisabled}
      />

      {debateMessages.map((msg, idx) => (
        <Card className={msg.speaker === candidate1 ? "debate-card left-card mt-3" : "debate-card right-card mt-3"} key={idx}>
          <Card.Body>
            <Card.Title>{msg.speaker}</Card.Title>
            <Card.Text>{msg.message}</Card.Text>
          </Card.Body>
        </Card>
      ))}

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
              <Button variant="danger" className="ml-3" onClick={handleDone}>
                Done
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {isDebateOver && (
        <Card className="mt-3">
          <Card.Body>
            <Card.Title>Debate Ended</Card.Title>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}

export default Home;
