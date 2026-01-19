'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label="Alternar tema"
    >
      {isDark ? '☀️' : '🌙'}

      <style jsx>{`
        .theme-toggle {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          font-size: 22px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .theme-toggle:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(20deg) scale(1.1);
        }

        .theme-toggle:active {
          transform: rotate(20deg) scale(0.95);
        }
      `}</style>
    </button>
  );
}
