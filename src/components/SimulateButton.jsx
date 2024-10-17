import React from "react";
import { Button } from "react-bootstrap";

const SimulateButton = ({ onClick }) => {
  return (
    <Button variant="primary" onClick={onClick} className="mt-3">
      Simulate!
    </Button>
  );
};

export default SimulateButton;
