import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDbData } from '../utilities/firebase';
import { Container, Card } from 'react-bootstrap';

function SavedDebatePage({ user }) {
    const { debateID } = useParams();
    const [debate, setDebate] = useState(null);
    const [debateData, dbError] = useDbData(user ? `debates/${user.uid}/${debateID}` : '');

    useEffect(() => {
        if (debateData) {
            setDebate(debateData);
        }
    }, [debateData]);

    if (dbError) return <div>Error loading debate: {dbError.message}</div>;
    if (!debate) return <div>Loading...</div>;

    return (
        <Container className="App">
            <h2>{debate.topic}</h2>
            <p>
                Debate between {debate.candidate1} and {debate.candidate2} on {new Date(debate.timestamp).toLocaleString()}
            </p>
            {debate.messages.map((msg, idx) => (
                <Card
                    className={
                        msg.speaker === "Mediator"
                        ? "debate-card mediator-card mt-3"
                        : msg.speaker === debate.candidate1
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
            ))}
        </Container>
    );
}

export default SavedDebatePage;
