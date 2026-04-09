// Dashboard.js
import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Container, Badge,
} from 'react-bootstrap';
import {
  Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import Sidebar from './Sidebar';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showBackgroundAnimation, setShowBackgroundAnimation] = useState(true);
  const [animatedStats, setAnimatedStats] = useState(false);

  // Clinic details
  const CLINIC_NAME = ' SUBBIAH Dental Clinic';
  const DOCTOR_NAME = 'Dr. SUBBIAH';
  const CLINIC_CONTACT = '+91-98943 08857'; // Replace with actual contact

  // live data from backend
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
const API_BASE = 'https://subiahdentalclinic.onrender.com';

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, prRes] = await Promise.all([
          fetch(`${API_BASE}/api/patients`),
          fetch(`${API_BASE}/api/prescriptions`)
        ]);

        const pJson = pRes.ok ? await pRes.json() : [];
        const prJson = prRes.ok ? await prRes.json() : [];

        setPatients(pJson || []);
        setPrescriptions(prJson || []);
      } catch (e) {
        console.error('Failed to load dashboard data', e);
      }
    };
    load();
  }, [API_BASE]);

  // Calculate statistics from live data
  const totalPatients = patients.length;
  const newPatients = 0; // backend doesn't provide category by default; keep 0 or compute differently
  const monthlyCollection = prescriptions.reduce((sum, p) => sum + (p.fee || p.total || 0), 0);

  const now = new Date();
  const todayKey = now.toISOString().substring(0, 10);

  const monthlyRevenue = prescriptions.reduce((sum, p) => sum + (p.fee || p.total || 0), 0);
  const todayRevenue = prescriptions
    .filter(p => {
      const prescDate = (p.createdAt || p.date || '').toString();
      return prescDate.startsWith(todayKey);
    })
    .reduce((s, p) => s + (p.fee || p.total || 0), 0);

  const pendingPayments = prescriptions.filter(p => (p.paymentStatus || p.status) === 'Pending').length;
  const completedToday = 0;
  const totalAppointments = 0;

  const stats = {
    totalPatients,
    newPatients,
    monthlyCollection,
    todayRevenue,
    monthlyRevenue,
    pendingPayments,
    completedToday,
    totalAppointments
  };

  // Chart data - calculate from actual prescriptions
  const generateRevenueData = () => {
    const last7Days = {};
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().substring(0, 10);
      const dayName = dayLabels[d.getDay()];
      last7Days[dateStr] = { name: dayName, revenue: 0, patients: new Set() };
    }

    // Aggregate prescription data
    prescriptions.forEach(pr => {
      const dateStr = (pr.createdAt || '').toString().substring(0, 10);
      if (last7Days[dateStr]) {
        last7Days[dateStr].revenue += (pr.fee || pr.total || 0);
        last7Days[dateStr].patients.add(pr.patientId);
      }
    });

    // Convert to array and return
    return Object.values(last7Days).map(day => ({
      name: day.name,
      revenue: day.revenue,
      patients: day.patients.size
    }));
  };

  const generateTreatmentData = () => {
    const treatmentMap = {};

    // Group by treatment/diagnosis
    prescriptions.forEach(pr => {
      const treatment = pr.diagnosis || pr.problemDescription || pr.treatment || 'Other';
      if (!treatmentMap[treatment]) {
        treatmentMap[treatment] = 0;
      }
      treatmentMap[treatment]++;
    });

    // Convert to array, sort by count, and get top 5
    const sorted = Object.entries(treatmentMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Calculate total and percentages
    const total = sorted.reduce((sum, item) => sum + item.value, 0);

    // Define colors
    const colors = ['#0077b6', '#00b4d8', '#0891b2', '#06b6d4', '#22d3ee'];

    return sorted.map((item, idx) => ({
      name: item.name.substring(0, 15), // Truncate long names
      value: Math.round((item.value / total) * 100),
      count: item.value,
      color: colors[idx]
    }));
  };

  const revenueData = generateRevenueData();
  const treatmentTypeData = generateTreatmentData();

  const patientCategoryData = [
    { name: 'Regular', value: patients.filter(c => c.category === 'Regular').length },
    { name: 'VIP', value: patients.filter(c => c.category === 'VIP').length },
    { name: 'New', value: patients.filter(c => c.category === 'New').length },
  ];

  const handleWhatsAppShare = (mobile, appt, patientName) => {
    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    const message = `Dear ${patientName},

This is a friendly reminder from "${patientName}" regarding your upcoming appointment with ${DOCTOR_NAME}.

📅 Date: ${appt.nextVisitDateStr}
🦷 Treatment: ${appt.diagnosis || appt.problemDescription || appt.treatment || 'Consultation'}

Please confirm your appointment by replying to this message or contact us at ${CLINIC_CONTACT}.

We look forward to seeing you!

Best regards,
${DOCTOR_NAME}
${CLINIC_NAME}`;
    const url = `https://wa.me/${cleanMobile}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Icons
  const Icons = {
    Users: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    UserPlus: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>,
    Crown: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" /></svg>,
    DollarSign: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
    Calendar: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>,
    Clock: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    Activity: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
    TrendingUp: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
    Sparkles: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>,
    CheckCircle: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
    AlertCircle: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>,
    MoreHorizontal: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>,
    WhatsApp: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
  };

  return (
    <div className="dashboard-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        .dashboard-container {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        /* Animated Background */
        .animated-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          background: linear-gradient(180deg, #0077b6 0%, #00b4d8 100%);
          background-size: 100% 200%;
          animation: gradientMove 15s ease infinite;
          opacity: 0.08;
        }

        @keyframes gradientMove {
          0% { background-position: 0% 0%; }
          50% { background-position: 0% 100%; }
          100% { background-position: 0% 0%; }
        }

        /* Glassmorphism Cards */
        .glass-card {
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 8px 32px rgba(0, 119, 182, 0.15);
          border-radius: 24px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          height: 100%;
        }

        .glass-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 119, 182, 0.25);
        }

        /* Stat Cards */
        .stat-card {
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 100px;
          height: 100px;
          background: linear-gradient(180deg, #0077b6 0%, #00b4d8 100%);
          opacity: 0.1;
          border-radius: 50%;
          transform: translate(30%, -30%);
          transition: all 0.4s ease;
        }

        .stat-card:hover::before {
          transform: translate(20%, -20%) scale(1.2);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          transition: all 0.3s ease;
        }

        .stat-card:hover .stat-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .stat-icon-blue {
          background: linear-gradient(180deg, #0077b6 0%, #00b4d8 100%);
          color: white;
          box-shadow: 0 10px 20px rgba(0, 119, 182, 0.3);
        }

        .stat-icon-green {
          background: linear-gradient(180deg, #10b981 0%, #34d399 100%);
          color: white;
          box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
        }

        .stat-icon-purple {
          background: linear-gradient(180deg, #8b5cf6 0%, #a78bfa 100%);
          color: white;
          box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3);
        }

        .stat-icon-orange {
          background: linear-gradient(180deg, #f59e0b 0%, #fbbf24 100%);
          color: white;
          box-shadow: 0 10px 20px rgba(245, 158, 11, 0.3);
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(180deg, #1e293b 0%, #475569 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1;
          margin: 10px 0;
          transition: all 0.6s ease;
        }

        .stat-value.animated {
          animation: countUp 0.6s ease-out;
        }

        @keyframes countUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Welcome Banner */
        .welcome-banner {
          background: linear-gradient(180deg, #0077b6 0%, #00b4d8 100%);
          border-radius: 24px;
          padding: 40px;
          color: white;
          position: relative;
          overflow: hidden;
          margin-bottom: 30px;
          box-shadow: 0 20px 40px rgba(0, 119, 182, 0.3);
        }

        .welcome-banner::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 400px;
          height: 400px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }

        .welcome-banner::after {
          content: '';
          position: absolute;
          bottom: -30%;
          right: 10%;
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          animation: float 8s ease-in-out infinite reverse;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        /* Chart Container */
        .chart-container {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 25px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        /* Appointment List */
        .appointment-item {
          padding: 16px 20px;
          border-radius: 16px;
          margin-bottom: 12px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(0, 119, 182, 0.1);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .appointment-item:hover {
          transform: translateX(10px);
          background: white;
          box-shadow: 0 4px 15px rgba(0, 119, 182, 0.15);
          border-color: rgba(0, 119, 182, 0.3);
        }

        .status-badge {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-completed {
          background: linear-gradient(180deg, #10b981 0%, #34d399 100%);
          color: white;
        }

        .status-progress {
          background: linear-gradient(180deg, #0077b6 0%, #00b4d8 100%);
          color: white;
          animation: pulse 2s infinite;
        }

        .status-waiting {
          background: linear-gradient(180deg, #f59e0b 0%, #fbbf24 100%);
          color: white;
        }

        .status-scheduled {
          background: #e2e8f0;
          color: #64748b;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        /* Recent Activity */
        .activity-item {
          padding: 16px;
          border-left: 4px solid #0077b6;
          background: rgba(0, 119, 182, 0.05);
          border-radius: 0 12px 12px 0;
          margin-bottom: 12px;
          transition: all 0.3s ease;
        }

        .activity-item:hover {
          background: rgba(0, 119, 182, 0.1);
          transform: translateX(5px);
        }

        /* Background Toggle */
        .bg-toggle {
          position: fixed;
          bottom: 30px;
          right: 30px;
          background: linear-gradient(180deg, #0077b6 0%, #00b4d8 100%);
          border: none;
          border-radius: 50%;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0, 119, 182, 0.4);
          z-index: 1000;
          transition: all 0.3s ease;
          color: white;
        }

        .bg-toggle:hover {
          transform: scale(1.1) rotate(180deg);
          box-shadow: 0 6px 30px rgba(0, 119, 182, 0.6);
        }

        /* Progress Bar Custom */
        .progress-custom {
          height: 8px;
          border-radius: 10px;
          background: #e2e8f0;
          overflow: hidden;
        }

        .progress-bar-custom {
          height: 100%;
          border-radius: 10px;
          background: linear-gradient(90deg, #0077b6 0%, #00b4d8 100%);
          transition: width 1s ease;
        }

        /* Quick Actions */
        .quick-action-btn {
          background: white;
          border: 2px solid rgba(0, 119, 182, 0.2);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
          width: 100%;
        }

        .quick-action-btn:hover {
          background: linear-gradient(180deg, #0077b6 0%, #00b4d8 100%);
          color: white;
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 119, 182, 0.3);
          border-color: transparent;
        }

        .quick-action-btn:hover svg {
          stroke: white;
        }

        /* Responsive Styles */
        
        /* Mobile (max-width: 767px) */
        @media (max-width: 767px) {
          .dashboard-content-wrap {
            padding: 16px 12px 80px 12px !important;
          }
          
          .welcome-banner {
            padding: 20px 18px !important;
            border-radius: 16px !important;
            margin-bottom: 18px !important;
            margin-top: 28px !important;
          }
          
          .welcome-banner::before,
          .welcome-banner::after {
            display: none;
          }
          
          .welcome-banner h1 {
            font-size: 1.35rem !important;
            margin-bottom: 6px !important;
          }
          
          .welcome-banner p {
            font-size: 0.86rem !important;
          }
          
          .welcome-date-box {
            margin-top: 14px !important;
            padding: 12px 20px !important;
            border-radius: 14px !important;
          }
          
          .welcome-date-box .date-day {
            font-size: 1.9rem !important;
          }
          
          .welcome-date-box .date-month {
            font-size: 0.78rem !important;
            letter-spacing: 1px !important;
          }
          
          .stat-card-col {
            width: 50% !important;
            flex: 0 0 50% !important;
            max-width: 50% !important;
          }
          
          .stat-card .card-body {
            padding: 12px 10px !important;
          }
          
          .stat-value {
            font-size: 1.5rem !important;
            margin: 5px 0 !important;
          }
          
          .stat-icon {
            width: 40px !important;
            height: 40px !important;
            border-radius: 11px !important;
            flex-shrink: 0;
          }
          
          .stat-icon svg {
            width: 17px !important;
            height: 17px !important;
          }
          
          .stat-card p {
            font-size: 0.76rem !important;
            margin-bottom: 2px !important;
          }
          
          .stat-card small {
            font-size: 0.7rem !important;
          }
          
          .stat-card small svg {
            width: 12px !important;
            height: 12px !important;
          }
          
          .glass-card {
            border-radius: 16px !important;
          }
          
          .glass-card:hover {
            transform: none !important;
          }
          
          .glass-card .card-body {
            padding: 14px !important;
          }
          
          .glass-card h5 {
            font-size: 0.92rem !important;
            margin-bottom: 12px !important;
          }
          
          .bottom-row-col {
            width: 100% !important;
            flex: 0 0 100% !important;
            max-width: 100% !important;
          }
          
          .appointment-item {
            padding: 10px 12px !important;
            border-radius: 12px !important;
          }
          
          .appointment-item:hover {
            transform: none !important;
          }
          
          .activity-item:hover {
            transform: none !important;
          }
          
          .activity-item .d-flex {
            flex-wrap: wrap;
            gap: 8px;
          }
          
          .quick-action-btn {
            padding: 13px 8px !important;
            border-radius: 12px !important;
          }
          
          .quick-action-btn:hover {
            transform: none !important;
          }
          
          .quick-action-btn div {
            font-size: 0.78rem !important;
          }
          
          .quick-action-btn svg {
            margin-bottom: 6px !important;
          }
          
          .chart-col-lg,
          .chart-col-sm {
            width: 100% !important;
            flex: 0 0 100% !important;
            max-width: 100% !important;
          }
          
          .chart-height-wrap {
            height: 220px !important;
          }
          
          .chart-header-row {
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
          
          .treatment-legend-label {
            max-width: 110px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            display: inline-block;
          }
          
          .g-4 {
            --bs-gutter-x: 0.6rem !important;
            --bs-gutter-y: 0.6rem !important;
          }
          
          .bg-toggle {
            bottom: 16px !important;
            right: 16px !important;
            width: 44px !important;
            height: 44px !important;
          }
        }
        
        /* Tablet (768px to 1024px) */
        @media (min-width: 768px) and (max-width: 1024px) {
          .dashboard-content-wrap {
            padding: 20px 24px 80px 24px !important;
          }
          
          .welcome-banner {
            padding: 28px 30px !important;
            margin-top: 26px !important;
          }
          
          .welcome-banner h1 {
            font-size: 1.8rem !important;
          }
          
          .stat-card .card-body {
            padding: 16px !important;
          }
          
          .stat-value {
            font-size: 1.8rem !important;
          }
          
          .stat-icon {
            width: 48px !important;
            height: 48px !important;
          }
          
          .stat-icon svg {
            width: 20px !important;
            height: 20px !important;
          }
          
          .glass-card .card-body {
            padding: 18px !important;
          }
          
          .chart-height-wrap {
            height: 260px !important;
          }
          
          .g-4 {
            --bs-gutter-x: 0.8rem !important;
            --bs-gutter-y: 0.8rem !important;
          }
          
          .bg-toggle {
            bottom: 20px !important;
            right: 20px !important;
            width: 48px !important;
            height: 48px !important;
          }
        }
        
        /* Desktop (1025px and above) */
        @media (min-width: 1025px) {
          .dashboard-content-wrap {
            padding: 30px 35px 80px 35px !important;
          }
          
          .chart-height-wrap {
            height: 300px !important;
          }
          
          .g-4 {
            --bs-gutter-x: 1rem !important;
            --bs-gutter-y: 1rem !important;
          }
        }

        /* ========== RESPONSIVE UTILITY CLASSES ========== */
        
        /* Mobile responsive utilities (max-width: 768px) */
        @media (max-width: 768px) {
          .responsive-padding {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
          
          .responsive-text-sm {
            font-size: 14px !important;
          }
          
          .responsive-chart-container {
            min-height: 250px !important;
          }
        }

        /* Tablet styles (769px to 1024px) */
        @media (min-width: 769px) and (max-width: 1024px) {
          .responsive-padding {
            padding-left: 24px !important;
            padding-right: 24px !important;
          }
          
          .responsive-chart-container {
            min-height: 300px !important;
          }
        }

        /* Desktop styles (1025px and above) */
        @media (min-width: 1025px) {
          .responsive-padding {
            padding-left: 30px !important;
            padding-right: 30px !important;
          }
          
          .responsive-chart-container {
            min-height: 350px !important;
          }
        }
      `}</style>

      {showBackgroundAnimation && <div className="animated-bg" />}

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* dashboard-content-wrap is targeted by the media queries above */}
      <div className="dashboard-content-wrap" style={{ marginLeft: '0', padding: '30px', position: 'relative', zIndex: 1 }}>
        <Container fluid>

          {/* ── Welcome Banner ── */}
          <div className="welcome-banner">
            <Row className="align-items-center">
              <Col md={8} xs={12}>
                <h1 style={{ fontWeight: 800, fontSize: '2.5rem', marginBottom: '10px' }}>
                  Welcome back, Dr. SUBBIAH! 👋
                </h1>
                {/* <p style={{ fontSize: '1.2rem', opacity: 0.9, margin: 0 }}>
                  You have {stats.totalAppointments} appointments today. {stats.pendingPayments} bills pending payment.
                </p> */}
              </Col>
              <Col md={4} xs={12} className="text-md-end">
                {/* welcome-date-box class lets mobile CSS resize this independently */}
                <div className="welcome-date-box" style={{
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  padding: '20px',
                  display: 'inline-block',
                  textAlign: 'center'
                }}>
                  <div className="date-day" style={{ fontSize: '3rem', fontWeight: 800 }}>{new Date().getDate()}</div>
                  <div className="date-month" style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    {new Date().toLocaleString('default', { month: 'long' })}
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          {/* ── Stats Row ── */}
          <Row className="g-4 mb-4">
            {/* stat-card-col class forces 2-per-row on mobile via media query */}
            <Col xl={3} md={6} xs={6} className="stat-card-col">
              <Card className="glass-card stat-card">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, marginBottom: '5px' }}>
                        Total Patients
                      </p>
                      <div className={`stat-value ${animatedStats ? 'animated' : ''}`}>
                        {stats.totalPatients}
                      </div>
                      <small style={{ color: '#10b981', fontWeight: 600 }}>
                        <Icons.TrendingUp style={{ width: '16px', height: '16px', display: 'inline' }} /> +12% this month
                      </small>
                    </div>
                    <div className="stat-icon stat-icon-blue">
                      <Icons.Users />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xl={3} md={6} xs={6} className="stat-card-col">
              <Card className="glass-card stat-card">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, marginBottom: '5px' }}>
                        Today's Revenue
                      </p>
                      <div className={`stat-value ${animatedStats ? 'animated' : ''}`}>
                        ₹{stats.todayRevenue}
                      </div>
                      <small style={{ color: '#10b981', fontWeight: 600 }}>
                        <Icons.TrendingUp style={{ width: '16px', height: '16px', display: 'inline' }} /> +8% from yesterday
                      </small>
                    </div>
                    <div className="stat-icon stat-icon-green">
                      <Icons.DollarSign />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xl={3} md={6} xs={6} className="stat-card-col">
              <Card className="glass-card stat-card">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, marginBottom: '5px' }}>
                        This Month Collection
                      </p>
                      <div className={`stat-value ${animatedStats ? 'animated' : ''}`}>
                        ₹{stats.monthlyCollection}
                      </div>
                      <small style={{ color: '#8b5cf6', fontWeight: 600 }}>
                        <Icons.TrendingUp style={{ width: '16px', height: '16px', display: 'inline' }} /> Total earnings
                      </small>
                    </div>
                    <div className="stat-icon stat-icon-purple">
                      <Icons.DollarSign />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xl={3} md={6} xs={6} className="stat-card-col">
              <Card className="glass-card stat-card">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, marginBottom: '5px' }}>
                        Appointments
                      </p>
                      <div className={`stat-value ${animatedStats ? 'animated' : ''}`}>
                        {stats.completedToday}/{stats.totalAppointments}
                      </div>
                      <small style={{ color: '#f59e0b', fontWeight: 600 }}>
                        Completed today
                      </small>
                    </div>
                    <div className="stat-icon stat-icon-orange">
                      <Icons.Calendar />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* ── Bottom Row ── */}
          <Row className="g-4 mb-4">
            {/* bottom-row-col forces full width on mobile */}
            <Col lg={4} xs={12} className="bottom-row-col">
              <Card className="glass-card" style={{ border: 'none' }}>
                <Card.Body className="p-4">
                  <h5 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '20px' }}>
                    <Icons.Clock style={{ marginRight: '10px', color: '#0077b6' }} />
                    Upcoming Appointments
                  </h5>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {(() => {
                      // Get today, tomorrow, and day after tomorrow
                      const dates = [];
                      const dateLabels = [];
                      for (let i = 0; i < 3; i++) {
                        const d = new Date(now);
                        d.setDate(d.getDate() + i);
                        const dateStr = d.toISOString().substring(0, 10);
                        dates.push(dateStr);
                        if (i === 0) dateLabels.push('Today');
                        else if (i === 1) dateLabels.push('Tomorrow');
                        else dateLabels.push('Day After');
                      }

                      // Get all future appointments from prescriptions with nextVisitDate
                      const futureAppointments = prescriptions
                        .filter(pr => pr.nextVisitDate)
                        .map(pr => ({
                          ...pr,
                          nextVisitDateStr: (pr.nextVisitDate || '').toString().substring(0, 10)
                        }))
                        .sort((a, b) => a.nextVisitDateStr.localeCompare(b.nextVisitDateStr));

                      // Group by date
                      const groupedByDate = {};
                      futureAppointments.forEach(appt => {
                        if (!groupedByDate[appt.nextVisitDateStr]) {
                          groupedByDate[appt.nextVisitDateStr] = [];
                        }
                        groupedByDate[appt.nextVisitDateStr].push(appt);
                      });

                      // Render appointments
                      let appointmentCount = 0;
                      const maxAppointments = 6;

                      return futureAppointments.length > 0 ? (
                        <div>
                          {dates.map((dateStr, dateIdx) => {
                            const dateAppointments = groupedByDate[dateStr] || [];
                            if (dateAppointments.length === 0) {
                              return <div key={dateStr} style={{ fontSize: '0.85rem', color: '#94a3b8', padding: '12px 0', textAlign: 'center' }}>No appointments</div>;
                            }
                            return (
                              <div key={dateStr}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0077b6', textTransform: 'uppercase', marginTop: '12px', marginBottom: '8px', letterSpacing: '0.5px' }}>
                                  {dateLabels[dateIdx]}
                                </div>
                                {dateAppointments.slice(0, maxAppointments - appointmentCount).map((appt, idx) => {
                                  const patientInfo = patients.find(p => p.patientId === appt.patientId);
                                  const patientName = patientInfo?.name || patientInfo?.clientName || 'Unknown Patient';
                                  const patientMobile = patientInfo?.mobile || patientInfo?.phone || '';
                                  appointmentCount++;

                                  return (
                                    <div key={appt._id || idx} className="appointment-item d-flex justify-content-between align-items-center" style={{ marginBottom: '8px', padding: '12px 16px' }}>
                                      <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>
                                          {patientName}
                                        </div>
                                        <small style={{ color: '#64748b', fontSize: '0.75rem' }}>🆔 {appt.patientId || '-'}</small>
                                        <br />
                                        <small style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                          📋 {appt.diagnosis || appt.problemDescription || appt.treatment || 'Treatment'}
                                        </small>
                                        <br />
                                        <small style={{ color: '#0077b6', fontWeight: 600, fontSize: '0.75rem' }}>
                                          📅 {appt.nextVisitDateStr}
                                        </small>
                                      </div>
                                      {patientMobile && (
                                        <button
                                          onClick={() => handleWhatsAppShare(patientMobile, appt, patientName)}
                                          className="btn btn-sm"
                                          style={{ background: '#25d366', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                          title="Share via WhatsApp"
                                        >
                                          <Icons.WhatsApp />
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b' }}>
                          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📅</div>
                          <small>No upcoming appointments scheduled</small>
                        </div>
                      );
                    })()}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4} xs={12} className="bottom-row-col">
              <Card className="glass-card" style={{ border: 'none' }}>
                <Card.Body className="p-4">
                  <h5 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '20px' }}>
                    <Icons.Activity style={{ marginRight: '10px', color: '#0077b6' }} />
                    Today's Bills Generated
                  </h5>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {(() => {
                      const todayBills = prescriptions.filter(p => {
                        const createdDate = p.createdAt ? new Date(p.createdAt).toISOString().substring(0, 10) : '';
                        return createdDate === todayKey;
                      });

                      return todayBills.length > 0 ? (
                        todayBills.map((pr, idx) => {
                          const patientInfo = patients.find(p => p.patientId === pr.patientId);
                          const patientName = patientInfo?.name || patientInfo?.clientName || 'Unknown Patient';

                          return (
                            <div key={pr._id || idx} className="activity-item">
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <small style={{ color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>
                                    🆔 {pr.patientId || '-'}
                                  </small>
                                  <br />
                                  <small style={{ color: '#1e293b', fontWeight: 600 }}>
                                    👤 {patientName}
                                  </small>
                                  <br />
                                  <div style={{ fontWeight: 500, color: '#1e293b', fontSize: '0.9rem', marginTop: '4px' }}>
                                    {pr.diagnosis || pr.problemDescription || pr.treatment || 'Treatment'}
                                  </div>
                                  <br />
                                  <small style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                    ⏰ {(() => {
                                      const timeStr = pr.createdAt ? new Date(pr.createdAt).toISOString().substring(11, 16) : null;
                                      if (!timeStr) return 'Time not specified';
                                      const [hours, minutes] = timeStr.split(':').map(Number);
                                      const ampm = hours >= 12 ? 'PM' : 'AM';
                                      const hours12 = hours % 12 || 12;
                                      return `${String(hours12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
                                    })()}
                                  </small>
                                </div>
                                <Badge style={{
                                  background: (pr.paymentStatus || pr.status) === 'Paid' ? '#10b981' :
                                    (pr.paymentStatus || pr.status) === 'Pending' ? '#f59e0b' : '#0077b6',
                                  color: 'white',
                                  padding: '6px 12px',
                                  borderRadius: '20px',
                                  fontSize: '0.75rem',
                                  whiteSpace: 'nowrap'
                                }}>
                                  ₹{(pr.fee || pr.total || 0)}
                                </Badge>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b' }}>
                          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📋</div>
                          <small>No bills generated today</small>
                        </div>
                      );
                    })()}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4} xs={12} className="bottom-row-col">
              <Card className="glass-card" style={{ border: 'none' }}>
                <Card.Body className="p-4">
                  <h5 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '20px' }}>
                    Quick Actions
                  </h5>
                  <Row className="g-3">
                    <Col xs={6}>
                      <button className="quick-action-btn">
                        <Icons.UserPlus style={{ width: '24px', height: '24px', marginBottom: '10px', color: '#0077b6' }} />
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>New Patient</div>
                      </button>
                    </Col>
                    <Col xs={6}>
                      <button className="quick-action-btn">
                        <Icons.Calendar style={{ width: '24px', height: '24px', marginBottom: '10px', color: '#0077b6' }} />
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Appointment</div>
                      </button>
                    </Col>
                    <Col xs={6}>
                      <button className="quick-action-btn">
                        <Icons.DollarSign style={{ width: '24px', height: '24px', marginBottom: '10px', color: '#0077b6' }} />
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Create Bill</div>
                      </button>
                    </Col>
                    <Col xs={6}>
                      <button className="quick-action-btn">
                        <Icons.Activity style={{ width: '24px', height: '24px', marginBottom: '10px', color: '#0077b6' }} />
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Prescription</div>
                      </button>
                    </Col>
                  </Row>

                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                    <h6 style={{ fontWeight: 600, color: '#64748b', marginBottom: '15px', fontSize: '0.9rem' }}>
                      Patient Categories
                    </h6>
                    {patientCategoryData.map((cat, idx) => (
                      <div key={idx} className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <small style={{ color: '#64748b', fontWeight: 500 }}>{cat.name}</small>
                          <small style={{ fontWeight: 700, color: '#1e293b' }}>{cat.value}</small>
                        </div>
                        <div className="progress-custom">
                          <div
                            className="progress-bar-custom"
                            style={{
                              width: `${(cat.value / stats.totalPatients) * 100}%`,
                              opacity: 1 - (idx * 0.2)
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* ── Charts Row ── */}
          <Row className="g-4">
            {/* chart-col-lg / chart-col-sm forces full width on mobile */}
            <Col lg={8} xs={12} className="chart-col-lg">
              <Card className="glass-card" style={{ border: 'none' }}>
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4 chart-header-row">
                    <h5 style={{ fontWeight: 700, color: '#1e293b', margin: 0 }}>
                      <Icons.Activity style={{ marginRight: '10px', color: '#0077b6' }} />
                      Revenue & Patient Trends
                    </h5>
                    <Badge className="chart-header-badge" style={{
                      background: 'linear-gradient(180deg, #0077b6 0%, #00b4d8 100%)',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '20px'
                    }}>
                      This Week
                    </Badge>
                  </div>
                  {/* chart-height-wrap lets mobile CSS override height */}
                  <div className="chart-height-wrap" style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0077b6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#0077b6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            background: 'rgba(255,255,255,0.95)',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#0077b6"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                        />
                        <Line
                          type="monotone"
                          dataKey="patients"
                          stroke="#00b4d8"
                          strokeWidth={3}
                          dot={{ fill: '#00b4d8', r: 4 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4} xs={12} className="chart-col-sm">
              <Card className="glass-card" style={{ border: 'none' }}>
                <Card.Body className="p-4">
                  <h5 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '20px' }}>
                    Treatment Distribution
                  </h5>
                  <div className="chart-height-wrap" style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={treatmentTypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {treatmentTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: 'rgba(255,255,255,0.95)',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3">
                    {treatmentTypeData.map((item, idx) => (
                      <div key={idx} className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center" style={{ minWidth: 0 }}>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: item.color,
                            marginRight: '10px',
                            flexShrink: 0
                          }} />
                          <small className="treatment-legend-label" style={{ color: '#64748b' }} title={item.name}>{item.name}</small>
                        </div>
                        <small style={{ fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', marginLeft: '8px' }}>{item.value}% ({item.count})</small>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Background Toggle */}
      <button
        className="bg-toggle"
        onClick={() => setShowBackgroundAnimation(!showBackgroundAnimation)}
        title="Toggle Background Animation"
      >
        <Icons.Sparkles />
      </button>
    </div>
  );
};

export default Dashboard;
