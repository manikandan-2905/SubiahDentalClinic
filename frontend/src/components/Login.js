import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Modal, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Font Awesome icons via CDN in index.html or use react-icons
// For single file, we'll use SVG icons or Unicode characters

const DentalLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const VALID_USERNAME = 'admin';
  const VALID_PASSWORD = '123';

  // Load saved credentials on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('dentalUsername');
    if (savedUser) {
      setUsername(savedUser);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields');
      triggerShake();
      return;
    }

    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      if (rememberMe) {
        localStorage.setItem('dentalUsername', username);
      } else {
        localStorage.removeItem('dentalUsername');
      }
      setShowSuccess(true);
    } else {
      setError('Invalid username or password');
      triggerShake();
      setPassword('');
    }

    setLoading(false);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const navigate = useNavigate();

  const enterDashboard = () => {
    // navigation to dashboard handled via react-router
    navigate('/dashboard');
  };

  // Custom styles
  const styles = {
    body: {
      fontFamily: "'Poppins', sans-serif",
      background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 50%, #80deea 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
      margin: 0,
      padding: 0,
    },
    bgShapes: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      zIndex: -1,
    },
    shape: (top, left, width, delay, type = 'circle') => ({
      position: 'absolute',
      top,
      left,
      width,
      height: width,
      opacity: 0.1,
      animation: 'float 20s infinite ease-in-out',
      animationDelay: `${delay}s`,
      ...(type === 'circle' && {
        background: '#00b4d8',
        borderRadius: '50%',
      }),
      ...(type === 'blob' && {
        background: '#0077b6',
        borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
      }),
      ...(type === 'square' && {
        background: '#90e0ef',
        transform: 'rotate(45deg)',
      }),
      ...(type === 'ring' && {
        border: '3px solid #00b4d8',
        borderRadius: '50%',
        background: 'transparent',
      }),
    }),
    loginCard: {
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '30px',
      boxShadow: '0 20px 60px rgba(0, 119, 182, 0.2)',
      overflow: 'hidden',
      minHeight: '600px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      animation: shake 
        ? 'shake 0.5s ease-in-out' 
        : 'elasticEntrance 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards, gentleFloat 6s ease-in-out infinite 1.2s',
      transformOrigin: 'center center',
    },
    brandSide: {
      background: 'linear-gradient(135deg, #0077b6 0%, #00b4d8 100%)',
      padding: '60px 40px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
    },
    logoIcon: {
      width: '120px',
      height: '120px',
      background: 'rgba(255,255,255,0.2)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 30px',
      fontSize: '3.5rem',
      backdropFilter: 'blur(10px)',
      border: '3px solid rgba(255,255,255,0.3)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
      animation: 'logoPulse 3s infinite ease-in-out',
    },
    featureItem: (delay) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      marginBottom: '20px',
      fontSize: '0.95rem',
      opacity: 0,
      animation: `slideIn 0.5s ease ${delay}s forwards`,
    }),
    featureIcon: {
      width: '40px',
      height: '40px',
      background: 'rgba(255,255,255,0.2)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.1rem',
    },
    formSide: {
      padding: '60px 50px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
    demoBadge: {
      background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
      border: '1px solid #ffc107',
      borderRadius: '12px',
      padding: '15px',
      marginBottom: '25px',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      animation: 'pulse 2s infinite',
    },
    inputGroup: {
      position: 'relative',
      marginBottom: '25px',
    },
    customInput: {
      width: '100%',
      padding: '15px 20px 15px 50px',
      border: '2px solid #e0e0e0',
      borderRadius: '15px',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      background: '#fafafa',
      color: '#333',
    },
    customInputFocus: {
      outline: 'none',
      borderColor: '#00b4d8',
      background: 'white',
      boxShadow: '0 0 0 4px rgba(0, 180, 216, 0.1)',
      transform: 'translateY(-2px)',
    },
    inputIcon: {
      position: 'absolute',
      left: '18px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#999',
      fontSize: '1.1rem',
    },
    toggleIcon: {
      position: 'absolute',
      right: '18px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#999',
      cursor: 'pointer',
      fontSize: '1.1rem',
    },
    btnLogin: {
      width: '100%',
      padding: '16px',
      background: 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)',
      border: 'none',
      borderRadius: '15px',
      color: 'white',
      fontSize: '1.1rem',
      fontWeight: 600,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 4px 15px rgba(0, 180, 216, 0.3)',
      transition: 'all 0.3s ease',
    },
    successModal: {
      display: showSuccess ? 'flex' : 'none',
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(5px)',
    },
    modalContent: {
      background: 'white',
      padding: '50px',
      borderRadius: '30px',
      textAlign: 'center',
      maxWidth: '400px',
      width: '90%',
      animation: 'scaleIn 0.3s ease',
    },
    successIcon: {
      width: '100px',
      height: '100px',
      background: 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 30px',
      fontSize: '3rem',
      color: 'white',
      animation: 'iconPop 0.5s ease',
    },
  };

  // CSS animations
  const keyframes = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
    
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      33% { transform: translateY(-30px) rotate(120deg); }
      66% { transform: translateY(30px) rotate(240deg); }
    }
    
    @keyframes elasticEntrance {
      0% { opacity: 0; transform: scale(0) rotate(-10deg); }
      50% { opacity: 1; transform: scale(1.1) rotate(2deg); }
      70% { transform: scale(0.95) rotate(-1deg); }
      85% { transform: scale(1.02) rotate(0.5deg); }
      100% { opacity: 1; transform: scale(1) rotate(0deg); }
    }
    
    @keyframes gentleFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-15px); }
    }
    
    @keyframes logoPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-30px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.4); }
      50% { box-shadow: 0 0 0 10px rgba(255, 193, 7, 0); }
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-10px); }
      40%, 80% { transform: translateX(10px); }
    }
    
    @keyframes scaleIn {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    
    @keyframes iconPop {
      0% { transform: scale(0); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    
    @keyframes bgMove {
      0% { transform: translate(0, 0); }
      100% { transform: translate(50px, 50px); }
    }
    
    .brand-side::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
      background-size: 20px 20px;
      opacity: 0.3;
      animation: bgMove 20s linear infinite;
    }
    
    .btn-login:hover {
      transform: translateY(-3px) !important;
      box-shadow: 0 8px 25px rgba(0, 180, 216, 0.4) !important;
    }
    
    .custom-input:focus {
      outline: none;
      border-color: #00b4d8 !important;
      background: white !important;
      box-shadow: 0 0 0 4px rgba(0, 180, 216, 0.1) !important;
      transform: translateY(-2px);
    }
    
    @media (max-width: 991px) {
      .brand-side { display: none !important; }
      .form-side { padding: 40px 30px !important; }
    }
    
    @media (max-width: 576px) {
      .form-side { padding: 30px 20px !important; }
      .form-options { flex-direction: column !important; gap: 15px !important; align-items: flex-start !important; }
    }
  `;

  // Icon components
  const ToothIcon = () => (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.5 2 6 4.5 6 8c0 1.5.5 3 1.5 4.5L6 22h3l1.5-6h3l1.5 6h3l-1.5-9.5c1-1.5 1.5-3 1.5-4.5 0-3.5-2.5-6-6-6z"/>
    </svg>
  );

  const CalendarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
    </svg>
  );

  const UserMdIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  );

  const ChartIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
    </svg>
  );

  const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  );

  const LockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
    </svg>
  );

  const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
    </svg>
  );

  const EyeSlashIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
    </svg>
  );

  const InfoIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
    </svg>
  );

  const CheckIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
  );

  const ExclamationIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
    </svg>
  );

  return (
    <div style={styles.body}>
      <style>{keyframes}</style>
      
      {/* Background Shapes */}
      <div style={styles.bgShapes}>
        <div style={styles.shape('10%', '10%', '80px', 0)}></div>
        <div style={styles.shape('70%', '80%', '120px', 5, 'blob')}></div>
        <div style={styles.shape('80%', '20%', '60px', 10, 'square')}></div>
        <div style={styles.shape('20%', '80%', '100px', 15, 'ring')}></div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert 
          variant="danger" 
          className="position-fixed top-0 end-0 m-3"
          style={{ 
            zIndex: 1001, 
            borderRadius: '12px',
            animation: 'slideInRight 0.3s ease',
            background: '#ff6b6b',
            border: 'none',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
          onClose={() => setError('')} 
          dismissible
        >
          <ExclamationIcon />
          {error}
        </Alert>
      )}

      {/* Success Modal */}
      <div style={styles.successModal}>
        <div style={styles.modalContent}>
          <div style={styles.successIcon}>
            <CheckIcon />
          </div>
          <h3 style={{ color: '#0077b6', marginBottom: '15px', fontWeight: 700 }}>Welcome Back!</h3>
          <p style={{ color: '#666', marginBottom: '25px' }}>Login successful. Redirecting to dashboard...</p>
          <Button 
            onClick={enterDashboard}
            style={{
              background: 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)',
              border: 'none',
              padding: '12px 40px',
              borderRadius: '25px',
              fontWeight: 600,
            }}
          >
            Continue
          </Button>
        </div>
      </div>

      {/* Main Container */}
      <Container>
        <Row className="justify-content-center">
          <Col xl={10}>
            <div style={styles.loginCard}>
              <Row className="g-0 h-100">
                {/* Brand Side - Hidden on mobile */}
                <Col lg={5} className="brand-side" style={styles.brandSide}>
                  <div style={{ textAlign: 'center', zIndex: 1 }}>
                    <div style={styles.logoIcon}>
                      <ToothIcon />
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '10px', textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
                      DentalCare Pro
                    </h1>
                    <p style={{ fontSize: '1.1rem', opacity: 0.9, fontWeight: 300 }}>
                      Advanced Clinic Management System
                    </p>
                  </div>

                  <ul style={{ marginTop: '40px', listStyle: 'none', padding: 0, zIndex: 1 }}>
                    <li style={styles.featureItem(0.8)}>
                      <div style={styles.featureIcon}><CalendarIcon /></div>
                      <span>Smart Appointment Scheduling</span>
                    </li>
                    <li style={styles.featureItem(1.0)}>
                      <div style={styles.featureIcon}><UserMdIcon /></div>
                      <span>Patient Records Management</span>
                    </li>
                    <li style={styles.featureItem(1.2)}>
                      <div style={styles.featureIcon}><ChartIcon /></div>
                      <span>Analytics & Reporting</span>
                    </li>
                  </ul>
                </Col>

                {/* Form Side */}
                <Col lg={7} style={styles.formSide}>
                  <div className="form-header" style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: '#0077b6', fontWeight: 700, fontSize: '2rem', marginBottom: '10px' }}>
                      Admin Login
                    </h2>
                    <p style={{ color: '#666', fontSize: '0.95rem' }}>
                      Please enter your credentials to continue
                    </p>
                  </div>

                  {/* Demo Credentials */}
                  <div style={styles.demoBadge}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: '#ffc107',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#856404',
                    }}>
                      <InfoIcon />
                    </div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: '#856404', display: 'block', marginBottom: '3px' }}>
                        Demo Credentials
                      </strong>
                      <small style={{ color: '#856404', opacity: 0.8 }}>
                        Username: admin | Password: 123
                      </small>
                    </div>
                  </div>

                  <Form onSubmit={handleSubmit}>
                    {/* Username */}
                    <div style={styles.inputGroup}>
                      <span style={styles.inputIcon}><UserIcon /></span>
                      <Form.Control
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="custom-input"
                        style={styles.customInput}
                        autoComplete="off"
                      />
                    </div>

                    {/* Password */}
                    <div style={styles.inputGroup}>
                      <span style={styles.inputIcon}><LockIcon /></span>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="custom-input"
                        style={styles.customInput}
                      />
                      <span 
                        style={styles.toggleIcon}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
                      </span>
                    </div>

                    {/* Options */}
                    <div className="form-options" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '30px',
                      fontSize: '0.9rem',
                    }}>
                      <Form.Check
                        type="checkbox"
                        id="rememberMe"
                        label="Remember me"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{ color: '#666' }}
                      />
                      <a href="#" style={{ color: '#00b4d8', textDecoration: 'none', fontWeight: 500 }}>
                        Forgot password?
                      </a>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="btn-login"
                      disabled={loading}
                      style={styles.btnLogin}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Authenticating...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </Form>

                  <div style={{ textAlign: 'center', marginTop: '30px', color: '#666', fontSize: '0.9rem' }}>
                    <p>© 2024 DentalCare Pro. All rights reserved.</p>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DentalLogin;