import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc } from '../firebase';

export interface ThemeConfig {
  siteName: string;
  logoUrl?: string;
  primaryColor: string;
  primaryHoverColor: string;
  contactWhatsApp: string;
}

const DEFAULT_THEME: ThemeConfig = {
  siteName: 'V E C T U R A',
  primaryColor: '#7C3AED',
  primaryHoverColor: '#8b5cf6',
  contactWhatsApp: '5582999999999'
};

export function useThemeConfig() {
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, 'settings', 'themeConfig');
    const unsubscribe = onSnapshot(docRef, (docSnap: any) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as ThemeConfig;
        setTheme({
          siteName: data.siteName || DEFAULT_THEME.siteName,
          logoUrl: data.logoUrl,
          primaryColor: data.primaryColor || DEFAULT_THEME.primaryColor,
          primaryHoverColor: data.primaryHoverColor || DEFAULT_THEME.primaryHoverColor,
          contactWhatsApp: data.contactWhatsApp || DEFAULT_THEME.contactWhatsApp
        });
      } else {
        setDoc(docRef, DEFAULT_THEME).catch(err => console.error(err));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Apply theme to DOM
    if (theme.primaryColor) {
      document.documentElement.style.setProperty('--theme-primary', theme.primaryColor);
    }
    if (theme.primaryHoverColor) {
      document.documentElement.style.setProperty('--theme-primary-hover', theme.primaryHoverColor);
    }
  }, [theme]);

  // Expose an updater utility
  const updateTheme = async (updates: Partial<ThemeConfig>) => {
    const docRef = doc(db, 'settings', 'themeConfig');
    await setDoc(docRef, { ...theme, ...updates }, { merge: true });
  };

  return { theme, updateTheme, loading };
}
