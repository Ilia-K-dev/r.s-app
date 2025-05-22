"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/utils/firebase';

// Last Modified: 5/9/2025, 10:53:21 PM
// Note: Added "use client" directive to enable client-side hooks.
// Last Modified: 5/9/2025, 10:51:59 PM
// Note: Implemented login form and integrated with Firebase authentication.

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    console.log('Attempting login...'); // Added for debugging

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful, redirecting...'); // Added for debugging
      // Redirect to receipts page on successful login
      router.push('/receipts');
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Login error:', err); // Added for debugging
      setError(err.message); // Display Firebase error message
    }
  };

  return (
    <div>
      <h2>Login Page</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default LoginPage;
