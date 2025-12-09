'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { account } from '@/lib/appwrite';
import { Models, ID } from 'appwrite';

interface RegistrationData {
  name: string;
  password: string;
  fingerprint: string;
  tcAccepted: boolean;
}

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  sendOTP: (email: string) => Promise<string>; // Returns userId
  verifyOTP: (userId: string, otp: string) => Promise<void>;
  registerWithOTP: (email: string) => Promise<string>; // Returns userId for registration
  completeRegistration: (userId: string, otp: string, data: RegistrationData) => Promise<void>;
  logout: () => Promise<void>;
  getUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);

  const getUser = async () => {
    try {
      const userData = await account.get();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      await getUser();
    } catch (error) {
      throw error;
    }
  };

  const sendOTP = async (email: string): Promise<string> => {
    try {
      // Send OTP to email using Appwrite's email token
      // The response contains the userId that must be used for verification
      const token = await account.createEmailToken(ID.unique(), email);

      console.log('OTP sent to:', email);
      // Return the userId from the response, not the generated one
      return token.userId;
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      throw new Error(error.message || 'Failed to send OTP. Please try again.');
    }
  };

  const verifyOTP = async (userId: string, otp: string) => {
    try {
      // Verify OTP and create session using createSession
      await account.createSession(userId, otp);
      await getUser();
      console.log('OTP verified successfully');
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      throw new Error(error.message || 'Invalid OTP. Please check the code and try again.');
    }
  };

  const registerWithOTP = async (email: string): Promise<string> => {
    try {
      // Send OTP to email for registration
      // This creates a pending user that will be verified with OTP
      const token = await account.createEmailToken(ID.unique(), email);

      console.log('Registration OTP sent to:', email);
      return token.userId;
    } catch (error: any) {
      console.error('Error sending registration OTP:', error);
      throw new Error(error.message || 'Failed to send registration OTP. Please try again.');
    }
  };

  const completeRegistration = async (
    userId: string,
    otp: string,
    data: RegistrationData
  ) => {
    try {
      // Step 1: Verify OTP and create session
      await account.createSession(userId, otp);
      console.log('OTP verified, completing registration...');

      // Step 2: Update user name
      await account.updateName(data.name);

      // Step 3: Set password for the account
      await account.updatePassword(data.password);

      // Step 4: Store metadata in user preferences
      await account.updatePrefs({
        fingerprint: data.fingerprint,
        tcAcceptedAt: new Date().toISOString(),
        registeredAt: new Date().toISOString(),
      });

      // Step 5: Get updated user data
      await getUser();

      console.log('Registration completed successfully');
    } catch (error: any) {
      console.error('Error completing registration:', error);
      throw new Error(error.message || 'Failed to complete registration. Please try again.');
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, sendOTP, verifyOTP, registerWithOTP, completeRegistration, logout, getUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export type { RegistrationData };
