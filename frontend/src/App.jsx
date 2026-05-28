import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import AlertRibbon from './components/AlertRibbon';
import BackgroundBlobs from './components/BackgroundBlobs';
import NoticePortal from './pages/NoticePortal';
import LoginPortal from './pages/LoginPortal';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [urgentNotice, setUrgentNotice] = useState(null);

  return (
    <Router>
      <BackgroundBlobs />
      <AlertRibbon urgentNotice={urgentNotice} />
      <Header />
      
      <Routes>
        <Route 
          path="/" 
          element={<NoticePortal onUrgentNoticeLoaded={setUrgentNotice} />} 
        />
        <Route 
          path="/login" 
          element={<LoginPortal />} 
        />
        <Route 
          path="/dashboard" 
          element={<AdminDashboard />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
