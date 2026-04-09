import React, { useState, useEffect } from 'react';
import {
  Container, Card, Row, Col, Table, Form, Button,
  InputGroup, Modal, Alert, Pagination
} from 'react-bootstrap';
import Sidebar from './Sidebar';

const History = () => {
  const [activeTab, setActiveTab] = useState('history');
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [diagnosisFilter, setDiagnosisFilter] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [showBackgroundAnimation, setShowBackgroundAnimation] = useState(true);
  const [animatedRows, setAnimatedRows] = useState([]);

  const API_BASE = 'https://subiahdentalclinic.onrender.com';
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const patientsRes = await fetch(`${API_BASE}/api/patients`);
        const patients = await patientsRes.json();

        const all = await Promise.all(patients.map(async (p) => {
          try {
            const presRes = await fetch(`${API_BASE}/api/prescriptions/patient/${p.patientId}`);
            const pres = presRes.ok ? await presRes.json() : [];
            return pres.map(pr => ({
              id: pr._id,
              billNo: pr.billNo || pr._id,
              date: pr.createdAt || pr.date || new Date().toISOString(),
              time: pr.createdAt ? new Date(pr.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (pr.time || ''),
              clientId: p.patientId,
              clientName: p.name,
              age: p.age,
              gender: p.gender,
              mobile: p.mobile,
              problem: pr.problemDescription || pr.problem || '',
              diagnosis: pr.diagnosis || '',
              treatment: pr.treatment || '',
              treatmentCode: '',
              toothNumber: pr.toothNumber || '',
              medicines: pr.medicines || [],
              fee: pr.fee || 0,
              receivedAmount: pr.receivedAmount || 0,
              balance: pr.balance || 0,
              discount: 0,
              total: pr.fee || 0,
              paymentStatus: '',
              paymentMethod: '',
              doctor: '',
              remarks: pr.remarks || '',
              nextVisit: ''
            }));
          } catch (e) {
            console.error('failed fetching prescriptions for', p.patientId, e);
            return [];
          }
        }));

        const flat = all.flat().sort((a, b) => new Date(b.date) - new Date(a.date));
        setHistoryData(flat);
      } catch (err) {
        console.error('Failed to load history', err);
      }
    };
    loadHistory();
  }, []);

  // Get unique diagnoses for filter
  const uniqueDiagnoses = [...new Set(historyData.map(h => h.diagnosis))];
  const uniqueMonths = [...new Set(historyData.map(h => h.date.substring(0, 7)))];

  // Filter logic
  const filteredHistory = historyData.filter(record => {
    const matchesSearch =
      record.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.clientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.billNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.mobile.includes(searchTerm) ||
      record.treatment.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMonth = monthFilter ? record.date.startsWith(monthFilter) : true;
    const matchesDiagnosis = diagnosisFilter ? record.diagnosis === diagnosisFilter : true;

    return matchesSearch && matchesMonth && matchesDiagnosis;
  });

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate totals
  const totalRevenue = filteredHistory.reduce((sum, r) => sum + r.total, 0);
  const totalBills = filteredHistory.length;
  // This month's collection (based on the main historyData dates)
  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthCollection = historyData
    .filter(h => (h.date || '').startsWith(thisMonthKey))
    .reduce((s, r) => s + (r.total || 0), 0);

  useEffect(() => {
    // Animate table rows when data changes
    const timer = setTimeout(() => {
      setAnimatedRows(paginatedHistory.map((_, i) => i));
    }, 100);
    return () => clearTimeout(timer);
  }, [currentPage, searchTerm, monthFilter, diagnosisFilter]);

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const handlePrintBill = async (record) => {
    if (!record) return;
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${record.clientName}</title>
        <style>
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            font-family: 'Times New Roman', serif;
            font-size: 14px;
            line-height: 1.4;
            color: #1f2937;
            margin: 0;
            padding: 0;
          }
          .prescription-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
            border: 2px solid #0077b6;
            border-radius: 8px;
            page-break-inside: avoid;
            page-break-before: avoid;
            page-break-after: avoid;
          }
          .clinic-header {
            text-align: center;
            border-bottom: 3px solid #0077b6;
            padding-bottom: 15px;
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          .clinic-name {
            font-size: 28px;
            font-weight: bold;
            color: #0077b6;
            margin: 0;
            letter-spacing: 2px;
          }
          .clinic-subtitle {
            font-size: 16px;
            color: #374151;
            margin: 5px 0;
            font-weight: 600;
          }
          .clinic-details {
            font-size: 12px;
            color: #6b7280;
            margin: 3px 0;
          }
          .clinic-contact {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #6b7280;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
          }
          .prescription-title {
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            color: #0077b6;
            margin: 20px 0;
            text-decoration: underline;
          }
          .patient-info-section {
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #0077b6;
            margin-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 5px;
          }
          .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          .info-table td {
            padding: 6px 8px;
            border: 1px solid #e5e7eb;
            vertical-align: top;
          }
          .info-table .label {
            font-weight: bold;
            background-color: #f3f4f6;
            width: 35%;
            color: #374151;
          }
          .prescription-details {
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          .medicines-section {
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          .medicines-list {
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 10px;
            background-color: #f9fafb;
          }
          .medicine-item {
            margin-bottom: 8px;
            padding: 8px;
            background: white;
            border-radius: 4px;
            border-left: 4px solid #0077b6;
            page-break-inside: avoid;
          }
          .medicine-name {
            font-weight: bold;
            color: #1f2937;
          }
          .medicine-category {
            font-size: 12px;
            color: #6b7280;
            font-style: italic;
          }
          .payment-section {
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          .payment-table {
            width: 100%;
            border-collapse: collapse;
          }
          .payment-table td {
            padding: 8px;
            border: 1px solid #e5e7eb;
            text-align: center;
          }
          .payment-table .header {
            background-color: #f3f4f6;
            font-weight: bold;
            color: #374151;
          }
          .doctor-signature {
            margin-top: 40px;
            text-align: right;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
            page-break-inside: avoid;
          }
          .signature-line {
            width: 200px;
            border-bottom: 1px solid #374151;
            margin-left: auto;
            margin-bottom: 5px;
          }
          .doctor-name {
            font-weight: bold;
            color: #1f2937;
          }
          .footer-note {
            margin-top: 20px;
            font-size: 11px;
            color: #6b7280;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
            page-break-inside: avoid;
          }
          .prescription-number {
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 12px;
            color: #6b7280;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="prescription-container">
          <div class="prescription-number">Bill-${record.billNo}</div>

          <!-- Clinic Header -->
          <div class="clinic-header">
            <h1 class="clinic-name">SUBBIAH DENTAL CLINIC</h1>
            <div class="clinic-details">H.O.: 1st Floor, 7/8, Sivanthipatti Road, Maharajanagar, Palayamkottai.</div>
            <div class="clinic-details">Tirunelveli, Tamil Nadu, India</div>
           
            <div class="clinic-contact">
              <span>📞  Ph: 0462-3244555 Cell: 98943 08857</span>
              <span>📧 info@subbiahdental.com</span>
              <span>🕒 Mon-Sat: 9:00 AM - 8:00 PM</span>
            </div>
          </div>

          <!-- Prescription Title -->
          <div class="prescription-title">DENTAL PRESCRIPTION</div>

          <!-- Patient Information -->
          <div class="patient-info-section">
            <div class="section-title">Patient Information</div>
            <table class="info-table">
              <tr>
                <td class="label">Patient Name:</td>
                <td>${record.clientName}</td>
                <td class="label">Patient ID:</td>
                <td>${record.clientId}</td>
              </tr>
              <tr>
                <td class="label">Age / Gender:</td>
                <td>${record.age} Years / ${record.gender}</td>
                <td class="label">Mobile Number:</td>
                <td>${record.mobile}</td>
              </tr>
            </table>
          </div>

          <!-- Prescription Details -->
          <div class="prescription-details">
            <div class="section-title">Clinical Details</div>
            <table class="info-table">
              <tr>
                <td class="label">Diagnosis:</td>
                <td colspan="3">${record.diagnosis || 'Not Specified'}</td>
              </tr>
              <tr>
                <td class="label">Problem Description:</td>
                <td colspan="3">${record.problem || 'Not Specified'}</td>
              </tr>
              <tr>
                <td class="label">Tooth Number:</td>
                <td>${record.toothNumber || 'Not Applicable'}</td>
                <td class="label">Treatment:</td>
                <td>${record.treatment || 'Not Specified'}</td>
              </tr>
              <tr>
                <td class="label">Remarks:</td>
                <td colspan="3">${record.remarks || 'None'}</td>
              </tr>
            </table>
          </div>

          <!-- Medicines Section -->
          <div class="medicines-section">
            <div class="section-title">Prescribed Medications</div>
            <div class="medicines-list">
              ${record.medicines && record.medicines.length > 0 ?
                record.medicines.map((medicine, index) =>
                  `${index + 1}. ${medicine.name}`
                ).join(', ') :
                'No medications prescribed'
              }
            </div>
          </div>

          <!-- Payment Details -->
          <div class="payment-section">
            <div class="section-title">Payment Details</div>
            <table class="payment-table">
              <tr>
                <td class="header">Previous Balance</td>
                <td class="header">Treatment Fee</td>
                <td class="header">Amount Received</td>
                <td class="header">Current Balance</td>
              </tr>
              <tr>
                <td>₹${record.balance || 0}</td>
                <td>₹${record.fee || 0}</td>
                <td>₹${record.receivedAmount || 0}</td>
                <td>₹${((record.balance || 0) + ((Number(record.fee) || 0) - (Number(record.receivedAmount) || 0)))}</td>
              </tr>
            </table>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', 'PRINT', 'height=800,width=900');
    if (!printWindow) {
      setAlert({ show: true, message: 'Unable to open print window. Please allow popups.', type: 'danger' });
      setTimeout(() => setAlert({ show: false }), 3000);
      return;
    }

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    try {
      printWindow.print();
      printWindow.close();
      setAlert({ show: true, message: `Printed bill ${record.billNo}`, type: 'success' });
      setTimeout(() => setAlert({ show: false }), 3000);
    } catch (e) {
      setAlert({ show: true, message: 'Printing failed', type: 'danger' });
      setTimeout(() => setAlert({ show: false }), 3000);
      try { printWindow.close(); } catch (_) { }
    }

  };

  const clearFilters = () => {
    setSearchTerm('');
    setMonthFilter('');
    setDiagnosisFilter('');
    setCurrentPage(1);
  };

  // Modern Icons
  const Icons = {
    Search: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>,
    View: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>,
    Print: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" /></svg>,
    Filter: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>,
    Calendar: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>,
    Money: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></svg>,
    File: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>,
    Check: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    Warning: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" /></svg>,
    Sparkles: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>,
    History: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /><path d="M12 7v5l4 2" /></svg>
  };

  return (
    <div className="history-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        .history-container {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        /* Animated Background using user's exact gradient */
        .animated-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          background: linear-gradient(180deg, #0077b6 0%, #00b4d8 100%);
          background-size: 100% 200%;
          animation: gradientMove 10s ease infinite;
          opacity: 0.1;
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
        }

        .glass-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 119, 182, 0.25);
        }

        /* Stats Cards Animation */
        .stat-card-enter {
          animation: cardFloat 0.8s ease-out forwards;
          opacity: 0;
        }

        @keyframes cardFloat {
          0% { opacity: 0; transform: translateY(40px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Stats Icon Boxes */
        .stat-icon-box {
          width: 55px;
          height: 55px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .stat-icon-box:hover {
          transform: scale(1.1) rotate(5deg);
        }

        /* Filter Section */
        .filter-section {
          background: linear-gradient(180deg, #0077b6 0%, #00b4d8 100%);
          border-radius: 20px;
          padding: 25px;
          box-shadow: 0 10px 40px rgba(0, 119, 182, 0.3);
          animation: slideDown 0.6s ease-out;
          position: relative;
          overflow: hidden;
        }

        .filter-section::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: rotate 20s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Modern Inputs */
        .modern-input {
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid transparent;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .modern-input:focus {
          outline: none;
          border-color: rgba(255,255,255,0.8);
          box-shadow: 0 0 0 4px rgba(255,255,255,0.3);
          transform: translateY(-2px);
        }

        /* Table Styles */
        .table-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 30px;
          box-shadow: 0 8px 32px rgba(0, 119, 182, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.5);
          animation: fadeInUp 0.8s ease-out;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .table-header-gradient {
          background: linear-gradient(180deg, #0077b6 0%, #00b4d8 100%) !important;
          color: white;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.85rem;
          letter-spacing: 0.5px;
        }

        .table-header-gradient th {
          border: none !important;
          padding: 20px 16px !important;
        }

        .table-row-modern {
          transition: all 0.3s ease;
          opacity: 0;
          animation: rowSlideIn 0.5s ease forwards;
        }

        @keyframes rowSlideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .table-row-modern:hover {
          background: rgba(0, 180, 216, 0.05) !important;
          transform: scale(1.01) translateX(5px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          z-index: 10;
          position: relative;
        }

        /* Status Badges */
        .badge-modern {
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.8rem;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }

        .badge-paid {
          background: linear-gradient(180deg, #10b981 0%, #34d399 100%);
          color: white;
        }

        .badge-pending {
          background: linear-gradient(180deg, #f59e0b 0%, #fbbf24 100%);
          color: white;
        }

        .badge-partial {
          background: linear-gradient(180deg, #0077b6 0%, #00b4d8 100%);
          color: white;
        }

        .badge-modern:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        /* Action Buttons */
        .btn-action {
          border: none;
          border-radius: 10px;
          padding: 10px 16px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .btn-view {
          background: rgba(0, 119, 182, 0.1);
          color: #0077b6;
          border: 2px solid rgba(0, 119, 182, 0.2);
        }

        .btn-view:hover {
          background: linear-gradient(180deg, #0077b6 0%, #00b4d8 100%);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 119, 182, 0.3);
        }

        .btn-print {
          background: rgba(0, 180, 216, 0.1);
          color: #00b4d8;
          border: 2px solid rgba(0, 180, 216, 0.2);
        }

        .btn-print:hover {
          background: linear-gradient(180deg, #0077b6 0%, #00b4d8 100%);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 119, 182, 0.3);
        }

        /* Pagination */
        .pagination-modern .page-link {
          border: none;
          border-radius: 12px;
          margin: 0 4px;
          padding: 10px 16px;
          color: #0077b6;
          font-weight: 600;
          transition: all 0.3s ease;
          background: rgba(0, 119, 182, 0.1);
        }

        .pagination-modern .page-link:hover {
          background: linear-gradient(180deg, #0077b6 0%, #00b4d8 100%);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 119, 182, 0.4);
        }

        .pagination-modern .active .page-link {
          background: linear-gradient(180deg, #0077b6 0%, #00b4d8 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(0, 119, 182, 0.4);
        }

        /* Modal Styles */
        .modal-header-gradient {
          background: linear-gradient(180deg, #0077b6 0%, #00b4d8 100%);
          border: none;
          padding: 24px;
        }

        .modal-content {
          border: none;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        /* Alert Modern */
        .alert-modern {
          border: none;
          border-radius: 16px;
          padding: 16px 24px;
          font-weight: 500;
          animation: slideInRight 0.5s ease;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
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

        /* Clear Filters Button */
        .btn-clear {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          border-radius: 10px;
          padding: 8px 20px;
          font-weight: 600;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .btn-clear:hover {
          background: white;
          color: #0077b6;
          transform: translateY(-2px);
        }

        /* Apply Button */
        .btn-apply {
          background: white;
          color: #0077b6;
          border: none;
          border-radius: 12px;
          padding: 12px 24px;
          font-weight: 700;
          transition: all 0.3s ease;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .btn-apply:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }

        /* Info Cards in Modal */
        .info-card {
          background: linear-gradient(135deg, rgba(0, 119, 182, 0.05) 0%, rgba(0, 180, 216, 0.05) 100%);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(0, 119, 182, 0.1);
          transition: all 0.3s ease;
        }

        .info-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 119, 182, 0.1);
        }

        /* Payment Summary Card */
        .payment-card {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.1) 100%);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        /* Remarks Card */
        .remarks-card {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        /* Print Button in Modal */
        .btn-print-modal {
          background: linear-gradient(180deg, #0077b6 0%, #00b4d8 100%);
          border: none;
          border-radius: 12px;
          padding: 12px 24px;
          color: white;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 119, 182, 0.4);
        }

        .btn-print-modal:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 119, 182, 0.5);
        }

        /* ==== RESPONSIVE STYLES ==== */
        @media (max-width: 768px) {
          /* Main container padding */
          .history-container > div {
            padding: 15px !important;
          }

          /* Stats cards stack on mobile */
          .stat-card-enter {
            animation-delay: 0s !important;
          }
          
          .table-container {
            padding: 20px 15px;
            overflow-x: auto;
          }
          
          /* Filter section - vertical layout on mobile */
          .filter-section {
            padding: 20px;
          }
          
          .filter-section .d-flex {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 12px;
          }
          
          .btn-clear {
            width: 100%;
            text-align: center;
          }
          
          /* Form inputs stack */
          .filter-section .row {
            margin-top: 15px;
          }
          
          .filter-section .col-md-4,
          .filter-section .col-md-3,
          .filter-section .col-md-2 {
            margin-bottom: 12px;
          }
          
          .btn-apply {
            width: 100%;
          }
          
          /* Table responsive - horizontal scroll */
          .table-responsive {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          
          .table {
            min-width: 800px;
          }
          
          .table-header-gradient th {
            padding: 12px 10px !important;
            font-size: 0.7rem;
          }
          
          .table-row-modern td {
            padding: 12px 10px;
            font-size: 0.8rem;
          }
          
          /* Action buttons smaller on mobile */
          .btn-action {
            padding: 6px 10px;
          }
          
          .btn-action svg {
            width: 12px;
            height: 12px;
          }
          
          /* Pagination responsive */
          .pagination-modern .page-link {
            padding: 6px 10px;
            font-size: 0.8rem;
          }
          
          .d-flex.justify-content-between.align-items-center.mt-4 {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
          
          /* Modal adjustments */
          .modal-dialog {
            margin: 10px;
          }
          
          .modal-body {
            padding: 20px !important;
          }
          
          .modal-header-gradient {
            padding: 16px;
          }
          
          .modal-title {
            font-size: 1.1rem;
          }
          
          /* Info cards in modal */
          .info-card, .payment-card, .remarks-card {
            padding: 15px;
          }
          
          .info-card .mb-2, .payment-card .mb-2 {
            flex-direction: column;
            gap: 5px;
          }
          
          .info-card .mb-2 span:first-child,
          .payment-card .mb-2 span:first-child {
            width: 100%;
          }
          
          /* Stats cards */
          .glass-card .p-4 {
            padding: 20px !important;
          }
          
          .glass-card h3 {
            font-size: 1.5rem !important;
          }
          
          .glass-card p {
            font-size: 0.8rem;
          }
          
          .stat-icon-box {
            width: 45px;
            height: 45px;
          }
          
          /* Page header */
          .mb-4 h2 {
            font-size: 1.5rem !important;
            flex-wrap: wrap;
          }
          
          .mb-4 p {
            font-size: 0.9rem;
          }
          
          /* Background toggle button position */
          .bg-toggle {
            bottom: 20px;
            right: 20px;
            width: 45px;
            height: 45px;
          }
          
          .bg-toggle svg {
            width: 20px;
            height: 20px;
          }
        }
        
        /* Tablet responsive (769px to 1024px) */
        @media (min-width: 769px) and (max-width: 1024px) {
          .history-container > div {
            padding: 20px !important;
          }
          
          .filter-section {
            padding: 20px;
          }
          
          .table-container {
            padding: 25px;
          }
          
          .table-header-gradient th {
            padding: 15px 12px !important;
            font-size: 0.75rem;
          }
          
          .table-row-modern td {
            padding: 14px 12px;
            font-size: 0.85rem;
          }
          
          /* Stats cards on tablet - 2 columns, 1 full width on smaller tablets */
          .row.g-4 {
            --bs-gutter-y: 1rem;
          }
          
          .glass-card .p-4 {
            padding: 20px !important;
          }
          
          .stat-icon-box {
            width: 50px;
            height: 50px;
          }
        }
        
        /* Small desktop adjustments */
        @media (min-width: 1025px) and (max-width: 1366px) {
          .table-header-gradient th {
            padding: 15px 12px !important;
          }
        }
        
        /* Extra small devices */
        @media (max-width: 480px) {
          .table-container {
            padding: 15px 12px;
          }
          
          .filter-section {
            padding: 15px;
          }
          
          .glass-card h3 {
            font-size: 1.3rem !important;
          }
          
          .modal-header-gradient {
            padding: 12px 16px;
          }
          
          .info-card, .payment-card, .remarks-card {
            padding: 12px;
          }
          
          .payment-card .d-flex.justify-content-between {
            font-size: 0.9rem;
          }
          
          .btn-print-modal, .btn-apply {
            padding: 10px 16px;
            font-size: 0.85rem;
          }
        }
        
        /* Landscape mode on mobile */
        @media (max-width: 768px) and (orientation: landscape) {
          .history-container > div {
            padding: 10px !important;
          }
          
          .filter-section .row {
            margin-top: 10px;
          }
          
          .modal-dialog {
            max-height: 90vh;
            overflow-y: auto;
          }
        }
      `}</style>

      {/* Optional Animated Background */}
      {showBackgroundAnimation && <div className="animated-bg" />}

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div style={{ marginLeft: '0', padding: '30px', position: 'relative', zIndex: 1 }}>
        <Container fluid>
          {/* Alert */}
          {alert.show && (
            <Alert
              variant={alert.type}
              className="mb-4 alert-modern"
              onClose={() => setAlert({ show: false })}
              dismissible
              style={{
                background: alert.type === 'success' ? 'linear-gradient(180deg, #0077b6 0%, #00b4d8 100%)' :
                  alert.type === 'danger' ? 'linear-gradient(180deg, #dc3545 0%, #ff6b6b 100%)' :
                    alert.type === 'info' ? 'linear-gradient(180deg, #0077b6 0%, #00b4d8 100%)' : '#0077b6',
                color: 'white'
              }}
            >
              <div className="d-flex align-items-center gap-2">
                {alert.type === 'success' ? <Icons.Sparkles /> : null}
                {alert.message}
              </div>
            </Alert>
          )}

          {/* Page Header */}
          {/* <div className="mb-4" style={{ animation: 'slideDown 0.6s ease-out' }}>
            <h2 style={{
              background: 'linear-gradient(180deg, #0077b6 0%, #00b4d8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              fontSize: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px'
            }}>
              <Icons.History /> Treatment History & Billing Records
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>View and manage patient billing history, payments, and treatment records</p>
          </div> */}

          {/* Stats Cards */}
          <Row className="g-4 mb-4">
            <Col xs={12} sm={6} lg={4} className="stat-card-enter" style={{ animationDelay: '0.1s' }}>
              <Card className="glass-card h-100" style={{ border: 'none' }}>
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p style={{ color: '#64748b', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Total Bills</p>
                      <h3 style={{
                        background: 'linear-gradient(180deg, #0077b6 0%, #00b4d8 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 800,
                        fontSize: '2rem',
                        margin: 0
                      }}>{totalBills}</h3>
                    </div>
                    <div className="stat-icon-box" style={{
                      background: 'rgba(0, 119, 182, 0.1)',
                      color: '#0077b6'
                    }}>
                      <Icons.File />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} sm={6} lg={4} className="stat-card-enter" style={{ animationDelay: '0.2s' }}>
              <Card className="glass-card h-100" style={{ border: 'none' }}>
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p style={{ color: '#64748b', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Total Revenue</p>
                      <h3 style={{
                        background: 'linear-gradient(180deg, #10b981 0%, #34d399 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 800,
                        fontSize: '2rem',
                        margin: 0
                      }}>₹{totalRevenue.toLocaleString()}</h3>
                    </div>
                    <div className="stat-icon-box" style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: '#10b981'
                    }}>
                      <Icons.Money />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} sm={6} lg={4} className="stat-card-enter" style={{ animationDelay: '0.3s' }}>
              <Card className="glass-card h-100" style={{ border: 'none' }}>
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p style={{ color: '#64748b', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>This Month Collection</p>
                      <h3 style={{
                        background: 'linear-gradient(180deg, #0077b6 0%, #00b4d8 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 800,
                        fontSize: '2rem',
                        margin: 0
                      }}>₹{thisMonthCollection.toLocaleString()}</h3>
                    </div>
                    <div className="stat-icon-box" style={{
                      background: 'rgba(0, 119, 182, 0.1)',
                      color: '#0077b6'
                    }}>
                      <Icons.Money />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Filters Section */}
          <div className="filter-section mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3" style={{ position: 'relative', zIndex: 10 }}>
              <h5 className="m-0 text-white" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icons.Filter /> Filter Records
              </h5>
              <button className="btn-clear" onClick={clearFilters}>
                Clear All
              </button>
            </div>
            <Row className="g-3" style={{ position: 'relative', zIndex: 10 }}>
              <Col xs={12} md={4}>
                <InputGroup>
                  <InputGroup.Text style={{ background: 'white', border: 'none', padding: '0 16px', borderRadius: '12px 0 0 12px' }}>
                    <Icons.Search />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search by patient, ID, bill no, mobile..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="modern-input"
                    style={{ borderRadius: '0 12px 12px 0' }}
                  />
                </InputGroup>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <Form.Select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="modern-input"
                >
                  <option value="">All Months</option>
                  {uniqueMonths.map(month => (
                    <option key={month} value={month}>
                      {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <Form.Select
                  value={diagnosisFilter}
                  onChange={(e) => setDiagnosisFilter(e.target.value)}
                  className="modern-input"
                >
                  <option value="">All Diagnoses</option>
                  {uniqueDiagnoses.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={12} md={2}>
                <button className="btn-apply w-100">
                  Apply Filters
                </button>
              </Col>
            </Row>
          </div>

          {/* History Table */}
          <div className="table-container">
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead>
                  <tr className="table-header-gradient">
                    <th>Bill No</th>
                    <th>Date</th>
                    <th>Patient</th>
                    <th>Diagnosis</th>
                    <th>Fee</th>
                    <th>Received Amount</th>
                    <th>Balance</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedHistory.map((record, index) => (
                    <tr
                      key={record.id}
                      className="table-row-modern"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td style={{ fontWeight: 700, color: '#0077b6', fontSize: '0.95rem' }}>
                        #{record.billNo}
                      </td>
                      <td style={{ fontWeight: 500, color: '#475569' }}>
                        <div style={{ fontWeight: 700 }}>{new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{record.time || (new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{record.clientName}</div>
                        <small style={{ color: '#64748b', fontWeight: 500 }}>{record.clientId}</small>
                      </td>
                      <td style={{ color: '#475569', fontWeight: 600 }}>{record.diagnosis || '-'}</td>
                      <td style={{ fontWeight: 700, color: '#059669', fontSize: '1.05rem', textAlign: 'center' }}>₹{record.fee}</td>
                      <td style={{ fontWeight: 700, color: '#16a34a', fontSize: '1.05rem', textAlign: 'center' }}>₹{record.receivedAmount}</td>
                      <td style={{ fontWeight: 700, color: record.balance > 0 ? '#dc2626' : '#059669', fontSize: '1.05rem', textAlign: 'center' }}>
                        ₹{record.balance}
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn-action btn-view"
                            onClick={() => handleViewRecord(record)}
                          >
                            <Icons.View />
                          </button>
                          <button
                            className="btn-action btn-print"
                            onClick={() => handlePrintBill(record)}
                          >
                            <Icons.Print />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* Empty State */}
            {paginatedHistory.length === 0 && (
              <div className="text-center py-5">
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
                <h5 style={{ color: '#64748b', fontWeight: 600 }}>No records found</h5>
                <p style={{ color: '#94a3b8' }}>Try adjusting your search or filter criteria</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap" style={{ gap: '12px' }}>
                <small style={{ color: '#64748b', fontWeight: 500 }}>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredHistory.length)} of {filteredHistory.length} records
                </small>
                <Pagination className="pagination-modern mb-0">
                  <Pagination.Prev
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  />
                  {[...Array(totalPages)].map((_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  />
                </Pagination>
              </div>
            )}
          </div>
        </Container>
      </div>

      {/* Background Toggle Button */}
      <button
        className="bg-toggle"
        onClick={() => setShowBackgroundAnimation(!showBackgroundAnimation)}
        title="Toggle Background Animation"
      >
        <Icons.Sparkles />
      </button>

      {/* View Bill Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
        <Modal.Header closeButton className="modal-header-gradient text-white">
          <Modal.Title style={{ fontWeight: 700, fontSize: '1.3rem' }}>
            Bill Details - {selectedRecord?.billNo}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4" style={{ background: 'rgba(248, 249, 250, 0.8)' }}>
          {selectedRecord && (
            <div>
              <Row className="mb-4 g-3">
                <Col xs={12} md={6}>
                  <div className="info-card">
                    <h6 style={{ color: '#0077b6', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
                      Patient Information
                    </h6>
                    <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '5px' }}>
                      <span style={{ color: '#000000', fontSize: '0.9rem', fontWeight: 600 }}>Name:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{selectedRecord.clientName}</span>
                    </div>
                    <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '5px' }}>
                      <span style={{ color: '#000000', fontSize: '0.9rem', fontWeight: 600 }}>ID:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{selectedRecord.clientId}</span>
                    </div>
                    <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '5px' }}>
                      <span style={{ color: '#000000', fontSize: '0.9rem', fontWeight: 600 }}>Age/Gender:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{selectedRecord.age} / {selectedRecord.gender}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '5px' }}>
                      <span style={{ color: '#010101', fontSize: '0.9rem', fontWeight: 600 }}>Mobile:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{selectedRecord.mobile}</span>
                    </div>
                  </div>
                </Col>
                <Col xs={12} md={6}>
                  <div className="info-card">
                    <h6 style={{ color: '#0077b6', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
                      Bill Information
                    </h6>
                    <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '5px' }}>
                      <span style={{ color: '#020202', fontSize: '0.9rem', fontWeight: 600 }}>Bill No:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{selectedRecord.billNo}</span>
                    </div>
                    <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '5px' }}>
                      <span style={{ color: '#070707', fontSize: '0.9rem', fontWeight: 600 }}>Date:</span>
                      <span style={{ fontWeight: 600, color: '#080808' }}>{new Date(selectedRecord.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      <small style={{ color: '#000000', marginTop: '6px' }}>{selectedRecord.time || (new Date(selectedRecord.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}</small>
                    </div>
                  </div>
                </Col>
              </Row>

              <div className="info-card mb-3">
                <h6 style={{ color: '#0077b6', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
                  Treatment Details
                </h6>
                <Row>
                  <Col xs={12} md={6}>
                    <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '5px' }}>
                      <span style={{ color: '#040404', fontSize: '0.9rem', fontWeight: 600 }}>Diagnosis:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{selectedRecord.diagnosis}</span>
                    </div>
                    <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '5px' }}>
                      <span style={{ color: '#000000', fontSize: '0.9rem', fontWeight: 600 }}>Problem:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{selectedRecord.problem}</span>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '5px' }}>
                      <span style={{ color: '#0d0d0e', fontSize: '0.9rem', fontWeight: 600 }}>Tooth Number:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{selectedRecord.toothNumber}</span>
                    </div>
                    <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '5px' }}>
                      <span style={{ color: '#060606', fontSize: '0.9rem', fontWeight: 600 }}>Medicines:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{(selectedRecord.medicines || []).map(m => m.name).join(', ') || '-'}</span>
                    </div>
                  </Col>
                </Row>
              </div>

              <div className="payment-card mb-3">
                <h6 style={{ color: '#059669', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
                  Payment Details
                </h6>
                <div className="d-flex justify-content-between mb-2 flex-wrap" style={{ gap: '5px' }}>
                  <span style={{ color: '#64748b' }}>Fee:</span>
                  <span style={{ fontWeight: 600 }}>₹{selectedRecord.fee}</span>
                </div>
                <div className="d-flex justify-content-between mb-2 flex-wrap" style={{ gap: '5px' }}>
                  <span style={{ color: '#64748b' }}>Received Amount:</span>
                  <span style={{ fontWeight: 600, color: '#16a34a' }}>₹{selectedRecord.receivedAmount}</span>
                </div>
                <hr style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }} />
                <div className="d-flex justify-content-between flex-wrap" style={{ fontWeight: 700, fontSize: '1.2rem', gap: '5px' }}>
                  <span style={{ color: '#1e293b' }}>Balance:</span>
                  <span style={{ color: selectedRecord.balance > 0 ? '#dc2626' : '#059669' }}>₹{selectedRecord.balance}</span>
                </div>
              </div>

              {selectedRecord.remarks && (
                <div className="remarks-card">
                  <h6 style={{ color: '#d97706', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                    Remarks
                  </h6>
                  <p className="mb-0" style={{ color: '#92400e', fontWeight: 500 }}>{selectedRecord.remarks}</p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ background: 'rgba(248, 249, 250, 0.8)', borderTop: '1px solid rgba(0, 119, 182, 0.1)', gap: '10px' }} className="flex-wrap">
          <Button variant="light" onClick={() => setShowViewModal(false)} style={{ borderRadius: '12px', padding: '10px 24px', fontWeight: 600 }}>
            Close
          </Button>
          <button className="btn-print-modal" onClick={() => handlePrintBill(selectedRecord)}>
            <Icons.Print /> Print Bill
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default History;
