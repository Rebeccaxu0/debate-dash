import React, { useState } from "react";
import CandidateSelector from '../components/CandidateSelector';
import DebateTopicInput from '../components/DebateTopicInput';
import DebateDisplay from '../components/DebateDisplay';
import SimulateButton from '../components/SimulateButton';
import { Container } from "react-bootstrap";
import OpenAI from "openai";
import './Home.css';

function Home() {
  const [candidate1, setCandidate1] = useState("");
  const [candidate2, setCandidate2] = useState("");
  const [topic, setTopic] = useState("");
  const [statement1, setStatement1] = useState("");
  const [statement2, setStatement2] = useState("");
  const [response1, setResponse1] = useState("");
  const [response2, setResponse2] = useState("");

  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const simulateDebate = async () => {
    const statement1 = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      max_tokens: 100,
      messages: [
        { role: "system", content: `You are ${candidate1}.` },
        { role: "user", content: `What is your stance on "${topic}"?` }
      ]
    });
    setStatement1(statement1.choices[0].message.content);

    const statement2 = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      max_tokens: 100,
      messages: [
        { role: "system", content: `You are ${candidate2}.` },
        { role: "user", content: `What is your stance on "${topic}"?` }
      ]
    });
    setStatement2(statement2.choices[0].message.content);

    const response1 = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      max_tokens: 100,
      messages: [
        { role: "system", content: `You are ${candidate1}.` },
        { role: "user", content: `Respond to ${candidate2}'s statement: ${statement2.choices[0].message.content}` }
      ]
    });
    setResponse1(response1.choices[0].message.content);

    const response2 = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      max_tokens: 100,
      messages: [
        { role: "system", content: `You are ${candidate2}.` },
        { role: "user", content: `Respond to ${candidate1}'s statement: ${statement1.choices[0].message.content}` }
      ]
    });
    setResponse2(response2.choices[0].message.content);
  };

  return (
    <Container className="App">
      <h1>Debate Dash</h1>
      <CandidateSelector label="Select Candidate 1:" candidate={candidate1} handleCandidateChange={(e) => setCandidate1(e.target.value)} />
      <CandidateSelector label="Select Candidate 2:" candidate={candidate2} handleCandidateChange={(e) => setCandidate2(e.target.value)} />
      <DebateTopicInput topic={topic} handleTopicChange={(e) => setTopic(e.target.value)} />
      <SimulateButton onClick={simulateDebate} />
      <DebateDisplay
        statement1={statement1}
        statement2={statement2}
        response1={response1}
        response2={response2}
        candidate1={candidate1}
        candidate2={candidate2}
      />
    </Container>
  );
}

export default Home;
