import { revokeAsync, startAsync } from 'expo-auth-session';
import React, { useEffect, createContext, useContext, useState, ReactNode } from 'react';

import { CLIENT_ID, AUTH_URL, STATE } from '../constants/auth';

import { api } from '../services/api';

interface AuthorizationResponse {
  type: string;
  params: {
    error: string;
    state: string;
    access_token: string;
  };
}

interface User {
  id: number;
  display_name: string;
  email: string;
  profile_image_url: string;
}

interface AuthContextData {
  user: User;
  isLoggingOut: boolean;
  isLoggingIn: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

interface AuthProviderData {
  children: ReactNode;
}

const AuthContext = createContext({} as AuthContextData);

function AuthProvider({ children }: AuthProviderData) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [user, setUser] = useState({} as User);
  const [userToken, setUserToken] = useState('');

  async function signIn() {
    try {
      setIsLoggingIn(true);

      const { type, params } = await startAsync({ authUrl: AUTH_URL }) as AuthorizationResponse;

      if (type === 'success' && params?.error !== 'access_denied') {
        if (params?.state !== STATE) {
          throw 'Invalid state value';
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${params?.access_token}`;

        const userResponse = await api.get('/users');

        setUser(userResponse?.data?.data?.[0]);
        setUserToken(params?.access_token);
      }
    } catch (error) {
      throw new Error();
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function signOut() {
    try {
      setIsLoggingOut(true);

      await revokeAsync(
      {
        token: userToken,
        clientId: CLIENT_ID,
      }, 
      {
        revocationEndpoint: 'https://id.twitch.tv/oauth2/revoke',
      });
    } catch (error) {
    } finally {
      setUser({} as User);
      setUserToken('');

      delete api.defaults.headers.common['Authorization'];

      setIsLoggingOut(false);
    }
  }

  useEffect(() => {
    api.defaults.headers.common['Client-Id'] = CLIENT_ID;
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoggingOut, isLoggingIn, signIn, signOut }}>
      { children }
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = useContext(AuthContext);

  return context;
}

export { AuthProvider, useAuth };
