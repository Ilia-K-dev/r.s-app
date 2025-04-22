import React, { createContext, useState, useContext, useEffect } from 'react';//correct
import { auth } from '../config/firebase';//correct

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const result = await auth.signInWithEmailAndPassword(email, password);
      return result.user;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const signup = async (email, password) => {
    try {
      const result = await auth.createUserWithEmailAndPassword(email, password);
      return result.user;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      throw new Error(error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
