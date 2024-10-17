import './App.css';
import React, { useState } from "react";
import OpenAI from "openai";

function App() {
  const [candidate1, setCandidate1] = useState("");
  const handleCandidate1 = (event) => {
    setCandidate1(event.target.value);
  };

  const [candidate2, setCandidate2] = useState("");
  const handleCandidate2 = (event) => {
    setCandidate2(event.target.value);
  };

  const [topic, setTopic] = useState("");
  const handleTopic = (event) => {
    setTopic(event.target.value);
  };

  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const [statement1, setStatement1] = useState("");
  const [statement2, setStatement2] = useState("");
  const [response1, setResponse1] = useState("");
  const [response2, setResponse2] = useState("");

  const simulateDebate = async () => {
    const statement1 = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      max_tokens: 50,
      messages: [
        { role: "system", content: `You are ${candidate1}.` },
        { role: "user", content: `What is your stance on "${topic}"?` }
      ]
    });

    setStatement1(statement1.choices[0].message.content);

    const statement2 = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      max_tokens: 50,
      messages: [
        { role: "system", content: `You are ${candidate2}.` },
        { role: "user", content: `What is your stance on "${topic}"?` }
      ]
    });

    setStatement2(statement2.choices[0].message.content);

    const response1 = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      max_tokens: 50,
      messages: [
        { role: "system", content: `You are ${candidate1}.` },
        { role: "user", content: `Respond to ${candidate2}'s Initial Statement: ${statement2.choices[0].message.content}` }
      ]
    });

    setResponse1(response1.choices[0].message.content);

    const response2 = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      max_tokens: 50,
      messages: [
        { role: "system", content: `You are ${candidate2}.` },
        { role: "user", content: `Respond to ${candidate1}'s Initial Statement: ${statement1.choices[0].message.content}` }
      ]
    });

    setResponse2(response2.choices[0].message.content);
  }

  return (
    <div className="App">
      <h1>Debate Dash</h1>
      
      {/* Dropdown for Candidate 1 */}
      <label htmlFor="candidate1">Select Candidate 1:</label>
      <select id="candidate1" value={candidate1} onChange={handleCandidate1}>
        <option value="">Pick a Candidate</option>
        <option value="Donald Trump">Donald Trump</option>
        <option value="Kamala Harris">Kamala Harris</option>
        <option value="JD Vance">JD Vance</option>
        <option value="Tim Walz">Tim Walz</option>
        <option value="Joe Biden">Joe Biden</option>
        <option value="AOC">AOC</option>
        <option value="Barack Obama">Barack Obama</option>
        <option value="Bernie Sanders">Bernie Sanders</option>
        <option value="Nancy Pelosi">Nancy Pelosi</option>
        <option value="Pete Buttigieg">Pete Buttigieg</option>
        <option value="Al Gore">Al Gore</option>
        <option value="Ted Cruz">Ted Cruz</option>
      </select>
      <br/><br/>
      
      {/* Dropdown for Candidate 2 */}
      <label htmlFor="candidate2">Select Candidate 2:</label>
      <select id="candidate2" value={candidate2} onChange={handleCandidate2}>
        <option value="">Pick a Candidate</option>
        <option value="Donald Trump">Donald Trump</option>
        <option value="Kamala Harris">Kamala Harris</option>
        <option value="JD Vance">JD Vance</option>
        <option value="Tim Walz">Tim Walz</option>
        <option value="Joe Biden">Joe Biden</option>
        <option value="AOC">AOC</option>
        <option value="Barack Obama">Barack Obama</option>
        <option value="Bernie Sanders">Bernie Sanders</option>
        <option value="Nancy Pelosi">Nancy Pelosi</option>
        <option value="Pete Buttigieg">Pete Buttigieg</option>
        <option value="Al Gore">Al Gore</option>
        <option value="Ted Cruz">Ted Cruz</option>
      </select>
      <br/><br/>
      
      {/* Input for Debate Topic */}
      <textarea
        value={topic}
        onChange={handleTopic}
        placeholder="Enter the debate topic"
        rows="4"
        cols="50"
      />
      <br/><br/>
      
      <button onClick={simulateDebate}>Simulate!</button>

      <div className="debate">
        {statement1 && (
          <>
            <b>{candidate1}'s Initial Statement:</b>
            <p>{statement1}</p>
          </>
        )}
        {statement2 && (
          <>
            <b>{candidate2}'s Initial Statement:</b>
            <p>{statement2}</p>
          </>
        )}
        {response1 && (
          <>
            <b>{candidate1}'s Response:</b>
            <p>{response1}</p>
          </>
        )}
        {response2 && (
          <>
            <b>{candidate2}'s Response:</b>
            <p>{response2}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
