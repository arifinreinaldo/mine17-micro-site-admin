'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { account } from '@/lib/appwrite';
import { Models, ID } from 'appwrite';

interface LocationData {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  ip: string;
  timezone: string;
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
}

interface RegistrationData {
  name: string;
  password: string;
  phone: string;
  fingerprint: string;
  tcAccepted: boolean;
  registrationLocation?: LocationData;
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
      
      // Update last login location (for admin analytics only, not shown in profile)
      try {
        const locationResponse = await fetch('https://ipapi.co/json/');
        if (locationResponse.ok) {
          const data = await locationResponse.json();
          const locationData = {
            country: data.country_name || 'Unknown',
            countryCode: data.country_code || '',
            region: data.region || 'Unknown',
            city: data.city || 'Unknown',
            ip: data.ip || 'unknown',
            timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            timestamp: new Date().toISOString(),
          };
          const currentPrefs = (await account.get()).prefs || {};
          
          await account.updatePrefs({
            ...currentPrefs,
            lastLoginLocation: locationData,
          });
        }
      } catch (locError) {
        console.error('Failed to update login location:', locError);
        // Don't fail login if location update fails
      }
      
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
      
      // Update last login location (for admin analytics only, not shown in profile)
      try {
        const locationResponse = await fetch('https://ipapi.co/json/');
        if (locationResponse.ok) {
          const data = await locationResponse.json();
          const locationData = {
            country: data.country_name || 'Unknown',
            countryCode: data.country_code || '',
            region: data.region || 'Unknown',
            city: data.city || 'Unknown',
            ip: data.ip || 'unknown',
            timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            timestamp: new Date().toISOString(),
          };
          const currentPrefs = (await account.get()).prefs || {};
          
          await account.updatePrefs({
            ...currentPrefs,
            lastLoginLocation: locationData,
          });
        }
      } catch (locError) {
        console.error('Failed to update login location:', locError);
        // Don't fail login if location update fails
      }
      
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

      // Check if email is already registered
      // Appwrite returns 409 conflict when user already exists
      if (
        error.code === 409 ||
        error.type === 'user_already_exists' ||
        (error.message && (
          error.message.toLowerCase().includes('already exists') ||
          error.message.toLowerCase().includes('already registered') ||
          error.message.toLowerCase().includes('user with the requested email already exists')
        ))
      ) {
        throw new Error('EMAIL_ALREADY_EXISTS');
      }

      throw new Error(error.message || 'Failed to send registration OTP. Please try again.');
    }
  };

  const completeRegistration = async (
    userId: string,
    otp: string,
    data: RegistrationData
  ) => {
    try {
      // Step 0: Delete any existing session before creating new one
      // This ensures old session is kicked when registering a new account
      try {
        await account.deleteSession('current');
        console.log('Existing session deleted before registration');
      } catch (error) {
        // No existing session to delete, continue
        console.log('No existing session to delete');
      }

      // Step 1: Verify OTP and create session
      await account.createSession(userId, otp);
      console.log('OTP verified, completing registration...');

      // Step 2: Update user name
      await account.updateName(data.name);

      // Step 3: Set password for the account
      await account.updatePassword(data.password);

      // Step 4: Store metadata in user preferences (including registration location)
      await account.updatePrefs({
        fingerprint: data.fingerprint,
        phone: data.phone,
        tcAcceptedAt: new Date().toISOString(),
        registeredAt: new Date().toISOString(),
        registrationLocation: data.registrationLocation || null,
        lastLoginLocation: data.registrationLocation || null, // First login = registration location
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
