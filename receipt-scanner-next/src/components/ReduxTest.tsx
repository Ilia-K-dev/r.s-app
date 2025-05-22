import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

const ReduxTest: React.FC = () => {
  // Attempt to access a value from the store (e.g., from the auth slice)
  // Replace 'auth.someValue' with an actual path once slices are populated
  const testValue = useSelector((state: RootState) => state.auth as any); // Using 'any' for now due to empty slice

  return (
    <div>
      <h2>Redux Test Component</h2>
      <p>Test value from store: {JSON.stringify(testValue)}</p>
    </div>
  );
};

export default ReduxTest;
