import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Table, Button, Form, Modal, 
  InputGroup, Badge, Alert, Pagination, Container
} from 'react-bootstrap';
import Sidebar from './Sidebar';

const Clients = () => {
  const [activeTab, setActiveTab] = useState('clients');
  const [showBackgroundAnimation, setShowBackgroundAnimation] = useState(true);
  
  // TamilNadu Districts
  const tamilNaduDistricts = [
    'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode',
    'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai','Tirunelveli',
    'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nellore', 'Nilgiris', 'Perambalur',
    'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Samayapuram', 'Sivagangai',
    'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Tenkasi',
    'Thanjavur', 'Theni', 'Tuticorin', 'Udagamandalam', 'Vellore', 'Villupuram',
  ];
  const [districtSearch, setDistrictSearch] = useState('');
  const [editDistrictSearch, setEditDistrictSearch] = useState('');
  
  const [clients, setClients] = useState([]);
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

  // Load patients from backend and map patientId -> id for UI compatibility
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/patients`);
        const data = await res.json();
        const mapped = Array.isArray(data) ? data.map(p => ({ ...p, id: p.patientId })) : [];
        setClients(mapped);
      } catch (err) {
        console.error('Failed to load patients', err);
      }
    };
    load();
  }, []);

  // Open Add modal and fetch next patient id to display
  const handleOpenAddModal = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/patients/next-id`);
      const data = await res.json();
      const nextId = data?.nextId || '';
      setNewClient(prev => ({ ...prev, id: nextId, patientId: nextId }));
      setShowAddModal(true);
    } catch (err) {
      console.error('Failed to fetch next patient id', err);
      setShowAddModal(true);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [animatedRows, setAnimatedRows] = useState([]);
  const [tableView, setTableView] = useState('all'); // 'all', 'thisMonth', or 'pending'

  const [newClient, setNewClient] = useState({
    name: '',
    age: '',
    gender: 'Male',
    mobile: '',
    address: '',
    district: '',
    category: 'Regular',
    email: '',
    pastMedicalHistory: '',
    visits: []
  });

  // Filter clients
 const filteredClients = clients.filter(client => {
  const normalizedSearchTerm = (searchTerm || '').toLowerCase();
  const matchesSearch =
    (client.name?.toLowerCase() || '').includes(normalizedSearchTerm) ||
    (client.id?.toString().toLowerCase() || '').includes(normalizedSearchTerm) ||
    (client.mobile || '').includes(searchTerm);

  const matchesDate = dateFilter ? (client.lastVisit || '') === dateFilter : true;

  return matchesSearch && matchesDate;
});

  // Pagination
  const itemsPerPage = 7;
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / itemsPerPage));
  
  useEffect(() => {
    setCurrentPage(1);
    // Trigger row animations when data changes
    const timer = setTimeout(() => {
      setAnimatedRows(filteredClients.slice(0, itemsPerPage).map((_, i) => i));
    }, 100);
    return () => clearTimeout(timer);
  }, [searchTerm, dateFilter, clients]);

  const displayedClients = filteredClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Stats
  const thisMonthPatients = clients.filter(c => {
    const visitDate = new Date(c.lastVisit);
    const now = new Date();
    return visitDate.getMonth() === now.getMonth() && visitDate.getFullYear() === now.getFullYear();
  });
  const thisMonthClients = thisMonthPatients.length;

  const pendingPatients = clients.filter(c => (c.balance || 0) > 0);
  const pendingCount = pendingPatients.length;
  const pendingAmount = pendingPatients.reduce((sum, c) => sum + (c.balance || 0), 0);

  // Get the data to display based on table view
  const getDisplayData = () => {
    if (tableView === 'thisMonth') {
      return thisMonthPatients.filter(client => {
        const normalizedSearchTerm = (searchTerm || '').toLowerCase();
        const matchesSearch =
          (client.name?.toLowerCase() || '').includes(normalizedSearchTerm) ||
          (client.id?.toString().toLowerCase() || '').includes(normalizedSearchTerm) ||
          (client.mobile || '').includes(searchTerm);
        const matchesDate = dateFilter ? (client.lastVisit || '') === dateFilter : true;
        return matchesSearch && matchesDate;
      });
    } else if (tableView === 'pending') {
      return pendingPatients.filter(client => {
        const normalizedSearchTerm = (searchTerm || '').toLowerCase();
        const matchesSearch =
          (client.name?.toLowerCase() || '').includes(normalizedSearchTerm) ||
          (client.id?.toString().toLowerCase() || '').includes(normalizedSearchTerm) ||
          (client.mobile || '').includes(searchTerm);
        const matchesDate = dateFilter ? (client.lastVisit || '') === dateFilter : true;
        return matchesSearch && matchesDate;
      });
    } else {
      return filteredClients;
    }
  };

  const viewData = getDisplayData();
  const viewTotalPages = Math.max(1, Math.ceil(viewData.length / itemsPerPage));
  const viewDisplayedData = viewData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Handlers
  const handleAddClient = () => {
    if (!newClient.name || !newClient.mobile) {
      setAlert({ show: true, message: 'Please fill required fields', type: 'danger' });
      return;
    }
    if ((newClient.mobile || '').length !== 10) {
      setAlert({ show: true, message: 'Mobile number must be exactly 10 digits', type: 'danger' });
      return;
    }
    (async () => {
      try {
        const body = { 
          ...newClient, 
          age: newClient.age ? parseInt(newClient.age, 10) : undefined,
          lastVisit: new Date().toISOString().split('T')[0] 
        };
        // Don't send frontend-generated id to backend - backend generates patientId
        delete body.id;
        delete body.patientId;
        
        const res = await fetch(`${API_BASE}/api/patients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
          console.error('API Error:', errorData);
          setAlert({ show: true, message: `Failed to add client: ${errorData?.error || res.statusText}`, type: 'danger' });
          return;
        }
        
        const saved = await res.json();
        setClients(prev => [{ ...saved, id: saved.patientId }, ...prev]);
        setNewClient({ name: '', age: '', gender: 'Male', mobile: '', address: '', district: '', category: 'Regular', email: '', pastMedicalHistory: '', visits: [] });
        setShowAddModal(false);
        setAlert({ show: true, message: 'Client added successfully', type: 'success' });
        setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
      } catch (err) {
        console.error('Network Error:', err);
        setAlert({ show: true, message: 'Network error: ' + err.message, type: 'danger' });
      }
    })();
  };

  const handleEditClient = () => {
    if ((selectedClient.mobile || '').replace(/\D/g, '').length !== 10) {
      setAlert({ show: true, message: 'Mobile number must be exactly 10 digits', type: 'danger' });
      return;
    }
    (async () => {
      try {
        const id = selectedClient.id;
        const body = {
          ...selectedClient,
          age: selectedClient.age ? parseInt(selectedClient.age, 10) : undefined
        };
        // Remove id field from body since backend uses patientId
        delete body.id;
        
        const res = await fetch(`${API_BASE}/api/patients/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
          console.error('API Error:', errorData);
          setAlert({ show: true, message: `Failed to update client: ${errorData?.error || res.statusText}`, type: 'danger' });
          return;
        }
        
        const updated = await res.json();
        setClients(clients.map(c => c.id === updated.patientId ? { ...updated, id: updated.patientId } : c));
        setShowEditModal(false);
        setAlert({ show: true, message: 'Client updated successfully', type: 'success' });
        setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
      } catch (err) {
        console.error('Network Error:', err);
        setAlert({ show: true, message: 'Network error: ' + err.message, type: 'danger' });
      }
    })();
  };

  const handleDeleteClient = () => {
    (async () => {
      try {
        const id = selectedClient.id;
        await fetch(`${API_BASE}/api/patients/${id}`, { method: 'DELETE' });
        setClients(clients.filter(c => c.id !== id));
        setShowDeleteModal(false);
        setAlert({ show: true, message: 'Client deleted successfully', type: 'success' });
        setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
      } catch (err) {
        console.error(err);
        setAlert({ show: true, message: 'Failed to delete client', type: 'danger' });
      }
    })();
  };

  const openEditModal = (client) => {
    setSelectedClient(client);
    setEditDistrictSearch('');
    setShowEditModal(true);
  };

  const openViewModal = async (client) => {
    setSelectedClient(client);
    setShowViewModal(true);
    try {
      const pid = client.patientId || client.id;
      const res = await fetch(`${API_BASE}/api/prescriptions/patient/${pid}`);
      if (res.ok) {
        const data = await res.json();
        setPrescriptions(Array.isArray(data) ? data : []);
      } else {
        setPrescriptions([]);
      }
    } catch (err) {
      console.error('Failed to fetch prescriptions', err);
      setPrescriptions([]);
    }
  };

  const openDeleteModal = (client) => {
    setSelectedClient(client);
    setShowDeleteModal(true);
  };

  // Modern Icons
  const Icons = {
    Search: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>,
    Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
    Users: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    Calendar: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
    Star: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>,
    Delete: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
    View: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
    Filter: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    Sparkles: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
  };

  // Decide which visits to show: prefer prescriptions collection when available
  const visitsToShow = (() => {
    if (!selectedClient) return [];
    if (prescriptions && prescriptions.length > 0) {
      return prescriptions.map(p => ({
        date: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : (p.date || ''),
        time: p.createdAt ? new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (p.time || p.visitTime || ''),
        diagnosis: p.diagnosis,
        toothNumber: p.toothNumber,
        problem: p.problemDescription || p.problem,
        medicines: p.medicines,
        treatment: p.treatment,
        fee: p.fee,
        nextVisitDate: p.nextVisitDate,
        receivedAmount: p.receivedAmount,
        balance: p.balance
      }));
    }

    return (selectedClient.visits || []).map(vv => {
      let dateVal = vv.date || '';
      let timeVal = vv.time || vv.visitTime || '';
      const parsed = Date.parse(vv.date);
      if (!isNaN(parsed)) {
        dateVal = new Date(parsed).toLocaleDateString();
        if (!timeVal) timeVal = new Date(parsed).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return {
        date: dateVal,
        time: timeVal,
        diagnosis: vv.diagnosis,
        toothNumber: vv.toothNumber,
        problem: vv.problem || vv.problemDescription,
        medicines: vv.medicines || vv.medication,
        treatment: vv.treatment,
        fee: vv.fee,
        nextVisitDate: vv.nextVisitDate,
        receivedAmount: vv.receivedAmount,
        balance: vv.balance
      };
    });
  })();

  return (
    <div className="modern-clients-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        .modern-clients-container {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        /* Animated Gradient Background */
        .animated-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab, #a78bfa, #f472b6);
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
          opacity: 0.15;
        }

        .animated-bg::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
          animation: rotate 30s linear infinite;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Glassmorphism Card Style */
        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .glass-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px 0 rgba(31, 38, 135, 0.25);
          background: rgba(255, 255, 255, 0.95);
        }

        /* Control Bar Styles */
        .control-bar {
          background: linear-gradient(180deg, #0077b6 0%, #00b4d8 100%);
          border-radius: 20px;
          padding: 20px 30px;
          box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          position: relative;
          overflow: hidden;
          animation: slideDown 0.6s ease-out;
        }

        .control-bar::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%) rotate(0deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(360deg); }
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Search Input Styling */
        .modern-search {
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid transparent;
          border-radius: 16px;
          padding: 12px 20px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          min-width: 150px;
          width: 40%;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .modern-search:focus {
          outline: none;
          border-color: #fff;
          box-shadow: 0 0 0 4px rgba(255,255,255,0.3);
          transform: scale(1.02);
        }

        .search-icon-wrapper {
          background: rgba(255,255,255,0.2);
          border-radius: 12px;
          padding: 10px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Date Filter Styling */
        .modern-date-filter {
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid transparent;
          border-radius: 16px;
          padding: 12px 16px;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .modern-date-filter:focus {
          outline: none;
          border-color: #fff;
          box-shadow: 0 0 0 4px rgba(255,255,255,0.3);
        }

        /* Client Counter Badge */
        .client-counter {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 6px 24px;
          color: white;
          font-weight: 600;
          border: 2px solid rgba(255,255,255,0.3);
          // animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        /* Add Button */
        .btn-add-modern {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          border: none;
          border-radius: 16px;
          padding: 14px 28px;
          color: white;
          font-weight: 700;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(17, 153, 142, 0.4);
          position: relative;
          overflow: hidden;
          z-index: 1;
        }

        .btn-add-modern::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transition: left 0.5s;
          z-index: -1;
        }

        .btn-add-modern:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(17, 153, 142, 0.6);
        }

        .btn-add-modern:hover::before {
          left: 100%;
        }

        .btn-add-modern:active {
          transform: translateY(-1px);
        }

        /* Table Styles */
        .modern-table-container {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 30px;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.5);
          animation: fadeInUp 0.8s ease-out;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .table-header-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
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
          from { 
            opacity: 0; 
            transform: translateX(-20px);
          }
          to { 
            opacity: 1; 
            transform: translateX(0);
          }
        }

        .table-row-modern:hover {
          background: rgba(102, 126, 234, 0.05) !important;
          transform: scale(1.01) translateX(5px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          z-index: 10;
          position: relative;
        }

        /* Action Buttons */
        .btn-action {
          border: none;
          border-radius: 12px;
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
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
        }

        .btn-edit {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          color: white;
        }

        .btn-delete {
          background: linear-gradient(135deg, #ff0844 0%, #ffb199 100%);
          color: white;
        }

        .btn-action:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        }

        .btn-action:active {
          transform: translateY(-1px) scale(1.02);
        }

        /* Category Badges */
        .badge-modern {
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.8rem;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }

        .badge-regular {
          background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%);
          color: #2d5016;
        }

        .badge-new {
          background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
          color: #7c4a03;
        }

        .badge-vip {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .badge-modern:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        /* Pagination */
        .pagination-modern .page-link {
          border: none;
          border-radius: 12px;
          margin: 0 4px;
          padding: 10px 16px;
          color: #667eea;
          font-weight: 600;
          transition: all 0.3s ease;
          background: rgba(102, 126, 234, 0.1);
        }

        .pagination-modern .page-link:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .pagination-modern .active .page-link {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        /* Modal Styles */
        .modal-header-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          padding: 24px;
        }

        .modal-content {
          border: none;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .form-control-modern {
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          background: rgba(255,255,255,0.8);
        }

        .form-control-modern:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
          background: white;
          transform: translateY(-1px);
        }

        /* Alert Animation */
        .alert-modern {
          border: none;
          border-radius: 16px;
          padding: 16px 24px;
          font-weight: 500;
          animation: slideInRight 0.5s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }

        /* Stats Cards Animation */
        .stat-card-enter {
          animation: cardFloat 0.8s ease-out forwards;
        }

        @keyframes cardFloat {
          0% { opacity: 0; transform: translateY(40px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Toggle Background Button */
        .bg-toggle {
          position: fixed;
          bottom: 30px;
          right: 30px;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          z-index: 1000;
          transition: all 0.3s ease;
        }

        .bg-toggle:hover {
          transform: scale(1.1) rotate(180deg);
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }

        /* ==== RESPONSIVE STYLES ==== */
        @media (max-width: 768px) {
          /* Main container padding */
          .modern-clients-container > div {
            padding: 15px !important;
          }

          /* Stats cards stack on mobile */
          .stat-card-enter {
            animation-delay: 0s !important;
          }

          /* Stats row - add top margin on mobile */
          .row.g-4.mb-4:first-of-type {
            margin-top: 16px !important;
          }
          
          .modern-table-container {
            padding: 20px 15px;
            overflow-x: auto;
          }
          
          .modern-table-container h4 {
            font-size: 1.2rem;
            margin-bottom: 1rem;
          }
          
          /* Control bar - vertical layout on mobile */
          .control-bar {
            flex-direction: column;
            align-items: stretch;
            padding: 20px;
            gap: 12px;
          }
          
          .control-bar .search-icon-wrapper {
            display: none;
          }
          
          .modern-search {
            width: 100%;
            min-width: auto;
          }
          
          .control-bar .d-flex.align-items-center.gap-2 {
            width: 100%;
            justify-content: space-between;
          }
          
          .client-counter {
            margin-left: 0 !important;
            margin-right: 0 !important;
            text-align: center;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 20px;
          }
          
          .client-counter div {
            font-size: 1.2rem;
          }
          
          .btn-add-modern {
            justify-content: center;
            width: 100%;
            padding: 12px;
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
          
          /* Visit cards in view modal */
          .visit-card {
            flex-direction: column;
          }
          
          .visit-card > div {
            grid-template-columns: 1fr !important;
          }
          
          /* Form rows in modals */
          .modal-body .row > [class*="col-"] {
            margin-bottom: 10px;
          }
          
          /* Stats cards */
          .glass-card .p-4 {
            padding: 20px !important;
          }
          
          .glass-card h3 {
            font-size: 1.8rem !important;
          }
          
          .glass-card .d-flex .d-flex {
            width: 45px;
            height: 45px;
          }
          
          /* Background toggle button position */
          .bg-toggle {
            bottom: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
          }
        }
        
        /* Tablet responsive (769px to 1024px) */
        @media (min-width: 769px) and (max-width: 1024px) {
          .modern-clients-container > div {
            padding: 20px !important;
          }
          
          /* Stats row - add top margin on tablet */
          .row.g-4.mb-4:first-of-type {
            margin-top: 20px !important;
          }
          
          .control-bar {
            gap: 15px;
            padding: 20px;
          }
          
          .modern-search {
            width: 35%;
          }
          
          .client-counter {
            margin-left: auto;
            margin-right: 10px;
          }
          
          .client-counter div {
            font-size: 1.3rem;
          }
          
          .btn-add-modern {
            padding: 12px 20px;
          }
          
          .modern-table-container {
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
        }
        
        /* Small desktop adjustments */
        @media (min-width: 1025px) and (max-width: 1366px) {
          .modern-search {
            width: 30%;
          }
          
          .table-header-gradient th {
            padding: 15px 12px !important;
          }
        }
        
        /* Extra small devices */
        @media (max-width: 480px) {
          .modern-table-container {
            padding: 15px 12px;
          }
          
          .control-bar {
            padding: 15px;
          }
          
          .btn-add-modern {
            font-size: 0.85rem;
          }
          
          .badge-modern {
            padding: 4px 10px;
            font-size: 0.7rem;
          }
          
          .glass-card h3 {
            font-size: 1.5rem !important;
          }
          
          .glass-card p {
            font-size: 0.8rem;
          }
          
          .glass-card small {
            font-size: 0.7rem;
          }
          
          .modal-header-gradient {
            padding: 12px 16px;
          }
          
          .form-control-modern {
            padding: 8px 12px;
            font-size: 0.85rem;
          }
        }
        
        /* Landscape mode on mobile */
        @media (max-width: 768px) and (orientation: landscape) {
          .modern-clients-container > div {
            padding: 10px !important;
          }
          
          .control-bar {
            gap: 10px;
          }
          
          .btn-add-modern {
            padding: 8px 16px;
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
      
      <div style={{ marginLeft: '0', padding: '30px', position: 'relative', zIndex: 1 }} className="fade-in">
        <Container fluid>
          {/* Alert */}
          {alert.show && (
            <Alert 
              variant={alert.type} 
              className="mb-4 alert-modern" 
              onClose={() => setAlert({ show: false })} 
              dismissible
              style={{
                background: alert.type === 'success' ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' : 
                           alert.type === 'danger' ? 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)' : '#667eea',
                color: 'white'
              }}
            >
              <div className="d-flex align-items-center gap-2">
                {alert.type === 'success' ? <Icons.Sparkles /> : null}
                {alert.message}
              </div>
            </Alert>
          )}

          {/* Stats Cards - responsive grid */}
          <Row className="g-4 mb-4">
            <Col xs={12} sm={6} lg={4} className="stat-card-enter" style={{ animationDelay: '0.1s' }}>
              <Card 
                className="glass-card h-100" 
                style={{ borderRadius: '24px', border: 'none', cursor: 'pointer' }}
                onClick={() => setTableView('thisMonth')}
              >
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p style={{ color: '#64748b', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>This Month Clients</p>
                      <h3 style={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 800, 
                        fontSize: '2.5rem',
                        margin: 0 
                      }}>{thisMonthClients}</h3>
                      <small style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '1.2rem' }}>↑</span> Active patients
                      </small>
                    </div>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: '0 10px 20px rgba(102, 126, 234, 0.3)'
                    }}>
                      <Icons.Calendar />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col xs={12} sm={6} lg={4} className="stat-card-enter" style={{ animationDelay: '0.2s' }}>
              <Card 
                className="glass-card h-100" 
                style={{ borderRadius: '24px', border: 'none', cursor: 'pointer' }}
                onClick={() => setTableView('all')}
              >
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p style={{ color: '#64748b', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Total Patients</p>
                      <h3 style={{ 
                        background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 800, 
                        fontSize: '2.5rem',
                        margin: 0 
                      }}>{clients.length}</h3>
                      <small style={{ color: '#64748b', fontWeight: 500 }}>All time registered</small>
                    </div>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: '0 10px 20px rgba(17, 153, 142, 0.3)'
                    }}>
                      <Icons.Users />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col xs={12} sm={6} lg={4} className="stat-card-enter" style={{ animationDelay: '0.3s' }}>
              <Card 
                className="glass-card h-100" 
                style={{ borderRadius: '24px', border: 'none', cursor: 'pointer' }}
                onClick={() => setTableView('pending')}
              >
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p style={{ color: '#64748b', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Pending Patients</p>
                      <h3 style={{ 
                        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 800, 
                        fontSize: '2.5rem',
                        margin: 0 
                      }}>{pendingCount}</h3>
                      <small style={{ color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '1.2rem' }}>₹</span> {pendingAmount}
                      </small>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Clients Table Section */}
          <div className="modern-table-container">
            <h4 className="mb-4" style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Icons.Users /> {tableView === 'thisMonth' ? 'This Month Clients' : tableView === 'pending' ? 'Pending Patients' : 'Clients Directory'}
            </h4>
            
            {/* Unified Control Bar */}
            <div className="control-bar mb-4">
              <div className="search-icon-wrapper">
                <Icons.Search />
              </div>
              
              <Form.Control 
                type="text"
                placeholder="Search by name, ID or mobile..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="modern-search"
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white' }}>
                <Icons.Filter />
                <Form.Control 
                  type="date" 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="modern-date-filter"
                />
              </div>

              <div className="client-counter" style={{ marginLeft: 'auto', marginRight: '20px' }}>
                <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>Total Patients</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{filteredClients.length}</div>
              </div>

              <button className="btn-add-modern" onClick={handleOpenAddModal}>
                <Icons.Plus /> Add Patients
              </button>
            </div>

            {/* Table - responsive wrapper */}
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead>
                  <tr className="table-header-gradient">
                    <th>Patient ID</th>
                    <th>Name</th>
                    <th>Age/Gender</th>
                    <th>Mobile</th>
                    <th>District</th>
                    <th>Category</th>
                    <th>Balance</th>
                    <th>Last Visit</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {viewDisplayedData.map((client, index) => (
                    <tr 
                      key={client.id} 
                      className="table-row-modern"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td style={{ fontWeight: 700, color: '#667eea', fontSize: '0.95rem' }}>
                        #{client.id}
                      </td>
                      <td style={{ fontWeight: 600, color: '#1e293b' }}>{client.name}</td>
                      <td style={{ color: '#64748b' }}>
                        <span style={{ fontWeight: 600, color: '#334155' }}>{client.age}</span>
                        <span style={{ margin: '0 6px', color: '#cbd5e1' }}>|</span>
                        <span style={{ 
                          padding: '4px 12px', 
                          borderRadius: '12px', 
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: client.gender === 'Male' ? '#dbeafe' : '#fce7f3',
                          color: client.gender === 'Male' ? '#1e40af' : '#be185d'
                        }}>
                          {client.gender}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500, color: '#475569' }}>{client.mobile}</td>
                      <td style={{ color: '#64748b' }}>{client.district}</td>
                      <td>
                        <span className={`badge-modern badge-${(client.category || 'Regular').toLowerCase()}`}>
                          {client.category}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: client.balance > 0 ? '#dc2626' : '#059669' }}>₹{client.balance || 0}</td>
                      <td style={{ fontWeight: 500, color: '#475569' }}>{client.lastVisit}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button className="btn-action btn-view" onClick={() => openViewModal(client)}>
                            <Icons.View />
                          </button>
                          <button className="btn-action btn-edit" onClick={() => openEditModal(client)}>
                            <Icons.Edit />
                          </button>
                          <button className="btn-action btn-delete" onClick={() => openDeleteModal(client)}>
                            <Icons.Delete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* Empty State */}
            {viewDisplayedData.length === 0 && (
              <div className="text-center py-5">
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
                <h5 style={{ color: '#64748b', fontWeight: 600 }}>No {tableView === 'thisMonth' ? 'clients' : tableView === 'pending' ? 'patients with outstanding balance' : 'clients'} found</h5>
                <p style={{ color: '#94a3b8' }}>Try adjusting your search or filter criteria</p>
              </div>
            )}

            {/* Pagination - responsive */}
            {tableView === 'all' && (
              <div className="d-flex justify-content-center justify-content-md-end mt-4">
                <Pagination className="pagination-modern">
                  <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                  <Pagination.Prev onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} />
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <Pagination.Item 
                      key={i+1} 
                      active={currentPage === i+1} 
                      onClick={() => setCurrentPage(i+1)}
                    >
                      {i+1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} />
                  <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                </Pagination>
              </div>
            )}
            
            {tableView === 'thisMonth' && (
              <div className="d-flex justify-content-center justify-content-md-end mt-4">
                <Pagination className="pagination-modern">
                  <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                  <Pagination.Prev onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} />
                  {Array.from({ length: viewTotalPages }).map((_, i) => (
                    <Pagination.Item 
                      key={i+1} 
                      active={currentPage === i+1} 
                      onClick={() => setCurrentPage(i+1)}
                    >
                      {i+1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next onClick={() => setCurrentPage(p => Math.min(viewTotalPages, p + 1))} disabled={currentPage === viewTotalPages} />
                  <Pagination.Last onClick={() => setCurrentPage(viewTotalPages)} disabled={currentPage === viewTotalPages} />
                </Pagination>
              </div>
            )}
            
            {tableView === 'pending' && viewData.length > 0 && (
              <div className="d-flex justify-content-center justify-content-md-end mt-4">
                <Pagination className="pagination-modern">
                  <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                  <Pagination.Prev onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} />
                  {Array.from({ length: viewTotalPages }).map((_, i) => (
                    <Pagination.Item 
                      key={i+1} 
                      active={currentPage === i+1} 
                      onClick={() => setCurrentPage(i+1)}
                    >
                      {i+1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next onClick={() => setCurrentPage(p => Math.min(viewTotalPages, p + 1))} disabled={currentPage === viewTotalPages} />
                  <Pagination.Last onClick={() => setCurrentPage(viewTotalPages)} disabled={currentPage === viewTotalPages} />
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

      {/* Add Client Modal - responsive */}
      <Modal show={showAddModal} onHide={() => { setShowAddModal(false); }} size="lg" centered backdrop="static">
        <Modal.Header closeButton className="modal-header-gradient text-white">
          <Modal.Title style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icons.Plus /> Add New Patient
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4" style={{ background: 'rgba(248, 249, 250, 0.8)' }}>
          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Patient ID</Form.Label>
                <Form.Control type="text" value={newClient.id} readOnly className="form-control-modern" style={{ background: '#e2e8f0', fontWeight: 700, color: '#667eea' }} />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Category</Form.Label>
                <Form.Select 
                  value={newClient.category}
                  onChange={(e) => setNewClient({...newClient, category: e.target.value})}
                  className="form-control-modern"
                >
                  <option>Regular</option>
                  <option>New</option>
                  <option>VIP</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Patient Name *</Form.Label>
                <Form.Control 
                  type="text" 
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  placeholder="Enter full name"
                  className="form-control-modern"
                />
              </Form.Group>
            </Col>
            <Col xs={6} md={3}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Age</Form.Label>
                <Form.Control 
                  type="number" 
                  value={newClient.age}
                  onChange={(e) => setNewClient({...newClient, age: e.target.value})}
                  placeholder="Age"
                  className="form-control-modern"
                />
              </Form.Group>
            </Col>
            <Col xs={6} md={3}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Gender</Form.Label>
                <Form.Select 
                  value={newClient.gender}
                  onChange={(e) => setNewClient({...newClient, gender: e.target.value})}
                  className="form-control-modern"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Mobile *</Form.Label>
                <Form.Control 
                  type="tel" 
                  value={newClient.mobile}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0,10);
                    setNewClient({...newClient, mobile: digits});
                  }}
                  placeholder="76xxxxx76"
                  className="form-control-modern"
                  maxLength={10}
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Email</Form.Label>
                <Form.Control 
                  type="email" 
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  placeholder="client@email.com"
                  className="form-control-modern"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Address</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={2}
                  value={newClient.address}
                  onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                  placeholder="Street address"
                  className="form-control-modern"
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>District</Form.Label>
                <div style={{ position: 'relative' }}>
                  <Form.Control 
                    type="text" 
                    value={newClient.district}
                    onChange={(e) => setNewClient(prev => ({...prev, district: e.target.value}))}
                    placeholder="Search or enter district"
                    className="form-control-modern"
                  />
                  {newClient.district ? (
                    <button
                      onClick={() => { setNewClient(prev => ({ ...prev, district: '' })); }}
                      aria-label="Clear district"
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '18px',
                        cursor: 'pointer',
                        color: '#64748b',
                        zIndex: 1100
                      }}
                    >
                      ×
                    </button>
                  ) : null}
                  {newClient.district && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 1000,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                      {tamilNaduDistricts
                        .filter(d => d.toLowerCase().includes(newClient.district.toLowerCase()))
                        .map(district => (
                          <div
                            key={`add-district-${district}`}
                            onClick={() => {
                              setNewClient(prev => ({...prev, district}));
                              setDistrictSearch('');
                            }}
                            style={{
                              padding: '10px 15px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f0f0f0',
                              transition: 'background 0.2s',
                              background: districtSearch.toLowerCase() === district.toLowerCase() ? '#f0f7ff' : 'white'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#f0f7ff'}
                            onMouseLeave={(e) => e.target.style.background = districtSearch.toLowerCase() === district.toLowerCase() ? '#f0f7ff' : 'white'}
                          >
                            {district}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </Form.Group>
            </Col>
          </Row>
          <hr style={{ borderColor: 'rgba(102, 126, 234, 0.2)', margin: '2rem 0' }} />
          <h6 className="mb-3" style={{ color: '#667eea', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icons.Calendar /> Medical Information
          </h6>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Past Medical History</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={newClient.pastMedicalHistory}
                  onChange={(e) => setNewClient({...newClient, pastMedicalHistory: e.target.value})}
                  placeholder="Enter past medical history (e.g., asthma, allergies, surgeries)"
                  className="form-control-modern"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer style={{ background: 'rgba(248, 249, 250, 0.8)', borderTop: '1px solid rgba(102, 126, 234, 0.1)' }}>
          <Button variant="light" onClick={() => { setShowAddModal(false); }} style={{ borderRadius: '12px', padding: '10px 24px', fontWeight: 600 }}>Cancel</Button>
          <button className="btn-add-modern" onClick={handleAddClient}>
            <Icons.Plus /> Save Patient
          </button>
        </Modal.Footer>
      </Modal>

      {/* Edit Client Modal */}
      <Modal show={showEditModal} onHide={() => { setShowEditModal(false); }} size="lg" centered backdrop="static">
        <Modal.Header closeButton className="modal-header-gradient text-white">
          <Modal.Title style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icons.Edit /> Edit Client
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4" style={{ background: 'rgba(248, 249, 250, 0.8)' }}>
          {selectedClient && (
            <Row>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Client ID</Form.Label>
                  <Form.Control type="text" value={selectedClient.id} readOnly className="form-control-modern" style={{ background: '#e2e8f0', fontWeight: 700, color: '#667eea' }} />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Category</Form.Label>
                  <Form.Select 
                    value={selectedClient.category}
                    onChange={(e) => setSelectedClient({...selectedClient, category: e.target.value})}
                    className="form-control-modern"
                  >
                    <option>Regular</option>
                    <option>New</option>
                    <option>VIP</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Client Name</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={selectedClient.name}
                    onChange={(e) => setSelectedClient({...selectedClient, name: e.target.value})}
                    className="form-control-modern"
                  />
                </Form.Group>
              </Col>
              <Col xs={6} md={3}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Age</Form.Label>
                  <Form.Control 
                    type="number" 
                    value={selectedClient.age}
                    onChange={(e) => setSelectedClient({...selectedClient, age: e.target.value})}
                    className="form-control-modern"
                  />
                </Form.Group>
              </Col>
              <Col xs={6} md={3}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Gender</Form.Label>
                  <Form.Select 
                    value={selectedClient.gender}
                    onChange={(e) => setSelectedClient({...selectedClient, gender: e.target.value})}
                    className="form-control-modern"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Mobile</Form.Label>
                  <Form.Control 
                    type="tel" 
                    value={selectedClient.mobile}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0,10);
                      setSelectedClient({...selectedClient, mobile: digits});
                    }}
                    className="form-control-modern"
                    maxLength={10}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Email</Form.Label>
                  <Form.Control 
                    type="email" 
                    value={selectedClient.email}
                    onChange={(e) => setSelectedClient({...selectedClient, email: e.target.value})}
                    className="form-control-modern"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Address</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={2}
                    value={selectedClient.address}
                    onChange={(e) => setSelectedClient({...selectedClient, address: e.target.value})}
                    className="form-control-modern"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>District</Form.Label>
                  <div style={{ position: 'relative' }}>
                      <Form.Control 
                        type="text" 
                        value={selectedClient?.district || ''}
                        onChange={(e) => setSelectedClient(prev => ({...prev, district: e.target.value}))}
                        placeholder="Search or enter district"
                        className="form-control-modern"
                      />
                      {selectedClient?.district ? (
                        <button
                          onClick={() => { setSelectedClient(prev => ({ ...prev, district: '' })); }}
                          aria-label="Clear district"
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            fontSize: '18px',
                            cursor: 'pointer',
                            color: '#64748b',
                            zIndex: 1100
                          }}
                        >
                          ×
                        </button>
                      ) : null}
                    {selectedClient?.district && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        zIndex: 1000,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}>
                        {tamilNaduDistricts
                          .filter(d => d.toLowerCase().includes((selectedClient?.district || '').toLowerCase()))
                          .map(district => (
                            <div
                              key={`edit-district-${district}`}
                              onClick={() => {
                                setSelectedClient(prev => ({...prev, district}));
                              }}
                              style={{
                                padding: '10px 15px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #f0f0f0',
                                transition: 'background 0.2s',
                                background: (selectedClient?.district || '').toLowerCase() === district.toLowerCase() ? '#f0f7ff' : 'white'
                              }}
                              onMouseEnter={(e) => e.target.style.background = '#f0f7ff'}
                              onMouseLeave={(e) => e.target.style.background = (selectedClient?.district || '').toLowerCase() === district.toLowerCase() ? '#f0f7ff' : 'white'}
                            >
                              {district}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Past Medical History</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={selectedClient.pastMedicalHistory || ''}
                    onChange={(e) => setSelectedClient({...selectedClient, pastMedicalHistory: e.target.value})}
                    className="form-control-modern"
                  />
                </Form.Group>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer style={{ background: 'rgba(248, 249, 250, 0.8)', borderTop: '1px solid rgba(102, 126, 234, 0.1)' }}>
          <Button variant="light" onClick={() => { setShowEditModal(false); setEditDistrictSearch(''); }} style={{ borderRadius: '12px', padding: '10px 24px', fontWeight: 600 }}>Cancel</Button>
          <button className="btn-add-modern" onClick={handleEditClient}>
            <Icons.Edit /> Update Client
          </button>
        </Modal.Footer>
      </Modal>

      {/* View Client Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
        <Modal.Header closeButton className="modal-header-gradient text-white">
          <Modal.Title style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icons.View /> Client Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4" style={{ background: 'rgba(248, 249, 250, 0.8)' }}>
          {selectedClient && (
            <div>
              <Row className="mb-4">
                <Col xs={12} md={6}>
                  <div className="p-4" style={{ 
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)', 
                    borderRadius: '20px',
                    border: '1px solid rgba(102, 126, 234, 0.2)'
                  }}>
                    <h6 className="mb-3" style={{ color: '#667eea', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Personal Information</h6>
                    <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '5px' }}>
                      <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Client ID:</span>
                      <span style={{ fontWeight: 700, color: '#1e293b' }}>#{selectedClient.id}</span>
                    </div>
                    <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '5px' }}>
                      <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Patient Name:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{selectedClient.name}</span>
                    </div>
                    <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '5px' }}>
                      <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Age:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{selectedClient.age} years</span>
                    </div>
                    <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '5px' }}>
                      <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Gender:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{selectedClient.gender}</span>
                    </div>
                    <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '5px' }}>
                      <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Balance:</span>
                      <span style={{ fontWeight: 600, color: selectedClient.balance > 0 ? '#dc2626' : '#059669' }}>₹{selectedClient.balance || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '5px' }}>
                      <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Category:</span>
                      <span className={`badge-modern badge-${(selectedClient.category || 'Regular').toLowerCase()}`}>
                        {selectedClient.category}
                      </span>
                    </div>
                  </div>
                </Col>
                <Col xs={12} md={6} className="mt-3 mt-md-0">
                  <div className="p-4" style={{ 
                    background: 'linear-gradient(135deg, rgba(149, 165, 166, 0.1) 0%, rgba(52, 73, 94, 0.1) 100%)', 
                    borderRadius: '20px',
                    border: '1px solid rgba(52, 73, 94, 0.2)'
                  }}>
                    <h6 className="mb-3" style={{ color: '#344a5e', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Contact Information</h6>
                    <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '5px' }}>
                      <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Mobile:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{selectedClient.mobile}</span>
                    </div>
                    <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '5px' }}>
                      <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Email:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{selectedClient.email}</span>
                    </div>
                    <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '5px' }}>
                      <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Address:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b', textAlign: 'right', maxWidth: '60%' }}>{selectedClient.address}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '5px' }}>
                      <span style={{ color: '#64748b', fontSize: '0.9rem' }}>District:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{selectedClient.district}</span>
                    </div>
                  </div>
                </Col>
              </Row>
              
              <Row>
                <Col md={12}>
                  <div className="p-4" style={{ 
                    background: 'linear-gradient(135deg, rgba(149, 165, 166, 0.1) 0%, rgba(52, 73, 94, 0.1) 100%)', 
                    borderRadius: '20px',
                    border: '1px solid rgba(52, 73, 94, 0.2)'
                  }}>
                    <h6 className="mb-3" style={{ color: '#344a5e', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Past Medical History</h6>
                    <div style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6' }}>
                      {selectedClient.pastMedicalHistory ? (
                        <div style={{ whiteSpace: 'pre-wrap' }}>{selectedClient.pastMedicalHistory}</div>
                      ) : (
                        <div style={{ color: '#cbd5e1', fontStyle: 'italic' }}>No past medical history recorded</div>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
              
              <Row>
                <Col md={12}>
                  <div style={{ marginTop: '12px' }}>
                    <h6 className="mb-3" style={{ color: '#0077b6', fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '2px solid #0077b6', paddingBottom: '10px' }}>📋 Visit History</h6>
                    {visitsToShow && visitsToShow.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {visitsToShow.map((v, idx) => (
                          <div key={`visit-${idx}-${v.date || v.id || idx}`} style={{
                            background: 'linear-gradient(135deg, rgba(0, 119, 182, 0.05) 0%, rgba(0, 180, 216, 0.05) 100%)',
                            border: '1px solid rgba(0, 119, 182, 0.2)',
                            borderLeft: '4px solid #0077b6',
                            borderRadius: '12px',
                            padding: '14px 16px',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 8px rgba(0, 119, 182, 0.08)',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 119, 182, 0.15)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 119, 182, 0.08)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                          >
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' }} className="visit-card">
                              <div>
                                <div style={{ marginBottom: '8px' }}>
                                  <div style={{ fontSize: '0.85rem', color: '#0077b6', fontWeight: 700, letterSpacing: '0.4px' }}>
                                    📅 Date: <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>{v.date}</span>
                                    <span style={{ marginLeft: '12px', fontSize: '0.85rem', color: '#0077b6', fontWeight: 700 }}>⏰ Time: <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>{v.time || '-'}</span></span>
                                  </div>
                                </div>

                                <div style={{ marginBottom: '8px' }}>
                                  <div style={{ fontSize: '0.85rem', color: '#0077b6', fontWeight: 700, letterSpacing: '0.4px' }}>🩺 Diagnosis: <span style={{ fontWeight: 700, color: '#475569', fontSize: '0.9rem' }}>{v.diagnosis || '-'}</span>
                                    {v.toothNumber ? <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: '#0f172a', background: 'rgba(0,0,0,0.04)', padding: '2px 8px', borderRadius: '8px' }}>Tooth {v.toothNumber}</span> : null}
                                  </div>
                                </div>

                                <div style={{ fontSize: '0.8rem', color: '#0077b6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>🔍 Problem</div>
                                <div style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '10px' }}>{v.problem || v.problemDescription || '—'}</div>
                                <div style={{ fontSize: '0.8rem', color: '#0077b6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', marginTop: '8px' }}>💊 Medicines</div>
                                <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '10px' }}>
                                  {Array.isArray(v.medicines) ? v.medicines.map(m => m.name || m).join(', ') : (v.medicines || v.medication || 'None')}
                                </div>
                                 {v.nextVisitDate && (
                                  <>
                                    <div style={{ fontSize: '0.8rem', color: '#0077b6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', marginTop: '8px' }}>📅 Next Visit</div>
                                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{v.nextVisitDate}</div>
                                  </>
                                )}
                              </div>
                              <div style={{ background: 'rgba(0, 119, 182, 0.08)', padding: '12px', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.8rem', color: '#0077b6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>✅ Treatment</div>
                                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem', marginBottom: '10px' }}>{v.treatment}</div>
                                
                                <div style={{ fontSize: '0.8rem', color: '#0077b6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', marginTop: '8px' }}>💰 Fee</div>
                                <div style={{ fontWeight: 700, color: '#059669', fontSize: '1.1rem' }}>₹{v.fee || '0'}</div>

                                {v.receivedAmount && (
                                  <>
                                    <div style={{ fontSize: '0.8rem', color: '#0077b6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', marginTop: '8px' }}>💵 Received</div>
                                    <div style={{ fontWeight: 700, color: '#059669', fontSize: '1rem' }}>₹{v.receivedAmount}</div>
                                  </>
                                )}

                                {v.balance && (
                                  <>
                                    <div style={{ fontSize: '0.8rem', color: '#0077b6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', marginTop: '8px' }}>⚖️ Balance</div>
                                    <div style={{ fontWeight: 700, color: v.balance > 0 ? '#dc2626' : '#059669', fontSize: '1rem' }}>₹{v.balance}</div>
                                  </>
                                )}

                               

                                
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '30px', color: '#cbd5e1' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📭</div>
                        <div style={{ fontStyle: 'italic' }}>No visits found for this patient.</div>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ background: 'rgba(248, 249, 250, 0.8)', borderTop: '1px solid rgba(102, 126, 234, 0.1)' }}>
          <Button variant="light" onClick={() => setShowViewModal(false)} style={{ borderRadius: '12px', padding: '10px 24px', fontWeight: 600 }}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)', color: 'white', border: 'none' }}>
          <Modal.Title style={{ fontWeight: 700, fontSize: '1.1rem' }}>⚠️ Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 text-center" style={{ background: 'rgba(248, 249, 250, 0.9)' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: 'white',
            fontSize: '2rem',
            boxShadow: '0 10px 20px rgba(255, 8, 68, 0.3)',
            animation: 'pulse 2s infinite'
          }}>
            <Icons.Delete />
          </div>
          <h5 style={{ color: '#1e293b', fontWeight: 700, marginBottom: '10px' }}>Are you sure?</h5>
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Do you really want to delete <strong style={{ color: '#ff0844' }}>{selectedClient?.name}</strong>? 
            <br />This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer className="justify-content-center pb-4" style={{ background: 'rgba(248, 249, 250, 0.9)', border: 'none' }}>
          <Button variant="light" onClick={() => setShowDeleteModal(false)} style={{ borderRadius: '12px', padding: '10px 24px', fontWeight: 600, border: '2px solid #e2e8f0' }}>Cancel</Button>
          <Button 
            onClick={handleDeleteClient}
            style={{ 
              background: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 24px',
              fontWeight: 600,
              boxShadow: '0 4px 15px rgba(255, 8, 68, 0.3)'
            }}
          >
            Delete Patient
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Clients;