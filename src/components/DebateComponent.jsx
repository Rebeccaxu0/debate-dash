import React, { useState, useEffect, useRef } from "react";
import CandidateSelector from './CandidateSelector';
import DebateTopicInput from './DebateTopicInput';
import TextMode from "./TextMode";
import UserInputCard from "./UserInputCard";
import AnimatedMode from "./AnimatedMode";
import { Container, Card, Button, Form, Row, Col } from "react-bootstrap";
import { getCandidateResponse } from '../utilities/openaiApi';
import { getCandidateStance } from '../utilities/searchAPI';
import { processSpeechQueueSequentially } from '../utilities/textToSpeech';
import './DebateComponent.css';
import avatar from '../assets/avatar.png';

// TODO: Get an API for this
const candidateGenderMap = {
  "Donald Trump": "male",
  "Kamala Harris": "female",
  "JD Vance": "male",
  "Tim Walz": "male",
  "Joe Biden": "male",
  "AOC": "female",
  "Barack Obama": "male",
  "Bernie Sanders": "male",
  "Nancy Pelosi": "female",
  "Pete Buttigieg": "male",
  "Al Gore": "male",
  "Ted Cruz": "male",
  "Yourself": "female"  // Adjust as appropriate or prompt user
};


function DebateComponent({ onSaveDebate }) {
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
  const [isMediationEnabled, setIsMediationEnabled] = useState(true);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState("");
  const [changeCandidateToUser, setChangeCandidateToUser] = useState(false);
  const [currentChunk, setCurrentChunk] = useState("");

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

  const handleSpeechUpdate = (chunk) => {
    setCurrentChunk(chunk); // Update the chunk being displayed
  };

  const simulateDebate = async () => {
    const speechQueue = [];

    // First statement from Candidate 1
    const initialStatement1 = { role: "system", content: `You are ${candidate1}. Imitate everything from personality to speech style. ${candidate2 === "Yourself" ? "":`You are debating with ${candidate2}.`}`};
    const candidateArticle1 = await getCandidateStance(`${candidate1} policies on ${topic}`);
    // const ragModelInput = {role: ""}`Using the following information: ${candidateArticle}`;
    const userPrompt1 = { role: "user", content: `Using the following information: ${candidateArticle1}. Please give your opening statement on "${topic}". Please limit to one paragraph.` };

    let c1History = [...c1ConversationHistory, initialStatement1, userPrompt1];
    const candidate1Response = await getCandidateResponse(c1History);

    c1History.push({ role: "system", content: candidate1Response });
    setC1ConversationHistory(c1History);

    setDebateMessages(prev => [...prev, { speaker: candidate1, message: candidate1Response }]);

    // Disable the fields after simulation starts
    setIsSimulated(true);

    if (isTTSEnabled) {
      setCurrentSpeaker(candidate1);
      speechQueue.push({ text: candidate1Response, speaker: candidate1 });
      await processSpeechQueueSequentially(speechQueue, candidateGenderMap, handleSpeechUpdate);
      setCurrentSpeaker("");
    }

    if (candidate2 === "Yourself") {
      // Update system setting to chat with user.
      // const userSystemStatement = { role: "system", content: `You are ${candidate1}. Imitate everything from personality to speech style. You are debating with user on "${topic}".` };
      // c1History.push(userSystemStatement);
      // setC1ConversationHistory(c1History);

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
      if (isTTSEnabled) {
        setCurrentSpeaker(candidate2);
        speechQueue.push({ text: candidate2Response, speaker: candidate2 });
        await processSpeechQueueSequentially(speechQueue, candidateGenderMap, handleSpeechUpdate);
        setCurrentSpeaker("");
      }

      // Automatically continue the debate if mediation is not enabled
      // if (!isMediationEnabled) {
      //   await continueDebate(c1History, c2History, 0);
      // }

      // closingStatements(c1History, c2History);
    }
  };


  const closingStatements = async (c1History, c2History) => {
    const speechQueue = [];
    const prevCandidate2Response = c2History[c2History.length - 1].content;

    const userPrompt1 = { role: "user", content: ` ${candidate2} responded with this: "${prevCandidate2Response}". Please make a closing statement ${topic}. Please limit to one paragraph.` };
    c1History.push(userPrompt1);

    const candidate1Response = await getCandidateResponse(c1History);

    c1History.push({ role: "system", content: candidate1Response });
    setC1ConversationHistory(c1History);

    setDebateMessages(prev => [...prev, { speaker: candidate1, message: candidate1Response }]);
    if (isTTSEnabled) {
      setCurrentSpeaker(candidate1);
      speechQueue.push({ text: candidate1Response, speaker: candidate1 });
      await processSpeechQueueSequentially(speechQueue, candidateGenderMap, handleSpeechUpdate);
      setCurrentSpeaker("");
    }

    const userPrompt2 = { role: "user", content: ` ${candidate1} responded with this: "${candidate1Response}". Please make a closing statement on ${topic}. Please limit to one paragraph.` };
    c2History.push(userPrompt2);

    const candidate2Response = await getCandidateResponse(c2History);

    c2History.push({ role: "system", content: candidate2Response });
    setC2ConversationHistory(c2History);  // Update state

    setDebateMessages(prev => [...prev, { speaker: candidate2, message: candidate2Response }]);
    if (isTTSEnabled) {
      setCurrentSpeaker(candidate2);
      speechQueue.push({ text: candidate2Response, speaker: candidate2 });
      await processSpeechQueueSequentially(speechQueue, candidateGenderMap, handleSpeechUpdate);
      setCurrentSpeaker("");
    }

    setIsDebateOver(true);
  };


  const continueDebate = async (c1History, c2History, cCount, mediatorInput = "") => {
    const speechQueue = [];
    // Candidate 1 responds to candidate 2
    const prevCandidate2Response = c2History[c2History.length - 1].content;

    // console.log("Mediator Input: ", mediatorInput);
    // Check if mediator input exists
    const candidatePrompt1 = mediatorInput
      ? `The mediator asked this question: "${mediatorInput}". Please respond to the mediator's question and ${candidate2}'s response: "${prevCandidate2Response}". Limit to one paragraph.`
      : ` ${candidate2} responded with this: "${prevCandidate2Response}". Please respond for the debate. Please limit to one paragraph.`;

    const userPrompt1 = { role: "user", content: candidatePrompt1 };
    c1History.push(userPrompt1);

    const candidate1Response = await getCandidateResponse(c1History);

    c1History.push({ role: "system", content: candidate1Response });
    setC1ConversationHistory(c1History);

    setDebateMessages(prev => [
      ...prev,
      ...(mediatorInput
        ? [{ speaker: "Mediator", message: mediatorInput }]
        : []),
      { speaker: candidate1, message: candidate1Response }]);
    if (isTTSEnabled) {
      setCurrentSpeaker(candidate1);
      speechQueue.push({ text: candidate1Response, speaker: candidate1 });
      await processSpeechQueueSequentially(speechQueue, candidateGenderMap, handleSpeechUpdate);
      setCurrentSpeaker("");
    }


    // Candidate 2 responds to candidate 1
    const candidatePrompt2 = mediatorInput
      ? `The mediator asked this question: "${mediatorInput}". Please respond to the mediator's question and ${candidate1}'s response: "${candidate1Response}". Limit to one paragraph.`
      : ` ${candidate1} responded with this: "${candidate1Response}". Please respond for the debate. Please limit to one paragraph.`;

    const userPrompt2 = { role: "user", content: candidatePrompt2 };
    c2History.push(userPrompt2);

    const candidate2Response = await getCandidateResponse(c2History);

    c2History.push({ role: "system", content: candidate2Response });
    setC2ConversationHistory(c2History);  // Update state

    setDebateMessages(prev => [...prev, { speaker: candidate2, message: candidate2Response }]);
    if (isTTSEnabled) {
      setCurrentSpeaker(candidate2);
      speechQueue.push({ text: candidate2Response, speaker: candidate2 });
      await processSpeechQueueSequentially(speechQueue, candidateGenderMap, handleSpeechUpdate);
      setCurrentSpeaker("");
    }

    // Automatically continue the debate if mediation is not enabled
    if (!isMediationEnabled) {
      triggerNextCycle(c1History, c2History, cCount + 1);
    }
  };

  const triggerNextCycle = (c1History, c2History, cCount) => {
    setTimeout(() => {
      if (cCount < 1) {
        continueDebate(c1History, c2History, cCount);
      } else {
        closingStatements(c1History, c2History);
      }
    }, 1000);
  };

  const handleUserSubmit = async () => {
    const userInput = { role: "user", content: userResponse };
    const c1History = [...c1ConversationHistory, userInput];
    const speechQueue = [];

    setDebateMessages(prev => [...prev, { speaker: "You", message: userResponse }]);
    setUserResponse("");

    setIsUserDebating(false);

    const candidate1Response = await getCandidateResponse(c1History);
    c1History.push({ role: "system", content: candidate1Response });

    setC1ConversationHistory(c1History);
    setDebateMessages(prev => [...prev, { speaker: candidate1, message: candidate1Response }]);
    if (isTTSEnabled) {
      setCurrentSpeaker(candidate1);
      speechQueue.push({ text: candidate1Response, speaker: candidate1 });
      await processSpeechQueueSequentially(speechQueue, candidateGenderMap, handleSpeechUpdate);
      setCurrentSpeaker("");
    }

    setTimeout(() => {
      setIsUserDebating(true);  // Set to true to allow user to respond
    }, 1000);
  };


  const handleClosingStatement = async () => {
    const speechQueue = [];
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
    if (isTTSEnabled) {
      setCurrentSpeaker(candidate1);
      speechQueue.push({ text: candidate1Response, speaker: candidate1 });
      await processSpeechQueueSequentially(speechQueue, candidateGenderMap, handleSpeechUpdate);
      setCurrentSpeaker("");
    }

    setUserResponse("");

    setTimeout(() => {
      setIsUserDebatingClosing(true);  // Set to true to allow user to respond
      setIsUserDebating(true);
    }, 1000);
  };

  const handleDone = () => {
    setDebateMessages(prev => [...prev, { speaker: "You", message: userResponse }]);
    setIsUserDebatingClosing(false);
    setIsUserDebating(false);
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
      <div className="custom-debate-mode-group">
        <div
          className={`debate-mode-option ${!isUserDebating ? "active" : ""}`}
          onClick={() => {
            setIsUserDebating(false);
            setChangeCandidateToUser(false);
            setCandidate2("");
            setIsMediationEnabled(false);
          }}
        >
          Simulate Debate
        </div>
        <div
          className={`debate-mode-option ${isUserDebating ? "active" : ""}`}
          onClick={() => {
            setIsUserDebating(true);
            setChangeCandidateToUser(true);
            setCandidate2("Yourself");
            setIsMediationEnabled(false);
          }}
        >
          Debate With Candidate
        </div>
      </div>

      <DebateTopicInput
        topic={topic}
        handleTopicChange={(e) => setTopic(e.target.value)}
        disabled={isSimulated}
        onSubmit={() => console.log("Topic submitted: ", topic)}
      />

      <div className="custom-toggle">
        {/* {!isUserDebating && (
          <Form.Check
            type="switch"
            id="mediate-mode-switch"
            label={<span className="custom-toggle-label">Mediate</span>}
            checked={isMediationEnabled}
            onChange={() => setIsMediationEnabled((prev) => !prev)}
            className="custom-switch"
          />
        )} */}
        <Form.Check
          type="switch"
          id="text-mode-switch"
          label={<span className="custom-toggle-label">Text Mode</span>}
          checked={isTextMode}
          onChange={() => {
            setIsTextMode((prev) => {
              const newTextMode = !prev;
              if (newTextMode) {
              setIsMediationEnabled(false);
              }
              return newTextMode;
            });
          }}
          className="custom-switch"
        />
        <Form.Check
          type="switch"
          id="tts-mode-switch"
          label={<span className="custom-toggle-label">Audio</span>}
          checked={isTTSEnabled}
          onChange={() => setIsTTSEnabled((prev) => !prev)}
          className="custom-switch"
        />
      </div>

      <Row className="gx-5">
        <Col md={6}>
          <div className="candidate-selector-1">
            <CandidateSelector
              label="candidate 1"
              candidate={candidate1}
              handleCandidateChange={setCandidate1}
              disabled={isSimulated}
              position="left"
              isSpeaking={currentSpeaker === candidate1}
            />
          </div>
        </Col>
        <Col md={6}>
          <div className="candidate-selector-2">
            <CandidateSelector
              label="candidate 2"
              candidate={candidate2}
              handleCandidateChange={setCandidate2}
              disabled={isSimulated}
              position="right"
              isSpeaking={currentSpeaker === candidate2}
              changeCandidateToUser={changeCandidateToUser}
            />
          </div>
        </Col>
      </Row>

      {!isSimulated && (
        <Button
          variant="primary"
          onClick={simulateDebate}
          className="simulate-btn"
          disabled={!topic || !candidate1 || !candidate2}
        >
          Simulate!
        </Button>
      )}

      {isTextMode ? (
        <TextMode
          debateMessages={debateMessages}
          candidate1={candidate1}
          candidate2={candidate2}
        />
      ) : (
        <AnimatedMode
          candidate1={candidate1}
          candidate2={candidate2}
          getAvatarForSpeaker={getAvatarForSpeaker}
          getLatestMessage={getLatestMessage}
          continueDebate={continueDebate}
          closingStatements={closingStatements}
          c1ConversationHistory={c1ConversationHistory}
          c2ConversationHistory={c2ConversationHistory}
          isSimulated={isSimulated}
          isMediationEnabled={isMediationEnabled}
          isUserDebating={isUserDebating}
          userResponse={userResponse}
          setUserResponse={setUserResponse}
          handleUserSubmit={handleUserSubmit}
          handleRequestClosing={handleClosingStatement}
          isClosing={isUserDebatingClosing}
          onDone={handleDone}
          currentSpeaker={currentSpeaker}
          currentChunk={currentChunk}
          isTTSEnabled={isTTSEnabled}
        />

      )}

      {/* Auto scroll when new messages are added only when the user is debating */}
      <div ref={messagesEndRef} />

      {/* User Debating*/}
      {(isTextMode && isSimulated && (isUserDebating || isUserDebatingClosing)) && (
        <UserInputCard
          userResponse={userResponse}
          setUserResponse={setUserResponse}
          onSubmitResponse={isUserDebating ? handleUserSubmit : null}
          onClosingStatement={isUserDebating ? handleClosingStatement : null}
          onDone={isUserDebatingClosing ? handleDone : null}
          isClosing={isUserDebatingClosing}
        />
      )}

      {isDebateOver && (
        <Card className="mt-3 text-center debate-over-card">
          <Card.Body>
            <Card.Title>Thanks for using Debate Dash!</Card.Title>
            <Button variant="primary" onClick={handleSave}>Save Debate</Button>
            <Button variant="secondary" className="ml-2 debate-over-button" onClick={() => window.location.reload()}>
              New Debate
            </Button>
            <Button variant="info" className="ml-2 debate-over-button" onClick={() => setIsTextMode(true)}>
              See Backlog
            </Button>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}

export default DebateComponent;
