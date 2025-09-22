import { Button } from '@/components/ui/button';
import { MoonIcon, SunIcon } from 'lucide-react';
import { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark';

export type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
});

export const ThemeToggle = () => {
  const context = useContext(ThemeContext);

  function toggleTheme() {
    context.setTheme(context.theme === 'dark' ? 'light' : 'dark');
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="cursor-pointer"
      onClick={toggleTheme}
    >
      {context.theme === 'dark' && <SunIcon />}
      {context.theme === 'light' && <MoonIcon />}
    </Button>
  );
};
