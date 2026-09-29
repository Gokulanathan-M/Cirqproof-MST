import React, { createContext, useContext, useState, useCallback } from 'react';
import { api, setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const ROLES = {
  PRODUCER: {
    id: 'PRODUCER',
    name: 'VoltForge Dynamics (Producer)',
    address: '0x12Fa908bCd8721Fa009218Fae0012A349887CcBa',
    desc: 'Generates industrial recyclable stream and deposits escrow bonds.',
    email: 'producer@cirqproof.io',
  },
  RECYCLER: {
    id: 'RECYCLER',
    name: 'EcoLoop Hydrometallurgy (Recycler)',
    address: '0x3F881c2069B56eF70F04D6a61DEa3D8f4f9a0A21',
    desc: 'Processes waste streams, uploads sensor telemetry and claims recovery.',
    email: 'recycler@cirqproof.io',
  },
  AUDITOR: {
    id: 'AUDITOR',
    name: 'BureauVeritas AI Audit Unit (Auditor)',
    address: '0x77A19bE492801FdA21004C9912AcDa78912066fB',
    desc: 'Monitors integrity, reviews AI reports, and stakes fraud challenges.',
    email: 'auditor@cirqproof.io',
  },
  BUYER: {
    id: 'BUYER',
    name: 'CathodePure Advanced Materials (Buyer)',
    address: '0x99104Abe9128004CdaEF01928374aed881029348',
    desc: 'Confirms certified weight intake and pays downstream invoices.',
    email: 'buyer@cirqproof.io',
  }
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('cirqproof_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.token) setAuthToken(parsed.token);
      return parsed;
    }
    return null;
  });

  const login = useCallback(async (roleKey) => {
    const role = ROLES[roleKey];
    if (!role) return false;

    try {
      // Attempt real backend login
      let result;
      try {
        result = await api.login({
          email: role.email,
          password: 'cirqproof2026!',
        });
      } catch (loginErr) {
        console.warn('Login failed, attempting auto-register:', loginErr.message);
        result = await api.register({
          name: role.name,
          email: role.email,
          password: 'cirqproof2026!',
          role: roleKey,
        });
      }

      const user = {
        ...role,
        backendUser: result?.user || null,
        token: result?.token || null,
      };

      if (user.token) {
        setAuthToken(user.token);
      }

      setCurrentUser(user);
      localStorage.setItem('cirqproof_user', JSON.stringify(user));
      return true;
    } catch (err) {
      console.error('Backend auth failed completely:', err.message);
      // Still allow UI login but API calls will fail
      setCurrentUser(role);
      localStorage.setItem('cirqproof_user', JSON.stringify(role));
      return true;
    }
  }, []);

  const selectRole = useCallback((roleKey) => {
    login(roleKey);
  }, [login]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem('cirqproof_user');
    localStorage.removeItem('cirqproof_token');
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, selectRole, logout, ROLES }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
