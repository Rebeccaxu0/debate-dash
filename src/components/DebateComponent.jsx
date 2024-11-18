import React, { useState, useEffect, useRef } from "react";
import CandidateSelector from './CandidateSelector';
import DebateTopicInput from './DebateTopicInput';
import TextMode from "./TextMode";
import UserInputCard from "./UserInputCard";
import AnimatedMode from "./AnimatedMode";
import { Container, Card, Button, Form, Row, Col } from "react-bootstrap";
import { getCandidateResponse } from '../utilities/openaiApi';
import { getCandidateStance } from '../utilities/searchAPI';
import './DebateComponent.css';
import avatar from './avatar.png';

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

  const loadVoices = () => {
    console.log("Loading voices...");
    return new Promise((resolve) => {
      let voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        console.log("Voices loaded immediately:", voices.map(v => v.name));
        resolve(voices);
      } else {
        console.log("Voices not immediately available, waiting for 'voiceschanged' event...");
        const voicesChangedHandler = () => {
          voices = window.speechSynthesis.getVoices();
          console.log("Voices loaded after event:", voices.map(v => v.name));
          resolve(voices);
          window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
        };
        window.speechSynthesis.addEventListener('voiceschanged', voicesChangedHandler);
      }
    });
  };
  
  const speakText = async (text, speaker) => {
    console.log(`Preparing to speak: "${text}" by speaker: "${speaker}"`);
  
    const voices = await loadVoices(); // Ensure voices are loaded
    if (!voices || voices.length === 0) {
      console.error("No voices available for speech synthesis.");
      return;
    }
    const speakerGender = candidateGenderMap[speaker];
    console.log(`Speaker: ${speaker}, Gender: ${speakerGender}`);
    console.log("Available voices:", voices.map((v) => v.name));
  
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = 1.5; 
  
    // Assign voices based on gender and candidate position
    if (speakerGender === "male") {
      //if (speaker === candidate1) {
        utterance.voice = voices.find((voice) => voice.name === "Microsoft David - English (United States)") || voices[0];
      //} else if (speaker === candidate2) {
       // utterance.voice = voices.find((voice) => voice.name === "Google UK English Male") || voices[0];
      //}
    } else if (speakerGender === "female") {
      //if (speaker === candidate1) {
        utterance.voice = voices.find((voice) => voice.name === "Microsoft Zira - English (United States)") || voices[0];
      //} else if (speaker === candidate2) {
      //  utterance.voice = voices.find((voice) => voice.name === "Google UK English Female") || voices[0];
      //}
    }
  
    // Log the selected voice
    console.log(`Selected voice: "${utterance.voice.name}"`);
  
    return new Promise((resolve) => {
      utterance.onstart = () => {
        console.log(`Started speaking: "${text}" by "${speaker}"`);
      };
  
      utterance.onend = () => {
        console.log(`Finished speaking: "${text}" by "${speaker}"`);
        resolve();
      };
  
      utterance.onerror = (error) => {
        console.error("Speech synthesis error:", error);
        resolve();
      };
  
      window.speechSynthesis.speak(utterance);
      console.log(`Utterance queued for speaking: "${text}" by "${speaker}"`);
    });
  };
  
  
  const processSpeechQueueSequentially = async (queue) => {
    console.log("Processing speech queue:", queue);
    while (queue.length > 0) {
      const { text, speaker } = queue.shift();
      console.log("Processing speech:", { text, speaker });
      await speakText(text, speaker); // Wait for the current speech to finish
    }
    console.log("Finished processing speech queue.");
  };



  const simulateDebate = async () => {
    const speechQueue = [];

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
    speechQueue.push({ text: candidate1Response, speaker: candidate1 });
    await processSpeechQueueSequentially(speechQueue);

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
      speechQueue.push({ text: candidate2Response, speaker: candidate2 });
      await processSpeechQueueSequentially(speechQueue);

      // Disable the fields after simulation starts
      setIsSimulated(true);

      // Automatically continue the debate if mediation is not enabled
      if (!isMediationEnabled) {
        await continueDebate(c1History, c2History, 0);
      }

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
    speechQueue.push({ text: candidate1Response, speaker: candidate1 });
    await processSpeechQueueSequentially(speechQueue);

    const userPrompt2 = { role: "user", content: ` ${candidate1} responded with this: "${candidate1Response}". Please make a closing statement on ${topic}. Please limit to one paragraph.` };
    c2History.push(userPrompt2);

    const candidate2Response = await getCandidateResponse(c2History);

    c2History.push({ role: "system", content: candidate2Response });
    setC2ConversationHistory(c2History);  // Update state

    setDebateMessages(prev => [...prev, { speaker: candidate2, message: candidate2Response }]);
    speechQueue.push({ text: candidate2Response, speaker: candidate2 });
    await processSpeechQueueSequentially(speechQueue);

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
    speechQueue.push({ text: candidate1Response, speaker: candidate1 });
     await processSpeechQueueSequentially(speechQueue);


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
    speechQueue.push({ text: candidate2Response, speaker: candidate2 });
    await processSpeechQueueSequentially(speechQueue);

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

      <Button variant="primary" onClick={simulateDebate} className="mt-3" disabled={isSimulateDisabled}>
        Simulate!
      </Button>

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
        />

      )}

      {/* Auto scroll when new messages are added only when the user is debating */}
      <div ref={messagesEndRef} />

      {/* User Debating*/}
      {(isUserDebating || isUserDebatingClosing) && (
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
        <Card className="mt-3 text-center">
          <Card.Body>
            <Card.Title>Thanks for using Debate Dash!</Card.Title>
            <Button variant="primary" onClick={handleSave}>Save Debate</Button>
            <Button variant="secondary" className="ml-2" onClick={() => window.location.reload()}>
              New Debate
            </Button>
            <Button variant="info" className="ml-2" onClick={() => setIsTextMode(true)}>
              See Backlog
            </Button>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}

export default DebateComponent;
