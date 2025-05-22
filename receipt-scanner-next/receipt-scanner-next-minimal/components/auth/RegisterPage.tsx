import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/utils/firebase';

// Last Modified: 5/9/2025, 10:57:15 PM
// Note: Added logging to check component rendering and handleSubmit calls.
// Last Modified: 5/9/2025, 10:52:16 PM
// Note: Implemented registration form and integrated with Firebase authentication.

const RegisterPage: React.FC = () => {
  console.log('RegisterPage rendering'); // Added for debugging
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('handleSubmit called'); // Added for debugging
    e.preventDefault();
    setError(null); // Clear previous errors

    console.log('Attempting registration...'); // Added for debugging

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('Registration successful, redirecting to login...'); // Added for debugging
      // Redirect to login page on successful registration
      router.push('/login');
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Registration error:', err); // Added for debugging
      setError(err.message); // Display Firebase error message
    }
  };

  return (
    <div>
      <h2>Register Page</h2>
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
        <button type="submit">Register</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default RegisterPage;
