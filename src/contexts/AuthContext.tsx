import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, storageService } from '@/lib/appwrite'; // Added storageService

interface User {
  $id: string;
  name: string;
  email: string;
  prefs?: any;
  avatarUrl?: string; // Add avatarUrl here
  // Add new profile fields
  age?: number;
  occupation?: string;
  idealRetirementAge?: number;
  country?: string;
  themePreference?: 'light' | 'dark' | 'system';
  themeColorsPrimary?: string;
  themeColorsAccent?: string;
  currency?: string; // ensure currency is part of the user object in context
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<any>; // Added to fetch profile
  updateUserThemePreferences: (userId: string, preferences: { themePreference?: 'light' | 'dark' | 'system', themeColorsPrimary?: string, themeColorsAccent?: string }) => Promise<void>;
  refreshUser: () => Promise<void>; // Added to refresh user data
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const fetchFullUserProfile = async (userId: string) => {
    try {
      const profileDoc = await authService.getUserProfile(userId);
      if (profileDoc) {
        return {
          avatarUrl: profileDoc.avatarUrl ? storageService.getFileView(profileDoc.avatarUrl as string).toString() : undefined,
          age: profileDoc.age,
          occupation: profileDoc.occupation,
          idealRetirementAge: profileDoc.idealRetirementAge,
          country: profileDoc.country,
          themePreference: profileDoc.themePreference,
          themeColorsPrimary: profileDoc.themeColorsPrimary,
          themeColorsAccent: profileDoc.themeColorsAccent,
          currency: profileDoc.currency,
        };
      }
    } catch (error) {
      console.error("Failed to fetch full user profile:", error);
    }
    return {};
  };


  const checkUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      if (userData) {
        const profileDetails = await fetchFullUserProfile(userData.$id);
        setUser({ ...userData, ...profileDetails });
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await authService.login(email, password);
      const userData = await authService.getCurrentUser();
      if (userData) {
        const profileDetails = await fetchFullUserProfile(userData.$id);
        setUser({ ...userData, ...profileDetails });
      } else {
        setUser(null);
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      await authService.createAccount(email, password, name);
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        // createUserProfile initializes with defaults, including theme
        await authService.createUserProfile(currentUser.$id, { name, email });
        const profileDetails = await fetchFullUserProfile(currentUser.$id); // Fetch the newly created profile
        setUser({ ...currentUser, ...profileDetails });
      } else {
        setUser(null);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const updateUserThemePreferences = async (userId: string, preferences: { themePreference?: 'light' | 'dark' | 'system', themeColorsPrimary?: string, themeColorsAccent?: string }) => {
    try {
      await authService.updateUserProfile(userId, preferences);
      // Optimistically update user state or call refreshUser
      setUser(prevUser => prevUser ? ({ ...prevUser, ...preferences }) : null);
    } catch (error) {
      console.error("Failed to update theme preferences:", error);
      // Potentially show a toast to the user
    }
  };

  const refreshUser = async () => {
    if (user?.$id) {
      setLoading(true);
      try {
        const userData = await authService.getCurrentUser(); // Re-fetch core user data
        if (userData) {
          const profileDetails = await fetchFullUserProfile(userData.$id);
          setUser({ ...userData, ...profileDetails });
        } else {
          setUser(null); // Should not happen if user was previously logged in
        }
      } catch (error) {
        console.error("Error refreshing user data:", error);
        // Handle error, maybe logout user if session is invalid
      } finally {
        setLoading(false);
      }
    }
  };


  const value = {
    user,
    loading,
    login,
    register,
    logout,
    fetchUserProfile: fetchFullUserProfile, // Ensure this returns the full profile for other uses if any
    updateUserThemePreferences,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
