const express = require('express');
const router = express.Router();
const Patient = require('../models/patient');

// Helper to generate next patientId like PAT-0001
const generatePatientId = async () => {
  const count = await Patient.countDocuments();
  const next = count + 1;
  return `PAT-${String(next).padStart(4, '0')}`;
};

// GET /api/patients/next-id - returns next patientId (for frontend preview)
router.get('/next-id', async (req, res) => {
  try {
    const id = await generatePatientId();
    res.json({ nextId: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/patients - list all patients
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/patients - create new patient
router.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    const patientId = await generatePatientId();
    const patient = new Patient({ patientId, ...body });
    
    // Validate before saving
    const error = patient.validateSync();
    if (error) {
      return res.status(400).json({ error: 'Validation error: ' + error.message });
    }
    
    await patient.save();
    res.status(201).json(patient);
  } catch (err) {
    console.error('Error creating patient:', err.message, err);
    res.status(500).json({ error: err.message || 'Failed to create patient' });
  }
});

// PUT /api/patients/:id - update by patientId
router.put('/:id', async (req, res) => {
  try {
    const updated = await Patient.findOneAndUpdate({ patientId: req.params.id }, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/patients/:id - delete by patientId
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Patient.findOneAndDelete({ patientId: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
