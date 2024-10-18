import React from "react";
import { Form } from "react-bootstrap";

const CandidateSelector = ({ candidate, handleCandidateChange, label, includeSelf }) => {
  return (
    <Form.Group className="mb-4">
      <Form.Label>{label}</Form.Label>
      <Form.Control as="select" value={candidate} onChange={handleCandidateChange}>
        <option value="">Pick a Candidate</option>
        {includeSelf && <option value="Yourself">Yourself</option>}
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
      </Form.Control>
    </Form.Group>
  );
};

export default CandidateSelector;
