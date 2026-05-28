import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, LayoutDashboard, Megaphone, Lock } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [hasToken, setHasToken] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    // Determine initial theme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.body.classList.add('dark-theme');
      setIsDark(true);
    } else {
      document.body.classList.remove('dark-theme');
      setIsDark(false);
    }

    // Handler to check authentication storage events from other components
    const handleAuthChange = () => {
      setHasToken(!!localStorage.getItem('token'));
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setHasToken(false);
    navigate('/');
    window.dispatchEvent(new Event('auth-change'));
  };

  return (
    <header className="site-header">
      <div className="nav-container">
        <Link to="/" className="brand">
          <div className="brand-icon">U</div>
          <span className="brand-logo-text">UniStream</span>
        </Link>
        
        <nav aria-label="Main Navigation">
          <ul className="nav-links">
            <li>
              <Link 
                to="/" 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                <Megaphone size={18} />
                <span>Notices</span>
              </Link>
            </li>
            
            {hasToken ? (
              <>
                <li>
                  <Link 
                    to="/dashboard" 
                    className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                  >
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={handleLogout} 
                    className="nav-link" 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link 
                  to="/login" 
                  className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
                >
                  <Lock size={18} />
                  <span>Portal Login</span>
                </Link>
              </li>
            )}
            
            <li>
              <button 
                onClick={toggleTheme} 
                className="theme-switch-btn"
                aria-label="Toggle dark/light theme"
                title={isDark ? "Toggle Light Mode" : "Toggle Dark Mode"}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
