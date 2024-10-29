import React from 'react';
import { Button, Navbar } from 'react-bootstrap';
import { useDbData } from '../utilities/firebase';

function Banner({ user, onSignIn, onSignOut }) {
    // Fetch the user's display name from db
    const [userData, userError] = useDbData(user ? `users/${user.uid}` : '');

    if (userError) {
        return <div>Error loading user data</div>;
    }

    return (
        <Navbar bg="light" expand="lg" className="justify-content-between">
            <Navbar.Brand>Debate Dash</Navbar.Brand>
            {user ? (
                <>
                    <span>
                        Welcome, {userData ? userData.displayName : 'Loading...'}
                    </span>
                    <Button variant="outline-danger" onClick={onSignOut}>
                        Sign Out
                    </Button>
                </>
            ) : (
                <Button variant="outline-primary" onClick={onSignIn}>
                    Sign In / Sign Up
                </Button>
            )}
        </Navbar>
    );
}

export default Banner;
