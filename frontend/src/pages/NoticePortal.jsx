import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, Award, AlertCircle, Info, Filter } from 'lucide-react';

const NoticePortal = ({ onUrgentNoticeLoaded }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeDept, setActiveDept] = useState('All');
  const [searchVal, setSearchVal] = useState('');
  const [deptCounts, setDeptCounts] = useState({ All: 0, BBA: 0, IT: 0, Engineering: 0, Science: 0 });

  const departments = ['All', 'BBA', 'IT', 'Engineering', 'Science'];

  const fetchNotices = async () => {
    try {
      setLoading(true);
      // Fetch notices with filters
      const response = await fetch(`/api/notices?department=${activeDept}&search=${searchVal}`);
      if (!response.ok) {
        throw new Error('Failed to retrieve notices.');
      }
      const data = await response.json();
      setNotices(data);

      // Trigger callback with the first urgent notice if available
      const urgentNotice = data.find(n => n.category === 'URGENT');
      if (onUrgentNoticeLoaded) {
        onUrgentNoticeLoaded(urgentNotice || null);
      }

      // Calculate counts for departments in the current query space
      // Let's count them based on a query fetching all notices (no search or dept filter)
      const allRes = await fetch('/api/notices');
      if (allRes.ok) {
        const allData = await allRes.json();
        const counts = { All: allData.length, BBA: 0, IT: 0, Engineering: 0, Science: 0 };
        allData.forEach(notice => {
          if (notice.department !== 'All' && counts[notice.department] !== undefined) {
            counts[notice.department]++;
          }
        });
        setDeptCounts(counts);
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to connect to noticeboard server.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [activeDept, searchVal]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'URGENT': return <AlertCircle size={16} />;
      case 'EVENT': return <Award size={16} />;
      default: return <Info size={16} />;
    }
  };

  // Framer Motion Animation Configs
  const listContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const cardVariants = {
    hidden: { y: 25, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 90, damping: 14 } },
    exit: { y: -20, opacity: 0, transition: { duration: 0.2 } }
  };

  return (
    <div className="portal-container">
      <div className="portal-hero">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
        >
          UniStream Notice Portal
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Explore official schedules, events, and announcements from academic departments.
        </motion.p>
      </div>

      <div className="portal-layout">
        {/* Sidebar Filtering Control Panel */}
        <aside className="sidebar-panel glass-panel">
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search notices..." 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-section">
            <h3>
              <Filter size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
              Departments
            </h3>
            <div className="filter-list">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setActiveDept(dept)}
                  className={`filter-btn ${activeDept === dept ? 'active' : ''}`}
                >
                  <span>{dept}</span>
                  <span className="filter-count">
                    {dept === 'All' ? deptCounts.All : deptCounts[dept] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Notices Board */}
        <main>
          {error && (
            <motion.div 
              className="toast-notification error" 
              style={{ position: 'relative', bottom: 0, right: 0, margin: '0 0 1.5rem 0' }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <AlertCircle size={20} />
              <span>{error}</span>
            </motion.div>
          )}

          {loading ? (
            <div className="loader-container">
              <div className="spinner"></div>
              <p>Syncing notice database...</p>
            </div>
          ) : (
            <motion.div 
              className="notice-list"
              variants={listContainerVariants}
              initial="hidden"
              animate="show"
            >
              <AnimatePresence mode="popLayout">
                {notices.length === 0 ? (
                  <motion.div 
                    key="empty"
                    className="no-notices-box glass-panel"
                    variants={cardVariants}
                    exit="exit"
                  >
                    <Info size={40} style={{ color: 'var(--text-secondary)' }} />
                    <h3>No Active Notices</h3>
                    <p>There are no announcements matching your search query or department filters at this time.</p>
                  </motion.div>
                ) : (
                  notices.map((notice) => (
                    <motion.article 
                      key={notice._id}
                      className={`notice-card glass-panel ${notice.category.toLowerCase()}`}
                      variants={cardVariants}
                      exit="exit"
                      layout
                    >
                      <div className="card-header-meta">
                        <div className="badge-group">
                          <span className={`badge category-${notice.category.toLowerCase()}`}>
                            {getCategoryIcon(notice.category)}
                            <span style={{ marginLeft: '0.25rem' }}>{notice.category}</span>
                          </span>
                          <span className="badge dept-badge">{notice.department}</span>
                        </div>
                        <span className="notice-date-meta">
                          <Calendar size={13} />
                          {formatDate(notice.createdAt)}
                        </span>
                      </div>

                      <h3 className="notice-title">{notice.title}</h3>
                      <p className="notice-content">{notice.content}</p>

                      <div className="notice-card-footer">
                        <span>Issued by: {notice.author?.email || 'Academic Registrar'}</span>
                        <span>Expires: {formatDate(notice.expiryDate)}</span>
                      </div>
                    </motion.article>
                  ))
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default NoticePortal;
