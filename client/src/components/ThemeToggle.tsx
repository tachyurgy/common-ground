interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export default function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <div className={`toggle-track ${isDark ? 'dark' : ''}`}>
        <span className="toggle-sun">&#9788;</span>
        <span className="toggle-moon">&#9790;</span>
        <div className="toggle-thumb" />
      </div>
    </button>
  );
}
