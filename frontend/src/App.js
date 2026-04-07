import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';

// Import your page components
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import Prescription from './components/Prescription';
import History from './components/History';
import DentalLogin from './components/Login';
// import Appointments from './components/Appointments';
// import Settings from './components/Settings';

function AppContent() {
  const location = useLocation();
  const hideSidebar = location.pathname === '/login';

  // Responsive breakpoints: mobile < 768, tablet 768-1024, desktop > 1024
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [isTablet, setIsTablet] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false);
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [touchStartX, setTouchStartX] = useState(0);

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1024;
      
      setIsMobile(mobile);
      setIsTablet(tablet);
      
      // Auto-open sidebar on desktop, auto-close on mobile/tablet
      if (width >= 1024) {
        setSidebarOpen(true);
      } else if (mobile || tablet) {
        setSidebarOpen(false);
      }
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle swipe gestures for mobile/tablet
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!isMobile && !isTablet) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    
    // Swipe right to open (from left edge)
    if (deltaX > 50 && touchStartX < 50 && !sidebarOpen) {
      setSidebarOpen(true);
    }
    // Swipe left to close
    if (deltaX < -50 && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const sidebarWidth = 260;
  const tabletSidebarWidth = 240;

  // Determine sidebar width based on device
  const currentSidebarWidth = isMobile ? sidebarWidth : (isTablet ? tabletSidebarWidth : sidebarWidth);

  const sidebarWrapperStyle = (isMobile || isTablet)
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100%',
        width: currentSidebarWidth,
        maxWidth: '85%',
        transform: sidebarOpen ? 'translateX(0)' : `translateX(-${currentSidebarWidth}px)`,
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 1000,
        background: '#fff',
        boxShadow: '2px 0 12px rgba(0,0,0,0.1)',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch'
      }
    : {
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100%',
        width: currentSidebarWidth,
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflowY: 'auto',
        boxShadow: '1px 0 8px rgba(0,0,0,0.05)'
      };

  const contentStyle = {
    marginLeft: hideSidebar ? 0 : ((isMobile || isTablet) ? 0 : currentSidebarWidth),
    paddingTop: (isMobile || isTablet) && !hideSidebar ? 60 : 0,
    transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa'
  };

  // Tablet and mobile top bar styling
  const topBarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    zIndex: 950,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    borderBottom: '1px solid rgba(0,0,0,0.05)'
  };

  const menuButtonStyle = {
    fontSize: 24,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
    width: 40,
    height: 40
  };

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 980,
    animation: 'fadeIn 0.3s ease',
    backdropFilter: 'blur(2px)'
  };

  return (
    <div 
      onTouchStart={handleTouchStart} 
      onTouchEnd={handleTouchEnd}
      style={{ overflowX: 'hidden' }}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideIn {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
          @media (max-width: 767px) {
            .p-4 {
              padding: 16px !important;
            }
          }
          @media (min-width: 768px) and (max-width: 1023px) {
            .p-4 {
              padding: 20px !important;
            }
          }
          @media (min-width: 1024px) {
            .p-4 {
              padding: 24px !important;
            }
          }
        `}
      </style>

      {/* Top bar for mobile and tablet */}
      {(isMobile || isTablet) && !hideSidebar && (
        <div style={topBarStyle}>
          <button 
            onClick={() => setSidebarOpen(true)} 
            aria-label="Open menu" 
            style={menuButtonStyle}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ☰
          </button>
          <div style={{ fontWeight: 900, fontSize: 18, color: '#42a1ff',fontFamily: 'verdana' }}>
            🦷 Subbiah Dental Clinic
          </div>
          <div style={{ width: 40 }}></div> {/* Spacer for alignment */}
        </div>
      )}

      {/* Sidebar */}
      {!hideSidebar && (
        <div style={sidebarWrapperStyle}>
          <Sidebar 
            isMobile={isMobile || isTablet} 
            onClose={() => (isMobile || isTablet) && setSidebarOpen(false)} 
          />
        </div>
      )}

      {/* Overlay when sidebar open on mobile/tablet */}
      {(isMobile || isTablet) && sidebarOpen && !hideSidebar && (
        <div onClick={() => setSidebarOpen(false)} style={overlayStyle} />
      )}

      {/* Main content area */}
      <div style={contentStyle} className="flex-grow-1 p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<DentalLogin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/prescription" element={<Prescription />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;