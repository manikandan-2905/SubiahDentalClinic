import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Form,  Badge, 
  InputGroup,  Alert,  Container
} from 'react-bootstrap';
import Sidebar from './Sidebar';

const Prescription = () => {
  const [activeTab, setActiveTab] = useState('prescription');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [showBackgroundAnimation, setShowBackgroundAnimation] = useState(true);
  const [animatedRows, setAnimatedRows] = useState([]);

  // Treatment categories from the image
  const treatmentCategories = [
    { code: 'SF', name: 'Silver Filling', fee: 150 },
    { code: 'CF', name: 'Composite Filling', fee: 200 },
    { code: 'PFS', name: 'Pit / Fissure Sealant', fee: 100 },
    { code: 'RC', name: 'Root Canal', fee: 800 },
    { code: 'PU', name: 'Pulpotomy', fee: 300 },
    { code: 'Ex', name: 'Extraction', fee: 250 },
    { code: 'X', name: 'X-ray', fee: 50 },
    { code: 'SP', name: 'Scaling and Polishing', fee: 120 },
    { code: 'IM', name: 'Impaction', fee: 500 },
    { code: 'Gi', name: 'Gingivectomy', fee: 400 },
    { code: 'BL', name: 'Bleaching', fee: 300 },
    { code: 'P&C', name: 'Post and Core', fee: 600 },
    { code: 'MM', name: 'Miracle Mix', fee: 150 },
    { code: 'GI', name: 'Glass Ionomer', fee: 180 },
    { code: 'C', name: 'Crown', fee: 900 },
    { code: 'B', name: 'Bridge', fee: 1200 },
    { code: 'PD/CD', name: 'Dentures', fee: 1500 },
    { code: 'IMP', name: 'Implants', fee: 2500 },
    { code: 'O', name: 'Orthodontics', fee: 3000 },
    { code: 'RR', name: 'Regular Recall', fee: 80 },
    { code: 'V', name: 'Veneers', fee: 1000 },
  ];

  // Diagnosis categories from the image
  const diagnosisCategories = [
    { code: 'C', name: 'Caries' },
    { code: 'A/E', name: 'Abrasion / Erosion' },
    { code: 'F/A', name: 'Filled Amalgam' },
    { code: 'FC', name: 'Filled Composite' },
    { code: 'FO', name: 'Filled Others' },
    { code: 'PF', name: 'Deep pit / Fissure' },
    { code: 'FD', name: 'Filled & Decayed' },
    { code: 'FR', name: 'Fractured' },
    { code: 'R', name: 'Root pieces' },
    { code: 'M', name: 'Missing' },
    { code: 'Dia', name: 'Diastema' },
    { code: 'BG', name: 'Bleeding Gums' },
    { code: 'POP', name: 'Pain on Percussion' },
    { code: 'Pro', name: 'Existing Prosthesis' },
    { code: 'SW', name: 'Swelling' },
    { code: 'PC', name: 'Pericoronitis' },
    { code: 'NV', name: 'Non Vital Tooth' },
    { code: 'CA', name: 'Calculus' },
    { code: 'ST', name: 'Stains' },
  ];

  // Patients loaded from backend
  const [clients, setClients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const API_BASE = 'https://subiahdentalclinic.onrender.com';

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const res = await fetch(`https://subiahdentalclinic.onrender.com/api/patients`);
        const data = await res.json();
        if (Array.isArray(data)) {
          // map patientId -> id for compatibility with existing UI
          const mapped = data.map(p => ({ ...p, id: p.patientId }));
          setClients(mapped);
        } else {
          setClients([]);
        }
      } catch (err) {
        console.error('Failed to load patients', err);
        setClients([]);
      }
    };
    loadPatients();
  }, []);

  // Common medicines list
  const medicinesList = [
    { id: 1, name: 'T.zerodol sp ', category: 'Antibiotic' },
    { id: 2, name: 'T.moxikind cv 625mg ', category: 'Painkiller' },
    { id: 3, name: 'T.flagyl 400mg ', category: 'Painkiller' },
    { id: 4, name: 'T.chymoral forte ', category: 'Antibiotic' },
    { id: 5, name: 'T.ornidiazole ', category: 'Antibiotic' },
    { id: 6, name: 'T.ketorol DT', category: 'Antibiotic' },
    // { id: 7, name: 'Doxycycline 100mg', category: 'Antibiotic' },
    // { id: 8, name: 'Aspirin 300mg', category: 'Painkiller' },
    // { id: 9, name: 'Diclofenac 50mg', category: 'NSAID' },
    // { id: 10, name: 'Ketamine 10mg/mL', category: 'Local Anesthetic' },
  ];

  // Prescription form state
  const [prescription, setPrescription] = useState({
    diagnosis: '',
    treatment: '',
    problemDescription: '',
    toothNumber: '',
    fee: '',
    remarks: '',
    nextVisitDate: '',
    receivedAmount: '',
    balance: 0,
    selectedMedicines: [],
  });

  // Medicine search state
  const [medicineSearch, setMedicineSearch] = useState('');
  const [isPrinted, setIsPrinted] = useState(false);

  // Filter clients based on search
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.mobile.includes(searchTerm) ||
    client.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.visits.some(v => v.problem.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    // Animate table rows on mount
    const timer = setTimeout(() => {
      setAnimatedRows(treatmentCategories.map((_, i) => i));
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setSearchTerm(client.name);
    setShowSearchResults(false);
    // load prescriptions for this patient from backend
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/prescriptions/patient/${client.id}`);
        if (!res.ok) return setPrescriptions([]);
        const data = await res.json();
        // ensure newest first
        setPrescriptions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load prescriptions', err);
        setPrescriptions([]);
      }
    })();
    // Set balance from client
    setPrescription(prev => ({ ...prev, balance: client.balance || 0 }));
  };

  const handleTreatmentSelect = (treatment) => {
    setPrescription({
      ...prescription,
      treatment: treatment.name
    });
  };

  const handleDiagnosisSelect = (diagnosis) => {
    setPrescription({
      ...prescription,
      diagnosis: diagnosis.name
    });
  };

  const handleMedicineSelect = (medicine) => {
    const isAlreadySelected = prescription.selectedMedicines.some(m => m.id === medicine.id);
    if (isAlreadySelected) {
      setPrescription({
        ...prescription,
        selectedMedicines: prescription.selectedMedicines.filter(m => m.id !== medicine.id)
      });
    } else {
      setPrescription({
        ...prescription,
        selectedMedicines: [...prescription.selectedMedicines, medicine]
      });
    }
  };

  const filteredMedicines = medicinesList.filter(medicine =>
    medicine.name.toLowerCase().includes(medicineSearch.toLowerCase())
  );

  const handleSavePrescription = async () => {
    if (!selectedClient || !prescription.diagnosis) {
      setAlert({ show: true, message: 'Please select client and diagnosis', type: 'danger' });
      return;
    }

    const payload = {
      patientId: selectedClient.id || selectedClient.patientId,
      diagnosis: prescription.diagnosis,
      treatment: prescription.treatment || '',
      problemDescription: prescription.problemDescription,
      toothNumber: prescription.toothNumber,
      fee: Number(prescription.fee) || 0,
      remarks: prescription.remarks,
      nextVisitDate: prescription.nextVisitDate,
      receivedAmount: Number(prescription.receivedAmount) || 0,
      medicines: prescription.selectedMedicines
    };

    try {
      const res = await fetch(`${API_BASE}/api/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save prescription');
      }

      const data = await res.json();

      // update local selected client visits for immediate UI feedback
      const newVisit = data.visit || {
        date: new Date().toLocaleString(),
        diagnosis: payload.diagnosis || '',
        toothNumber: payload.toothNumber || '',
        problem: payload.problemDescription || payload.diagnosis,
        treatment: payload.treatment,
        medication: (payload.medicines || []).map(m => m.name).join(', '),
        fee: payload.fee || 0,
        nextVisitDate: payload.nextVisitDate,
        receivedAmount: payload.receivedAmount,
        balance: (payload.fee || 0) - (payload.receivedAmount || 0)
      };

      const updatedBalance = (selectedClient.balance || 0) + newVisit.balance;
      const updatedClient = { 
        ...selectedClient, 
        visits: [newVisit, ...(selectedClient.visits || [])],
        balance: updatedBalance
      };
      setSelectedClient(updatedClient);
      setClients(prev => prev.map(c => (c.id === selectedClient.id ? updatedClient : c)));
      // prepend to prescriptions list from server response if available
      if (data.prescription) {
        setPrescriptions(prev => [data.prescription, ...(Array.isArray(prev) ? prev : [])]);
      }
      // Attempt to print the saved prescription before clearing the form
      const printed = await handlePrint();
      if (printed) {
        setIsPrinted(true);
      }

      // clear form
      setPrescription({
        diagnosis: '',
        treatment: '',
        problemDescription: '',
        toothNumber: '',
        fee: '',
        remarks: '',
        nextVisitDate: '',
        receivedAmount: '',
        balance: updatedBalance,
        selectedMedicines: [],
      });
      setMedicineSearch('');

      setAlert({ show: true, message: 'Prescription saved successfully', type: 'success' });
      setTimeout(() => setAlert({ show: false }), 3000);
    } catch (err) {
      console.error('Save prescription error', err);
      setAlert({ show: true, message: err.message || 'Failed to save prescription', type: 'danger' });
      setTimeout(() => setAlert({ show: false }), 4000);
    }
  };

  const handlePrint = async (prescriptionData = null) => {
    const currentPrescription = prescriptionData || prescription;
    const currentClient = prescriptionData ? prescriptionData.patient : selectedClient;

    if (!currentClient) {
      setAlert({ show: true, message: 'Please select a patient to print', type: 'danger' });
      setTimeout(() => setAlert({ show: false }), 3000);
      return false;
    }

    const now = new Date();
    const dateTime = now.toLocaleString();
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${currentClient.name}</title>
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
          <div class="prescription-number">Rx-${currentClient.id}-${now.getTime()}</div>

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
                <td>${currentClient.name}</td>
                <td class="label">Patient ID:</td>
                <td>${currentClient.id}</td>
              </tr>
              <tr>
                <td class="label">Age / Gender:</td>
                <td>${currentClient.age} Years / ${currentClient.gender}</td>
                <td class="label">Mobile Number:</td>
                <td>${currentClient.mobile}</td>
              </tr>
            </table>
          </div>

          <!-- Prescription Details -->
          <div class="prescription-details">
            <div class="section-title">Clinical Details</div>
            <table class="info-table">
              <tr>
                <td class="label">Diagnosis:</td>
                <td colspan="3">${currentPrescription.diagnosis || 'Not Specified'}</td>
              </tr>
              <tr>
                <td class="label">Problem Description:</td>
                <td colspan="3">${currentPrescription.problemDescription || 'Not Specified'}</td>
              </tr>
              <tr>
                <td class="label">Tooth Number:</td>
                <td>${currentPrescription.toothNumber || 'Not Applicable'}</td>
                <td class="label">Treatment:</td>
                <td>${currentPrescription.treatment || 'Not Specified'}</td>
              </tr>
              <tr>
                <td class="label">Next Visit Date:</td>
                <td>${currentPrescription.nextVisitDate || 'As Advised'}</td>
                <td class="label">Remarks:</td>
                <td>${currentPrescription.remarks || 'None'}</td>
              </tr>
            </table>
          </div>

          <!-- Medicines Section -->
          <div class="medicines-section">
            <div class="section-title">Prescribed Medications</div>
            <div class="medicines-list">
              ${currentPrescription.selectedMedicines && currentPrescription.selectedMedicines.length > 0 ?
                currentPrescription.selectedMedicines.map((medicine, index) =>
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
                <td>₹${currentPrescription.balance || 0}</td>
                <td>₹${currentPrescription.fee || 0}</td>
                <td>₹${currentPrescription.receivedAmount || 0}</td>
                <td>₹${((currentPrescription.balance || 0) + ((Number(currentPrescription.fee) || 0) - (Number(currentPrescription.receivedAmount) || 0)))}</td>
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
      return false;
    }

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    try {
      printWindow.print();
      printWindow.close();
      if (!prescriptionData) setIsPrinted(true);
      return true;
    } catch (e) {
      // If printing fails for some reason, keep the print button available
      setAlert({ show: true, message: 'Printing failed', type: 'danger' });
      setTimeout(() => setAlert({ show: false }), 3000);
      try { printWindow.close(); } catch (_) {}
      return false;
    }
  };

  // Modern Icons
  const Icons = {
    Search: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>,
    User: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    Calendar: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
    Phone: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    Location: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
    Medical: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/><path d="m5 2 5 5"/><path d="M2 13h15"/><path d="M22 22v-7.5a1.5 1.5 0 0 0-1.5-1.5H16a1.5 1.5 0 0 0-1.5 1.5V22"/></svg>,
    Save: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
    Print: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>,
    Sparkles: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>,
    Stethoscope: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>,
    Clipboard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>,
    ChevronDown: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  };

  return (
    <div className="prescription-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        .prescription-container {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        /* Animated Background using user's gradient */
        .animated-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          background: linear-gradient(180deg, #0077b6 0%, #00b4d8 100%);
          background-size: 100% 200%;
          animation: gradientMove 8s ease infinite;
          opacity: 0.08;
        }

        @keyframes gradientMove {
          0% { background-position: 0% 0%; }
          50% { background-position: 0% 100%; }
          100% { background-position: 0% 0%; }
        }

        /* Glassmorphism Card */
        .glass-card {
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 8px 32px rgba(0, 119, 182, 0.15);
          border-radius: 24px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: slideUp 0.6s ease-out;
        }

        .glass-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 119, 182, 0.2);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Search Section */
        .search-section {
          background: linear-gradient(180deg, #0077b6 0%, #00b4d8 100%);
          border-radius: 24px;
          padding: 30px;
          box-shadow: 0 10px 40px rgba(0, 119, 182, 0.3);
          animation: slideDown 0.6s ease-out;
          position: relative;
          overflow: visible;
        }

        .search-section::before {
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

        /* Modern Search Input */
        .modern-search {
          background: rgba(255, 255, 255, 0.95);
          border: 3px solid transparent;
          border-radius: 16px;
          padding: 16px 24px;
          font-size: 1rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          position: relative;
          z-index: 10;
        }

        .modern-search:focus {
          outline: none;
          border-color: rgba(255,255,255,0.8);
          box-shadow: 0 0 0 4px rgba(255,255,255,0.3), 0 8px 30px rgba(0,0,0,0.15);
          transform: scale(1.02);
        }

        /* Search Results Dropdown */
        .search-results-modern {
          position: absolute;
          top: calc(100% + 10px);
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 119, 182, 0.25);
          z-index: 1000;
          maxHeight: 400px;
          overflow-y: auto;
          border: 1px solid rgba(0, 119, 182, 0.1);
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .search-result-item {
          padding: 20px;
          border-bottom: 1px solid rgba(0, 119, 182, 0.1);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .search-result-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 4px;
          background: linear-gradient(180deg, #0077b6 0%, #00b4d8 100%);
          transform: scaleY(0);
          transition: transform 0.3s ease;
        }

        .search-result-item:hover {
          background: rgba(0, 180, 216, 0.05);
          padding-left: 30px;
        }

        .search-result-item:hover::before {
          transform: scaleY(1);
        }

        /* Patient Info Card */
        .patient-avatar {
          width: 90px;
          height: 90px;
          background: linear-gradient(180deg, #0077b6 0%, #00b4d8 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 auto 20px;
          box-shadow: 0 10px 30px rgba(0, 119, 182, 0.4);
          animation: pulse 2s infinite;
          position: relative;
          overflow: hidden;
        }

        .patient-avatar::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 10px 30px rgba(0, 119, 182, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 15px 40px rgba(0, 119, 182, 0.5); }
        }

        /* Category Badge */
        .category-badge {
          padding: 8px 20px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.85rem;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }

        .category-badge:hover {
          transform: scale(1.1);
        }

        .badge-vip {
          background: linear-gradient(180deg, #0077b6 0%, #00b4d8 100%);
          color: white;
        }

        .badge-regular {
          background: linear-gradient(180deg, #10b981 0%, #34d399 100%);
          color: white;
        }

        .badge-new {
          background: linear-gradient(180deg, #f59e0b 0%, #fbbf24 100%);
          color: white;
        }

        /* Info Rows */
        .info-row-modern {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid rgba(0, 119, 182, 0.1);
          transition: all 0.3s ease;
        }

        .info-row-modern:hover {
          background: rgba(0, 180, 216, 0.03);
          margin: 0 -15px;
          padding-left: 15px;
          padding-right: 15px;
          border-radius: 10px;
        }

        .info-label {
          color: #64748b;
          font-size: 0.9rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .info-value {
          font-weight: 600;
          color: #1e293b;
          font-size: 0.95rem;
        }

        /* Visit History Items */
        .visit-item-modern {
          background: linear-gradient(135deg, rgba(0, 119, 182, 0.05) 0%, rgba(0, 180, 216, 0.05) 100%);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 15px;
          border-left: 4px solid #0077b6;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .visit-item-modern::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s;
        }

        .visit-item-modern:hover {
          transform: translateX(10px) scale(1.02);
          box-shadow: 0 10px 30px rgba(0, 119, 182, 0.15);
        }

        .visit-item-modern:hover::before {
          transform: translateX(100%);
        }

        /* Section Headers */
        .section-header-modern {
          background: linear-gradient(180deg, #0077b6 0%, #00b4d8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
          font-size: 1.1rem;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid rgba(0, 119, 182, 0.2);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Form Controls */
        .form-control-modern {
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          background: rgba(255,255,255,0.8);
        }

        .form-control-modern:focus {
          border-color: #0077b6;
          box-shadow: 0 0 0 4px rgba(0, 119, 182, 0.1);
          background: white;
          transform: translateY(-2px);
        }

        /* Dropdown Buttons */
        .dropdown-toggle-modern {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 16px;
          text-align: left;
          font-weight: 500;
          color: #475569;
          transition: all 0.3s ease;
          width: 100%;
        }

        .dropdown-toggle-modern:hover, .dropdown-toggle-modern:focus {
          border-color: #0077b6;
          box-shadow: 0 0 0 4px rgba(0, 119, 182, 0.1);
        }

        /* Treatment Table */
        .treatment-table-modern {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .treatment-table-modern thead {
          background: linear-gradient(180deg, #0077b6 0%, #00b4d8 100%);
          color: white;
        }

        .treatment-table-modern th {
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 16px;
          border: none;
        }

        .treatment-table-modern td {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(0, 119, 182, 0.1);
          transition: all 0.3s ease;
        }

        .treatment-table-modern tbody tr {
          cursor: pointer;
          opacity: 0;
          animation: rowSlideIn 0.5s ease forwards;
        }

        @keyframes rowSlideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .treatment-table-modern tbody tr:hover {
          background: rgba(0, 180, 216, 0.05);
          transform: scale(1.02);
        }

        /* Action Buttons */
        .btn-save-modern {
          background: linear-gradient(180deg, #0077b6 0%, #00b4d8 100%);
          border: none;
          border-radius: 12px;
          padding: 14px 28px;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 119, 182, 0.4);
          position: relative;
          overflow: hidden;
          flex: 1;
        }

        .btn-save-modern::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transition: left 0.5s;
        }

        .btn-save-modern:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 119, 182, 0.5);
        }

        .btn-save-modern:hover::before {
          left: 100%;
        }

        .btn-print-modern {
          background: linear-gradient(180deg, #10b981 0%, #34d399 100%);
          border: none;
          border-radius: 12px;
          padding: 14px 28px;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
        }

        .btn-print-modern:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.5);
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

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 80px 40px;
          animation: fadeIn 0.8s ease;
        }

        .empty-state-icon {
          width: 120px;
          height: 120px;
          background: linear-gradient(180deg, #0077b6 0%, #00b4d8 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 30px;
          color: white;
          font-size: 3rem;
          box-shadow: 0 20px 40px rgba(0, 119, 182, 0.3);
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
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

        /* Responsive Styles - Mobile First Approach */
        @media (max-width: 576px) {
          .prescription-container {
            overflow-x: auto;
          }
          
          .search-section {
            padding: 20px 15px;
            margin: 29px 12px 10px 12px !important;
            border-radius: 20px;
          }
          
          .modern-search {
            padding: 12px 16px;
            font-size: 0.9rem;
          }
          
          .glass-card {
            margin: 0 12px 20px 12px;
            border-radius: 20px;
          }
          
          .card-body {
            padding: 20px 16px !important;
          }
          
          .patient-avatar {
            width: 70px;
            height: 70px;
            font-size: 2rem;
          }
          
          .info-label, .info-value {
            font-size: 0.85rem;
          }
          
          .section-header-modern {
            font-size: 1rem;
            margin-bottom: 15px;
          }
          
          .visit-item-modern {
            padding: 15px;
            margin-bottom: 12px;
          }
          
          .btn-save-modern, .btn-print-modern {
            padding: 12px 20px;
            font-size: 0.9rem;
          }
          
          .bg-toggle {
            bottom: 20px;
            right: 20px;
            width: 48px;
            height: 48px;
          }
          
          .form-control-modern {
            font-size: 0.9rem;
            padding: 10px 14px;
          }
          
          .search-results-modern {
            max-height: 300px;
          }
          
          .search-result-item {
            padding: 15px;
          }
          
          .empty-state-icon {
            width: 80px;
            height: 80px;
            font-size: 2rem;
          }
          
          .empty-state h3 {
            font-size: 1.3rem;
          }
          
          .empty-state p {
            font-size: 0.9rem;
          }
        }

        /* Tablet Styles */
        @media (min-width: 577px) and (max-width: 992px) {
          .search-section {
            padding: 25px;
            margin: 20px 20px 15px 20px !important;
          }
          
          .glass-card {
            margin: 0 20px 25px 20px;
          }
          
          .patient-avatar {
            width: 80px;
            height: 80px;
            font-size: 2.2rem;
          }
          
          .visit-item-modern {
            padding: 18px;
          }
          
          .btn-save-modern, .btn-print-modern {
            padding: 12px 24px;
          }
        }

        /* Medium Devices (Tablets) */
        @media (min-width: 768px) and (max-width: 1024px) {
          .search-section {
            margin-top: 20px !important;
          }
        }

        /* Landscape Mode for Mobile */
        @media (max-width: 768px) and (orientation: landscape) {
          .visit-history-section {
            max-height: 400px;
          }
          
          .search-section {
            margin: 10px 12px !important;
          }
        }
        
        /* Small Mobile Devices */
        @media (max-width: 380px) {
          .search-section h5 {
            font-size: 1rem;
          }
          
          .btn-save-modern, .btn-print-modern {
            padding: 10px 16px;
            font-size: 0.85rem;
          }
          
          .info-row-modern {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
          }
          
          .info-value {
            width: 100%;
            text-align: left;
          }
        }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 119, 182, 0.1);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #0077b6 0%, #00b4d8 100%);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #005a8a 0%, #0090b0 100%);
        }
      `}</style>

      {/* Optional Animated Background */}
      {showBackgroundAnimation && <div className="animated-bg" />}
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div style={{ marginLeft: '0', padding: '15px 0 30px 0', position: 'relative', zIndex: 1 }}>
        <Container fluid>
          {/* Alert */}
          {alert.show && (
            <Alert 
              variant={alert.type} 
              className="mb-4 alert-modern" 
              onClose={() => setAlert({ show: false })} 
              dismissible
              style={{
                margin: '0 12px 20px 12px',
                background: alert.type === 'success' ? 'linear-gradient(180deg, #0077b6 0%, #00b4d8 100%)' : 
                           alert.type === 'danger' ? 'linear-gradient(180deg, #dc3545 0%, #ff6b6b 100%)' : '#0077b6',
                color: 'white'
              }}
            >
              <div className="d-flex align-items-center gap-2">
                {alert.type === 'success' ? <Icons.Sparkles /> : null}
                {alert.message}
              </div>
            </Alert>
          )}

          {/* Client Search Section */}
          <div className="search-section mb-4">
            <h5 style={{ color: 'white', fontWeight: 700, marginBottom: '20px', fontSize: 'clamp(1rem, 5vw, 1.3rem)', position: 'relative', zIndex: 10 }}>
              <Icons.Stethoscope /> Select Patient
            </h5>
            <div style={{ position: 'relative' }}>
              <InputGroup size="lg">
                <InputGroup.Text style={{ background: 'white', border: 'none', padding: '0 15px', borderRadius: '16px 0 0 16px' }}>
                  <Icons.Search />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by name, client ID, problem, category or mobile number..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSearchResults(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowSearchResults(searchTerm.length > 0)}
                  className="modern-search"
                  style={{ borderRadius: '0 16px 16px 0' }}
                />
              </InputGroup>
              
              {/* Search Results Dropdown */}
              {showSearchResults && filteredClients.length > 0 && (
                <div className="search-results-modern">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className="search-result-item"
                      onClick={() => handleClientSelect(client)}
                    >
                      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                        <div className="flex-grow-1">
                          <div style={{ fontWeight: 700, color: '#0077b6', fontSize: 'clamp(0.9rem, 4vw, 1.1rem)' }}>{client.name}</div>
                          <small style={{ color: '#64748b', fontWeight: 500, display: 'block', marginTop: '4px' }}>{client.id} • {client.mobile}</small>
                        </div>
                        <div className="text-md-end">
                          <span className={`category-badge badge-${client.category.toLowerCase()}`}>
                            {client.category}
                          </span>
                          {client.visits && client.visits[0] && (
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px', fontWeight: 500 }}>
                              Last: {client.visits[0]?.date}
                            </div>
                          )}
                        </div>
                      </div>
                      {client.visits && client.visits[0] && (
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px', fontWeight: 500 }}>
                          <span style={{ color: '#0077b6' }}>Problem:</span> {client.visits[0]?.problem}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Two Columns */}
          {selectedClient && (
            <Row className="g-3 g-md-4 mx-0">
              {/* Left Side - Client Details */}
              <Col xs={12} lg={5} className="mb-4 px-2 px-sm-3">
                <Card className="glass-card h-100" style={{ border: 'none' }}>
                  <Card.Body className="p-3 p-md-4">
                    <div className="section-header-modern">
                      <Icons.User /> Patient Information
                    </div>
                    
                    <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                      <div className="patient-avatar">
                        {selectedClient.name.charAt(0)}
                      </div>
                      <h4 style={{ margin: 0, color: '#1e293b', fontWeight: 700, fontSize: 'clamp(1.2rem, 5vw, 1.5rem)' }}>
                        {selectedClient.name}
                      </h4>
                      <span className={`category-badge badge-${selectedClient.category.toLowerCase()} mt-3 d-inline-block`}>
                        {selectedClient.category}
                      </span>
                    </div>

                    <div className="info-row-modern">
                      <span className="info-label">Client ID</span>
                      <span className="info-value" style={{ color: '#0077b6', fontWeight: 700 }}>{selectedClient.id}</span>
                    </div>
                    <div className="info-row-modern">
                      <span className="info-label">Age / Gender</span>
                      <span className="info-value">
                        {selectedClient.age} years 
                        <span style={{ margin: '0 8px', color: '#cbd5e1' }}>•</span>
                        <span style={{ 
                          padding: '4px 12px', 
                          borderRadius: '12px', 
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          background: selectedClient.gender === 'Male' ? '#dbeafe' : '#fce7f3',
                          color: selectedClient.gender === 'Male' ? '#1e40af' : '#be185d'
                        }}>
                          {selectedClient.gender}
                        </span>
                      </span>
                    </div>
                    <div className="info-row-modern">
                      <span className="info-label"><Icons.Phone /> Mobile</span>
                      <span className="info-value">{selectedClient.mobile}</span>
                    </div>
                    <div className="info-row-modern" style={{ borderBottom: 'none' }}>
                      <span className="info-label"><Icons.Location /> Address</span>
                      <span className="info-value" style={{ textAlign: 'right', maxWidth: '60%' }}>{selectedClient.address}</span>
                    </div>

                    {/* Past Medical History Section */}
                    <div className="section-header-modern" style={{ marginTop: '30px' }}>
                      <Icons.Medical /> Past Medical History
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(0, 119, 182, 0.08) 0%, rgba(0, 180, 216, 0.08) 100%)',
                      border: '1px solid rgba(0, 119, 182, 0.2)',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      marginBottom: '20px',
                      fontSize: '0.9rem',
                      color: '#475569',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word'
                    }}>
                      {selectedClient.pastMedicalHistory || 'No past medical history recorded'}
                    </div>

                    {/* Visit History Section - Scrollable */}
                    <div className="section-header-modern" style={{ marginTop: '30px', marginBottom: '12px' }}>
                      <Icons.Calendar /> Visit History
                    </div>
                    <div className="visit-history-section" style={{
                      maxHeight: '650px',
                      overflowY: 'auto',
                      borderRadius: '12px',
                      paddingRight: '5px',
                      scrollBehavior: 'smooth'
                    }}>
                      {prescriptions && prescriptions.length > 0 ? (
                        prescriptions.map((p, index) => {
                          const visit = {
                            date: p.createdAt ? new Date(p.createdAt).toLocaleString() : p.date || '',
                            diagnosis: p.diagnosis || '',
                            toothNumber: p.toothNumber || '',
                            problem: p.problemDescription || '',
                            medicines: Array.isArray(p.medicines) ? p.medicines.map(m => m.name).join(', ') : (p.medicines || p.medication || ''),
                            fee: p.fee || 0,
                            receivedAmount: p.receivedAmount || 0,
                            balance: p.balance || ((p.fee || 0) - (p.receivedAmount || 0)),
                            nextVisitDate: p.nextVisitDate || ''
                          };
                          return (
                            <div key={index} className="visit-item-modern" style={{ animationDelay: `${index * 0.1}s`, marginBottom: '12px' }}>
                              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start gap-3">
                                <div className="flex-grow-1">
                                  <div style={{ fontWeight: 700, color: '#0077b6', fontSize: '0.95rem', marginBottom: '8px' }}>
                                    {visit.date}
                                  </div>
                                  <div style={{ fontSize: '0.9rem', marginBottom: '6px', color: '#1e293b', fontWeight: 700 }}>
                                    <span style={{ color: '#0060e7' }}>Diagnosis:</span> {visit.diagnosis || 'N/A'}
                                    {visit.toothNumber ? (
                                      <span style={{ marginLeft: '10px', fontWeight: 600, color: '#0062ff' }}>Tooth: {visit.toothNumber}</span>
                                    ) : null}
                                  </div>
                                  <div style={{ fontSize: '0.9rem', marginBottom: '6px', color: '#1e293b', fontWeight: 500 }}>
                                    <span style={{ color: '#006aff' }}>Problem:</span> {visit.problem || 'N/A'}
                                  </div>
                                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px' }}>
                                    <span style={{ color: '#0077b6' }}>Medicines:</span> {visit.medicines || 'None'}
                                  </div>
                                  {visit.nextVisitDate ? (
                                    <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '6px' }}>
                                      <span style={{ color: '#0077b6' }}>Next Visit:</span> {visit.nextVisitDate}
                                    </div>
                                  ) : null}
                                </div>
                                <div className="d-flex flex-row flex-sm-column gap-2 align-items-center justify-content-start">
                                  <div style={{ background: 'linear-gradient(180deg, #0077b6 0%, #00b4d8 100%)', color: 'white', borderRadius: '16px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center', minWidth: '80px' }}>
                                    ₹{visit.fee}
                                  </div>
                                  <div style={{ background: 'linear-gradient(180deg, #16a34a 0%, #22c55e 100%)', color: 'white', borderRadius: '16px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center', minWidth: '80px' }}>
                                    ₹{visit.receivedAmount}
                                  </div>
                                  <div style={{ background: 'linear-gradient(180deg, #dc2626 0%, #ef4444 100%)', color: 'white', borderRadius: '16px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center', minWidth: '80px' }}>
                                    ₹{visit.balance}
                                  </div>
                                  <button 
                                    onClick={() => handlePrint({
                                      diagnosis: p.diagnosis || '',
                                      treatment: p.treatment || '',
                                      problemDescription: p.problemDescription || '',
                                      toothNumber: p.toothNumber || '',
                                      fee: p.fee || 0,
                                      remarks: p.remarks || '',
                                      nextVisitDate: p.nextVisitDate || '',
                                      receivedAmount: p.receivedAmount || 0,
                                      balance: p.balance || 0,
                                      selectedMedicines: Array.isArray(p.medicines) ? p.medicines : [],
                                      patient: selectedClient,
                                      createdAt: p.createdAt
                                    })}
                                    style={{
                                      background: 'linear-gradient(180deg, #10b981 0%, #34d399 100%)',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '16px',
                                      padding: '6px 12px',
                                      fontSize: '0.8rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      minWidth: '60px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '4px'
                                    }}
                                    title="Print Prescription"
                                  >
                                    <Icons.Print style={{ width: '12px', height: '12px' }} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : selectedClient.visits && selectedClient.visits.length > 0 ? (
                        selectedClient.visits.map((visit, index) => {
                          const visitData = {
                            ...visit,
                            medicines: visit.medicines || visit.medication || '',
                            fee: visit.fee || 0,
                            receivedAmount: visit.receivedAmount || 0,
                            balance: visit.balance || ((visit.fee || 0) - (visit.receivedAmount || 0)),
                            nextVisitDate: visit.nextVisitDate || ''
                          };
                          return (
                            <div key={index} className="visit-item-modern" style={{ animationDelay: `${index * 0.1}s`, marginBottom: '12px' }}>
                              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start gap-3">
                                <div className="flex-grow-1">
                                  <div style={{ fontWeight: 700, color: '#0077b6', fontSize: '0.95rem', marginBottom: '8px' }}>
                                    {visitData.date}
                                  </div>
                                  <div style={{ fontSize: '0.9rem', marginBottom: '6px', color: '#1e293b', fontWeight: 700 }}>
                                    <span style={{ color: '#0077b6' }}>Diagnosis:</span> {visitData.diagnosis || 'N/A'}
                                    {visitData.toothNumber ? (
                                      <span style={{ marginLeft: '10px', fontWeight: 600, color: '#1e293b' }}>Tooth: {visitData.toothNumber}</span>
                                    ) : null}
                                  </div>
                                  <div style={{ fontSize: '0.9rem', marginBottom: '6px', color: '#1e293b', fontWeight: 500 }}>
                                    <span style={{ color: '#0077b6' }}>Problem:</span> {visitData.problem || 'N/A'}
                                  </div>
                                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px' }}>
                                    <span style={{ color: '#0077b6' }}>Medicines:</span> {visitData.medicines || 'None'}
                                  </div>
                                  {visitData.nextVisitDate ? (
                                    <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '6px' }}>
                                      <span style={{ color: '#0077b6' }}>Next Visit:</span> {visitData.nextVisitDate}
                                    </div>
                                  ) : null}
                                </div>
                                <div className="d-flex flex-row flex-sm-column gap-2 align-items-center justify-content-start">
                                  <div style={{ background: 'linear-gradient(180deg, #0077b6 0%, #00b4d8 100%)', color: 'white', borderRadius: '16px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center', minWidth: '80px' }}>
                                    ₹{visitData.fee}
                                  </div>
                                  <div style={{ background: 'linear-gradient(180deg, #16a34a 0%, #22c55e 100%)', color: 'white', borderRadius: '16px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center', minWidth: '80px' }}>
                                    ₹{visitData.receivedAmount}
                                  </div>
                                  <div style={{ background: 'linear-gradient(180deg, #dc2626 0%, #ef4444 100%)', color: 'white', borderRadius: '16px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center', minWidth: '80px' }}>
                                    ₹{visitData.balance}
                                  </div>
                                  <button 
                                    onClick={() => handlePrint({
                                      diagnosis: visitData.diagnosis || '',
                                      treatment: visitData.treatment || '',
                                      problemDescription: visitData.problem || '',
                                      toothNumber: visitData.toothNumber || '',
                                      fee: visitData.fee || 0,
                                      remarks: visitData.remarks || '',
                                      nextVisitDate: visitData.nextVisitDate || '',
                                      receivedAmount: visitData.receivedAmount || 0,
                                      balance: visitData.balance || 0,
                                      selectedMedicines: visitData.medicines ? visitData.medicines.split(',').map(name => ({ name: name.trim(), category: 'General' })) : [],
                                      patient: selectedClient,
                                      createdAt: visitData.date
                                    })}
                                    style={{
                                      background: 'linear-gradient(180deg, #10b981 0%, #34d399 100%)',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '16px',
                                      padding: '6px 12px',
                                      fontSize: '0.8rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      minWidth: '60px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '4px'
                                    }}
                                    title="Print Prescription"
                                  >
                                    <Icons.Print style={{ width: '12px', height: '12px' }} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ textAlign: 'center', padding: '20px 10px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                          No visit history available
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Right Side - Prescription Form */}
              <Col xs={12} lg={7} className="px-2 px-sm-3">
                <Card className="glass-card h-100" style={{ border: 'none' }}>
                  <Card.Body className="p-3 p-md-4">
                    <div className="section-header-modern">
                      <Icons.Medical /> New Prescription / Treatment
                    </div>

                    {/* Diagnosis Selection */}
                    <Form.Group className="mb-4">
                      <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.95rem', marginBottom: '10px' }}>Diagnosis</Form.Label>
                      <Form.Select
                        value={prescription.diagnosis}
                        onChange={(e) => {
                          const selected = diagnosisCategories.find(d => d.name === e.target.value);
                          if (selected) handleDiagnosisSelect(selected);
                        }}
                        style={{
                          borderRadius: '12px',
                          border: '2px solid #e2e8f0',
                          padding: '12px 16px',
                          fontSize: '0.95rem',
                          fontWeight: 500,
                          color: prescription.diagnosis ? '#0077b6' : '#94a3b8',
                          background: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="">Select Diagnosis</option>
                        {diagnosisCategories.map((diag) => (
                          <option key={diag.code} value={diag.name}>
                            {diag.code} - {diag.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    {/* Selected Medicines Display */}
                    {prescription.selectedMedicines.length > 0 && (
                      <div className="mb-4" style={{
                        background: 'linear-gradient(135deg, rgba(0, 119, 182, 0.08) 0%, rgba(0, 180, 216, 0.08) 100%)',
                        border: '2px solid #0077b6',
                        borderRadius: '12px',
                        padding: '12px',
                      }}>
                        <div style={{ fontWeight: 600, color: '#0077b6', marginBottom: '8px', fontSize: '0.9rem' }}>Selected Medicines:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {prescription.selectedMedicines.map((medicine) => (
                            <Badge
                              key={medicine.id}
                              style={{
                                background: 'white',
                                color: '#ffffff',
                                border: '2px solid #0077b6',
                                padding: '6px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer',
                                borderRadius: '20px',
                                fontWeight: 700
                              }}
                              onClick={() => handleMedicineSelect(medicine)}
                            >
                              {medicine.name}
                              <span style={{ marginLeft: '4px', fontSize: '1rem' }}>×</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Problem Description */}
                    <Form.Group className="mb-4">
                      <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.95rem', marginBottom: '10px' }}>Problem Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Describe the dental problem in detail..."
                        value={prescription.problemDescription}
                        onChange={(e) => setPrescription({...prescription, problemDescription: e.target.value})}
                        className="form-control-modern"
                      />
                    </Form.Group>

                    <Row className="g-3">
                      <Col xs={12} sm={6}>
                        <Form.Group className="mb-4">
                          <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.95rem', marginBottom: '10px' }}>Tooth Number</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="e.g., 16, 17, 36"
                            value={prescription.toothNumber}
                            onChange={(e) => setPrescription({...prescription, toothNumber: e.target.value})}
                            className="form-control-modern"
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} sm={6}>
                        <Form.Group className="mb-4">
                          <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.95rem', marginBottom: '10px' }}>Fee ($)</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="0.00"
                            value={prescription.fee || ''}
                            onChange={(e) => setPrescription({...prescription, fee: e.target.value})}
                            className="form-control-modern"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    {/* Medicine Search and Selection */}
                    <Form.Group className="mb-4">
                      <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.95rem', marginBottom: '10px' }}>Select Medicines</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Search medicines..."
                        value={medicineSearch}
                        onChange={(e) => setMedicineSearch(e.target.value)}
                        className="form-control-modern"
                        style={{
                          borderRadius: '12px',
                          border: '2px solid #e2e8f0',
                          padding: '12px 16px',
                          marginBottom: '12px'
                        }}
                      />
                      <div style={{
                        background: 'white',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        padding: '8px',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                      }}>
                        {filteredMedicines.length > 0 ? (
                          filteredMedicines.map((medicine) => (
                            <div
                              key={medicine.id}
                              onClick={() => handleMedicineSelect(medicine)}
                              style={{
                                padding: '10px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                background: prescription.selectedMedicines.some(m => m.id === medicine.id) ? '#dbeafe' : 'transparent',
                                border: prescription.selectedMedicines.some(m => m.id === medicine.id) ? '2px solid #0077b6' : 'none',
                                marginBottom: '4px',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                              onMouseEnter={(e) => {
                                if (!prescription.selectedMedicines.some(m => m.id === medicine.id)) {
                                  e.target.style.background = '#f0f7ff';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!prescription.selectedMedicines.some(m => m.id === medicine.id)) {
                                  e.target.style.background = 'transparent';
                                }
                              }}
                            >
                              <div>
                                <div style={{ fontWeight: 600, color: '#1e293b' }}>{medicine.name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{medicine.category}</div>
                              </div>
                              <input
                                type="checkbox"
                                checked={prescription.selectedMedicines.some(m => m.id === medicine.id)}
                                readOnly
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                              />
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>
                            {medicineSearch ? 'No medicines found' : 'Type to search medicines'}
                          </div>
                        )}
                      </div>
                    </Form.Group>

                    {/* Next Visit Date */}
                    <Form.Group className="mb-4">
                      <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.95rem', marginBottom: '10px' }}>Next Visit Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={prescription.nextVisitDate}
                        onChange={(e) => setPrescription({...prescription, nextVisitDate: e.target.value})}
                        className="form-control-modern"
                      />
                    </Form.Group>

                    {/* Payment Section */}
                    <div className="mb-4" style={{
                      background: 'linear-gradient(135deg, rgba(0, 119, 182, 0.08) 0%, rgba(0, 180, 216, 0.08) 100%)',
                      border: '2px solid #0077b6',
                      borderRadius: '12px',
                      padding: '16px',
                    }}>
                      <h6 style={{ color: '#0077b6', fontWeight: 700, marginBottom: '12px' }}>💰 Payment Details</h6>
                      <Row className="g-3">
                        <Col xs={12} sm={4}>
                          <Form.Group>
                            <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Old Balance</Form.Label>
                            <Form.Control
                              type="number"
                              value={prescription.balance || 0}
                              readOnly
                              className="form-control-modern"
                              style={{ background: '#f8f9fa' }}
                            />
                          </Form.Group>
                        </Col>
                        
                        <Col xs={12} sm={4}>
                          <Form.Group>
                            <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Received Amount</Form.Label>
                            <Form.Control
                              type="number"
                              placeholder="0.00"
                              value={prescription.receivedAmount}
                              onChange={(e) => setPrescription({...prescription, receivedAmount: e.target.value})}
                              className="form-control-modern"
                            />
                          </Form.Group>
                        </Col>
                        <Col xs={12} sm={4}>
                          <Form.Group>
                            <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>New Balance</Form.Label>
                            <Form.Control
                              type="number"
                              value={(prescription.balance || 0) + ((Number(prescription.fee) || 0) - (Number(prescription.receivedAmount) || 0))}
                              readOnly
                              className="form-control-modern"
                              style={{ background: '#f8f9fa', fontWeight: 600, color: (prescription.balance || 0) + ((Number(prescription.fee) || 0) - (Number(prescription.receivedAmount) || 0)) > 0 ? '#dc3545' : '#28a745' }}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>

                    <Form.Group className="mb-4">
                      <Form.Label style={{ fontWeight: 600, color: '#475569', fontSize: '0.95rem', marginBottom: '10px' }}>Remarks / Notes</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Additional notes..."
                        value={prescription.remarks}
                        onChange={(e) => setPrescription({...prescription, remarks: e.target.value})}
                        className="form-control-modern"
                      />
                    </Form.Group>

                    {/* Action Buttons */}
                    <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
                      <button className="btn-save-modern" onClick={handleSavePrescription}>
                        <Icons.Save /> Save Prescription
                      </button>
                      {!isPrinted && (
                        <button className="btn-print-modern" onClick={handlePrint}>
                          <Icons.Print /> Print
                        </button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {!selectedClient && (
            <Card className="glass-card empty-state mx-3" style={{ border: 'none' }}>
              <div className="empty-state-icon">
                <Icons.Search />
              </div>
              <h3 style={{ color: '#1e293b', fontWeight: 700, marginBottom: '15px', fontSize: 'clamp(1.2rem, 6vw, 1.8rem)' }}>Search for a Patient</h3>
              <p style={{ color: '#64748b', fontSize: 'clamp(0.9rem, 4vw, 1.1rem)', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
                Type in the search box above to find patients by name, ID, mobile, or problem to create a new prescription
              </p>
            </Card>
          )}
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
    </div>
  );
};

export default Prescription;
