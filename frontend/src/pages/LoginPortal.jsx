import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Key, AlertCircle, LogIn } from 'lucide-react';

const LoginPortal = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Validation Errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    let isValid = true;
    
    // Email verification
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Campus email address cannot be left empty.');
      isValid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError('Please provide a valid email structure (e.g., user@domain.com).');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Password verification
    if (!password) {
      setPasswordError('Security authentication password is required.');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must maintain a baseline of at least 8 characters.');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed.');
      }

      // Store auth credentials
      localStorage.setItem('token', data.token);
      localStorage.setItem('email', data.email);

      // Notify header and app that auth state has updated
      window.dispatchEvent(new Event('auth-change'));
      
      // Redirect to Admin Dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setServerError(err.message || 'Server error occurred during login. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-page-container">
      <motion.div 
        className="auth-card glass-panel"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', damping: 15 }}
      >
        <div className="form-header">
          <h2>Portal Authentication</h2>
          <p>Provide secure campus credentials to access the administrative dashboard.</p>
        </div>

        {serverError && (
          <motion.div 
            className="error-text" 
            style={{ 
              backgroundColor: 'var(--accent-urgent-bg)', 
              padding: '0.75rem', 
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.25rem' 
            }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{serverError}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Campus Email Address</label>
            <div className="form-control-wrapper">
              <Mail className="form-control-icon" size={18} />
              <input
                type="email"
                id="email"
                className={`form-control-field ${emailError ? 'error' : ''}`}
                placeholder="username@unistream.edu"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
              />
            </div>
            {emailError && (
              <div className="error-text">
                <AlertCircle size={13} />
                <span>{emailError}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Security Password</label>
            <div className="form-control-wrapper">
              <Key className="form-control-icon" size={18} />
              <input
                type="password"
                id="password"
                className={`form-control-field ${passwordError ? 'error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
              />
            </div>
            {passwordError && (
              <div className="error-text">
                <AlertCircle size={13} />
                <span>{passwordError}</span>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ marginTop: '2rem' }}
          >
            <LogIn size={18} />
            <span>{isSubmitting ? 'Authenticating...' : 'Login to Dashboard'}</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPortal;
