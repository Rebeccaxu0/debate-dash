import React, { useState } from 'react';
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '../utilities/firebase';
import { useDbUpdate } from '../utilities/firebase';

const AuthForm = ({ onAuthSuccess, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  // Initialize useDbUpdate hook to update user data
  const [updateUser] = useDbUpdate(`/users`);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignUp) {
        // Sign Up Flow
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userData = {
          displayName: displayName || email.split('@')[0], // Use input or fallback to email prefix
          email: user.email,
        };

        await updateUser({ [user.uid]: userData });

        onAuthSuccess(user);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess(userCredential.user);
      }
      onClose();
    } catch (err) {
      setError("Invalid Credentials");
    }
  };

  return (
    <div className="auth-form">
      <h3>{isSignUp ? 'Sign Up' : 'Sign In'}</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleAuth}>
        {isSignUp && (
          <div className="mb-3">
            <label htmlFor="displayName" className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
        )}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
        <button type="button" className="btn btn-link" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
