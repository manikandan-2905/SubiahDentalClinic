import React, { useState } from 'react';
import { Nav, Offcanvas } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = { name: 'Dr. Subbiah', role: 'Administrator' };

  const styles = {
    sidebar: {
      background: 'linear-gradient(180deg, #0077b6 0%, #00b4d8 100%)',
      minHeight: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      width: '260px',
      zIndex: 1000,
      transition: 'all 0.3s ease',
      boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
    },
    sidebarMobile: {
      background: 'linear-gradient(180deg, #0077b6 0%, #00b4d8 100%)',
      minHeight: '100vh',
    },
    logoArea: {
      padding: '30px 20px',
      textAlign: 'center',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoIcon: {
      width: '70px',
      height: '70px',
      background: 'rgba(255,255,255,0.2)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 15px',
      fontSize: '2rem',
      color: 'white',
      minHeight: '70px',
      minWidth: '70px',
    },
    navItem: (isActive) => ({
      padding: '15px 25px',
      color: isActive ? '#0077b6' : 'rgba(255,255,255,0.9)',
      background: isActive ? 'white' : 'transparent',
      borderLeft: isActive ? '4px solid #ffc107' : '4px solid transparent',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      fontSize: '0.95rem',
      fontWeight: 500,
      margin: '5px 10px',
      borderRadius: isActive ? '0 10px 10px 0' : '0',
      minHeight: '44px',
      touchAction: 'manipulation',
    }),
    userArea: {
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      right: '20px',
      padding: '15px',
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '10px',
      color: 'white',
      minHeight: '60px',
      display: 'flex',
      alignItems: 'center',
    },
  };

  const Icons = {
    Dashboard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>,
    Clients: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>,
    Prescription: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2h12v6h-2V4H8v16h12v-2h2v6H6V2zm4 8h8v2h-8v-2zm0 4h8v2h-8v-2zm0-8h4v2h-4V6z"/></svg>,
    History: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>,
    Appointments: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/></svg>,
    Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L3.16 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.04.64.09.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.58 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>,
    Tooth: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.5 2 6 4.5 6 8c0 1.5.5 3 1.5 4.5L6 22h3l1.5-6h3l1.5 6h3l-1.5-9.5c1-1.5 1.5-3 1.5-4.5 0-3.5-2.5-6-6-6z"/></svg>,
    User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>,
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
    { id: 'clients', label: 'Patients', icon: Icons.Clients },
    { id: 'prescription', label: 'Prescription', icon: Icons.Prescription },
    { id: 'history', label: 'History', icon: Icons.History },
    // { id: 'appointments', label: 'Appointments', icon: Icons.Appointments },
    // { id: 'settings', label: 'Settings', icon: Icons.Settings },
  ];

  const SidebarContent = ({ mobile = false }) => (
    <div style={mobile ? styles.sidebarMobile : styles.sidebar}>
      <div style={styles.logoArea}>
        <div style={styles.logoIcon}>
          <Icons.Tooth />
        </div>
        <h5 style={{ color: 'white', margin: 0, fontWeight: 600 }}>Subbiah Dental Clinic</h5>
        <small style={{ color: 'rgba(255,255,255,0.7)' }}>Clinic Management</small>
      </div>
      
      <Nav className="flex-column mt-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={`/${item.id}`}
              onClick={() => { if (mobile) setSidebarOpen(false); if (setActiveTab) setActiveTab(item.id); }}
              style={{ textDecoration: 'none' }}
            >
              {({ isActive }) => (
                <div style={styles.navItem(isActive)}>
                  <Icon />
                  <span>{item.label}</span>
                </div>
              )}
            </NavLink>
          );
        })}
      </Nav>

      <div style={styles.userArea}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icons.User />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user.name}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{user.role}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        /* Mobile Responsive Styles for Sidebar */
        
        /* Extra Small Devices (max-width: 480px) */
        @media (max-width: 480px) {
          .btn.d-lg-none {
            width: 44px !important;
            height: 44px !important;
            font-size: 1.5rem !important;
            margin: 8px !important;
          }
          
          .offcanvas {
            width: 100% !important;
            max-width: 100vw !important;
          }
          
          .offcanvas-header {
            padding: 12px 16px !important;
          }
          
          .offcanvas-body nav {
            margin-top: 8px !important;
          }
        }
        
        /* Small Mobile Devices (481px to 576px) */
        @media (min-width: 481px) and (max-width: 576px) {
          .btn.d-lg-none {
            width: 46px !important;
            height: 46px !important;
            font-size: 1.6rem !important;
          }
          
          .offcanvas {
            width: 280px !important;
            max-width: 85vw !important;
          }
        }
        
        /* Mobile Devices (577px to 767px) */
        @media (min-width: 577px) and (max-width: 767px) {
          .btn.d-lg-none {
            width: 48px !important;
            height: 48px !important;
          }
          
          .offcanvas {
            width: 300px !important;
            max-width: 85vw !important;
          }
        }
        
        /* Tablet (768px to 991px) */
        @media (min-width: 768px) and (max-width: 991px) {
          .offcanvas {
            width: 260px !important;
            max-width: 85vw !important;
          }
          
          .offcanvas-backdrop {
            background-color: rgba(0, 0, 0, 0.5);
          }
          
          body.offcanvas-active {
            overflow: hidden;
          }
        }
        
        /* General Mobile Devices (all below 992px) */
        @media (max-width: 991px) {
          .offcanvas {
            width: 260px !important;
            max-width: 85vw !important;
          }
          
          .offcanvas-backdrop {
            background-color: rgba(0, 0, 0, 0.5);
          }
          
          body.offcanvas-active {
            overflow: hidden;
          }
          
          .offcanvas-body {
            padding: 0 !important;
          }
          
          /* Optimize touch targets */
          nav a {
            min-height: 44px;
            display: flex;
            align-items: center;
          }
        }
        
        /* Mobile Touch Optimization */
        @media (max-width: 767px) {
          .btn.d-lg-none {
            min-width: 44px !important;
            min-height: 44px !important;
            touch-action: manipulation;
          }
          
          nav a {
            -webkit-user-select: none;
            user-select: none;
          }
          
          .offcanvas {
            will-change: transform;
          }
        }
      `}</style>
      <div className="d-none d-lg-block">
        <SidebarContent />
      </div>

      <Offcanvas show={sidebarOpen} onHide={() => setSidebarOpen(false)} className="d-lg-none" placement="start" style={{ width: '260px' }}>
        <Offcanvas.Body className="p-0">
          <SidebarContent mobile />
        </Offcanvas.Body>
      </Offcanvas>

      <button 
        className="btn d-lg-none position-fixed top-0 start-0 m-2"
        style={{ 
          zIndex: 999,
          width: '50px',
          height: '50px',
          padding: '10px',
          background: 'linear-gradient(180deg, #0077b6 0%, #00b4d8 100%)',
          border: 'none',
          borderRadius: '12px',
          color: 'white',
          fontSize: '1.8rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0, 119, 182, 0.3)',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
        }}
        onMouseOver={(e) => {
          e.target.style.background = 'linear-gradient(180deg, #00599f 0%, #0099cc 100%)';
          e.target.style.boxShadow = '0 6px 16px rgba(0, 119, 182, 0.5)';
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseOut={(e) => {
          e.target.style.background = 'linear-gradient(180deg, #0077b6 0%, #00b4d8 100%)';
          e.target.style.boxShadow = '0 4px 12px rgba(0, 119, 182, 0.3)';
          e.target.style.transform = 'scale(1)';
        }}
        onClick={() => setSidebarOpen(true)}
      >
        ☰
      </button>
    </>
  );
};

export default Sidebar;