// context/SessionContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../SupabaseConfig';
import * as Location from 'expo-location';

type UserLocation = {
  latitude: number;
  longitude: number;
  timestamp?: number;
};

type SessionContextType = {
  currLocation: UserLocation | null;
  setUserLocation: (location: UserLocation | null) => void;
  session: Session | null;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [currLocation, setUserLocation] = useState<UserLocation | null>(null);

  const getCurrentLocation = async () => {
    try {
      // Request permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error("Permission to access location was denied");
        return null;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const userLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
      };
      
      return userLocation;
    } catch (error) {
      console.error("Error getting location:", error);
      return null;
    }
  };

  useEffect(() => {
    // Initialize auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Get initial location
    const initializeLocation = async () => {
      const location = await getCurrentLocation();
      setUserLocation(location);
    };
    
    initializeLocation();
  }, []);

  return (
    <SessionContext.Provider value={{
      session,
      currLocation,
      setUserLocation: (location) => setUserLocation(location)
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};