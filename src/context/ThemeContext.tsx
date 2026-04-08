import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'soft' | 'dim' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('ems_theme');
    if (savedTheme === 'dark' || savedTheme === 'light' || savedTheme === 'dim' || savedTheme === 'soft') return savedTheme as Theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'dim', 'soft');
    root.classList.add(theme);
    localStorage.setItem('ems_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === 'light') return 'soft';
      if (prev === 'soft') return 'dim';
      if (prev === 'dim') return 'dark';
      return 'light';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
