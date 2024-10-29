import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDbData } from '../utilities/firebase';
import { Container, Card, Button } from 'react-bootstrap';

function SavedDebatePage({ user }) {
    const { debateID } = useParams();
    const navigate = useNavigate();
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
            <Button variant="secondary" onClick={() => navigate('/')}>Back to Home</Button>
            <h2>{debate.topic}</h2>
            <p>
                Debate between {debate.candidate1} and {debate.candidate2} on {new Date(debate.timestamp).toLocaleString()}
            </p>
            {debate.messages.map((msg, idx) => (
                <Card
                    className={msg.speaker === debate.candidate1 ? "debate-card left-card mt-3" : "debate-card right-card mt-3"}
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
