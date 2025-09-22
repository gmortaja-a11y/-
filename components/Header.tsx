import React from 'react';
import { Theme } from '../types';

interface HeaderProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const Header: React.FC<HeaderProps> = ({ theme, setTheme }) => {
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white p-5 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold flex items-center gap-3">
          <span>🎨</span>
          <span>منصة الأسلوب</span>
        </div>
        <button
          onClick={toggleTheme}
          className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-full flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
        >
          <span className="text-xl">{theme === 'light' ? '🌙' : '☀️'}</span>
          <span>{theme === 'light' ? 'الوضع الليلي' : 'الوضع النهاري'}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;