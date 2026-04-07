const express = require('express');
const router = express.Router();
const Prescription = require('../models/prescription');
const Patient = require('../models/patient');

// POST /api/prescriptions - create new prescription and attach as a visit to patient
router.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    const { patientId } = body;
    if (!patientId) return res.status(400).json({ error: 'patientId is required' });

    // Find patient by patientId
    const patient = await Patient.findOne({ patientId });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    // Create prescription document (sanitize medicines to avoid _id casting issues)
    const medicines = Array.isArray(body.medicines)
      ? body.medicines.map(m => ({ name: m.name || m.label || '', category: m.category || '' }))
      : [];

    // generate sequential bill number like BILL-0001
    let nextBillNum = 1;
    try {
      const last = await Prescription.findOne().sort({ createdAt: -1 }).select('billNo');
      if (last && last.billNo) {
        const m = last.billNo.match(/BILL-(\d+)/);
        if (m) nextBillNum = parseInt(m[1], 10) + 1;
      }
    } catch (e) {
      console.warn('Could not compute next bill number, defaulting to 1', e);
    }
    const billNo = `BILL-${String(nextBillNum).padStart(4, '0')}`;

<<<<<<< HEAD
    const fee = body.fee || 0;
    const receivedAmount = body.receivedAmount || 0;
    const balance = fee - receivedAmount;

=======
>>>>>>> a3abea51565cabad0d2f07e250f0931d98fc4613
    const prescription = new Prescription({
      billNo,
      patient: patient._id,
      patientId,
      diagnosis: body.diagnosis,
      treatment: body.treatment,
      problemDescription: body.problemDescription,
      toothNumber: body.toothNumber,
<<<<<<< HEAD
      fee,
      remarks: body.remarks,
      nextVisitDate: body.nextVisitDate,
      receivedAmount,
      balance,
=======
      fee: body.fee || 0,
      remarks: body.remarks,
>>>>>>> a3abea51565cabad0d2f07e250f0931d98fc4613
      medicines,
    });

    await prescription.save();

<<<<<<< HEAD
    // Update patient's balance (add the new balance to existing)
    patient.balance = (patient.balance || 0) + balance;
    await patient.save();

=======
>>>>>>> a3abea51565cabad0d2f07e250f0931d98fc4613
    // Also append a visit record to patient.visits for quick history
    const visit = {
      date: new Date().toLocaleString(),
      billNo,
      diagnosis: body.diagnosis || '',
      toothNumber: body.toothNumber || '',
      problem: body.problemDescription || body.diagnosis || '',
      // store medicines as comma-separated names for visit history display
      medicines: (Array.isArray(body.medicines) ? body.medicines.map(m => m.name).join(', ') : ''),
<<<<<<< HEAD
      fee,
      nextVisitDate: body.nextVisitDate,
      receivedAmount,
      balance
=======
      fee: body.fee || 0
>>>>>>> a3abea51565cabad0d2f07e250f0931d98fc4613
    };

    patient.visits.unshift(visit);
    await patient.save();

    res.status(201).json({ prescription, visit });
  } catch (err) {
    console.error('Failed to save prescription', err);
    res.status(500).json({ error: err.message });
  }
});

<<<<<<< HEAD
// GET /api/prescriptions - list all prescriptions
router.get('/', async (req, res) => {
  try {
    const items = await Prescription.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

=======
>>>>>>> a3abea51565cabad0d2f07e250f0931d98fc4613
// GET /api/prescriptions/patient/:patientId - list prescriptions for a patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const items = await Prescription.find({ patientId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
