import React from "react";
import { Button } from "react-bootstrap";

const SimulateButton = ({ onClick, disabled }) => {
  return (
    <Button variant="primary" onClick={onClick} className="mt-3" disabled={disabled}>
      Simulate!
    </Button>
  );
};

export default SimulateButton;
