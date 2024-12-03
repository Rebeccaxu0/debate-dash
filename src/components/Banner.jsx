import React from 'react';
import { Button, Navbar, Nav } from 'react-bootstrap';
import { useDbData } from '../utilities/firebase';
import { LayoutSidebarInset, PencilSquare, PersonCircle, BoxArrowRight } from 'react-bootstrap-icons';
import './Banner.css';
import logo from '../assets/debate-dash-logo.png';

function Banner({ user, onSignIn, onSignOut, onToggleSidebar, setSelectedDebateId }) {
    // Fetch the user's display name from db
    const [userData, userError] = useDbData(user ? `users/${user.uid}` : '');

    const handleNewDebate = () => {
        setSelectedDebateId(null);
        window.location.reload()
    };

    if (userError) {
        return <div>Error loading user data</div>;
    }

    return (
        <Navbar className="custom-navbar">
            <div className="navbar-content">
                <Nav className="navbar-left">
                    <LayoutSidebarInset onClick={onToggleSidebar} className="icon-button icon-sidebar" title="Saved Debates" />
                    <PencilSquare onClick={handleNewDebate} className="icon-button icon-plus" title="New Debate" />
                </Nav>
                <Navbar.Brand className="navbar-brand">
                    <img src={logo} alt="Debate Dash Logo" className="navbar-logo" />
                </Navbar.Brand>
                <Nav className="navbar-right">

                    {user ? (
                        <>
                            <span className="username">Welcome, {userData ? userData.displayName : 'Loading...'}</span>
                            <BoxArrowRight onClick={onSignOut} className="icon-button-logout" title="Sign Out" />
                        </>
                    ) : (
                        <Button variant="link" onClick={onSignIn} style={{fontSize: '1.1rem', fontWeight: '500'}}>
                            <PersonCircle style={{marginRight: '0.3em', fontSize: '1.6rem'}} />
                            Sign In
                        </Button>
                    )}
                </Nav>
            </div>
        </Navbar>
    );
}

export default Banner;
