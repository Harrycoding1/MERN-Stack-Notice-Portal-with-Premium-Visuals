import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Calendar, Clock, BookOpen, AlertCircle, 
  Trash2, PlusCircle, CheckCircle, HelpCircle, Layers
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');

  // Notices State
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [department, setDepartment] = useState('All');
  const [expiryDays, setExpiryDays] = useState('');

  // Form Validation Errors
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
  const [expiryError, setExpiryError] = useState('');

  // Notification Toast State
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: '' }

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchAdminNotices();
    }
  }, [token]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchAdminNotices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notices');
      if (!response.ok) {
        throw new Error('Failed to retrieve notices.');
      }
      const data = await response.json();
      setNotices(data);
    } catch (err) {
      console.error(err);
      showToast('error', 'Could not sync with noticeboard database.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    let isValid = true;

    if (!title.trim()) {
      setTitleError('Notice publishing requires a valid structured title.');
      isValid = false;
    } else {
      setTitleError('');
    }

    if (!content.trim()) {
      setContentError('Notice description content is required.');
      isValid = false;
    } else {
      setContentError('');
    }

    const numericRegex = /^[0-9]+$/;
    if (!expiryDays.trim()) {
      setExpiryError('Please define notice visible lifetime (days).');
      isValid = false;
    } else if (!numericRegex.test(expiryDays) || parseInt(expiryDays) <= 0) {
      setExpiryError('Lifespan values must represent a valid positive integer.');
      isValid = false;
    } else {
      setExpiryError('');
    }

    return isValid;
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch('/api/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          content,
          category,
          department,
          expiryDays
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Notice publication failed.');
      }

      showToast('success', 'Notice published successfully!');
      
      // Clear Form
      setTitle('');
      setContent('');
      setCategory('GENERAL');
      setDepartment('All');
      setExpiryDays('');
      
      // Re-fetch
      fetchAdminNotices();
    } catch (err) {
      console.error(err);
      showToast('error', err.message || 'Failed to publish notice.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;

    try {
      const response = await fetch(`/api/notices/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove notice.');
      }

      showToast('success', 'Notice removed successfully.');
      fetchAdminNotices();
    } catch (err) {
      console.error(err);
      showToast('error', err.message || 'Could not delete notice.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="portal-container" style={{ maxWidth: '1300px' }}>
      <div className="dashboard-title-bar">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Admin Portal
          </motion.h1>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Logged in as: <strong>{email}</strong>
          </span>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Publish Notice Form */}
        <motion.section 
          className="publish-panel glass-panel"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={22} style={{ color: 'var(--primary-color)' }} />
            Create Campus Notice
          </h2>

          <form onSubmit={handlePublish} noValidate>
            <div className="form-group">
              <label htmlFor="title">Notice Title</label>
              <div className="form-control-wrapper">
                <FileText className="form-control-icon" size={18} />
                <input
                  type="text"
                  id="title"
                  className={`form-control-field ${titleError ? 'error' : ''}`}
                  placeholder="e.g., Midterm Exam Schedule"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (titleError) setTitleError('');
                  }}
                />
              </div>
              {titleError && (
                <div className="error-text">
                  <AlertCircle size={13} />
                  <span>{titleError}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="content">Notice Content / Body</label>
              <div className="form-control-wrapper">
                <textarea
                  id="content"
                  className={`form-control-field ${contentError ? 'error' : ''}`}
                  placeholder="Detailed announcement context here..."
                  style={{ minHeight: '120px', paddingLeft: '1rem', paddingTop: '0.75rem', fontFamily: 'inherit' }}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (contentError) setContentError('');
                  }}
                />
              </div>
              {contentError && (
                <div className="error-text">
                  <AlertCircle size={13} />
                  <span>{contentError}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <div className="form-control-wrapper">
                  <Layers className="form-control-icon" size={18} />
                  <select
                    id="category"
                    className="form-select-field"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="GENERAL">General</option>
                    <option value="URGENT">Urgent</option>
                    <option value="EVENT">Event</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="department">Target Department</label>
                <div className="form-control-wrapper">
                  <BookOpen className="form-control-icon" size={18} />
                  <select
                    id="department"
                    className="form-select-field"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="All">All Departments</option>
                    <option value="BBA">BBA</option>
                    <option value="IT">IT</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Science">Science</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="expiry">Display Duration (Days)</label>
              <div className="form-control-wrapper">
                <Clock className="form-control-icon" size={18} />
                <input
                  type="text"
                  id="expiry"
                  className={`form-control-field ${expiryError ? 'error' : ''}`}
                  placeholder="e.g., 7"
                  value={expiryDays}
                  onChange={(e) => {
                    setExpiryDays(e.target.value);
                    if (expiryError) setExpiryError('');
                  }}
                />
              </div>
              {expiryError && (
                <div className="error-text">
                  <AlertCircle size={13} />
                  <span>{expiryError}</span>
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              <PlusCircle size={18} />
              <span>Publish Notice</span>
            </button>
          </form>
        </motion.section>

        {/* Manage Notices List */}
        <motion.section 
          className="manage-panel glass-panel"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="manage-header">
            <h2>Active Notices</h2>
            <span className="manage-count">{notices.length} active</span>
          </div>

          {loading ? (
            <div className="loader-container" style={{ padding: '2rem 0' }}>
              <div className="spinner" style={{ width: '35px', height: '35px' }}></div>
            </div>
          ) : (
            <div className="dashboard-notice-list">
              <AnimatePresence mode="popLayout">
                {notices.length === 0 ? (
                  <motion.div 
                    key="empty"
                    style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <HelpCircle size={32} style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }} />
                    <p>No active notices published yet.</p>
                  </motion.div>
                ) : (
                  notices.map((notice) => (
                    <motion.div
                      key={notice._id}
                      className={`dashboard-notice-item ${notice.category.toLowerCase()}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ type: 'spring', stiffness: 120 }}
                      layout
                    >
                      <div className="item-main-details">
                        <h4>{notice.title}</h4>
                        <div className="item-meta-labels">
                          <span 
                            className={`badge category-${notice.category.toLowerCase()}`}
                            style={{ padding: '0.15rem 0.45rem', fontSize: '0.65rem' }}
                          >
                            {notice.category}
                          </span>
                          <span 
                            className="badge dept-badge"
                            style={{ padding: '0.15rem 0.45rem', fontSize: '0.65rem', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                          >
                            {notice.department}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <Calendar size={11} />
                            {formatDate(notice.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDelete(notice._id)}
                        className="delete-notice-btn"
                        title="Delete Notice"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.section>
      </div>

      {/* Interactive Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            className={`toast-notification ${toast.type}`}
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 120 }}
          >
            {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
