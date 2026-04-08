const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
  billNo: { type: String, unique: true, index: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientId: { type: String, required: true },
  diagnosis: String,
  treatment: String,
  problemDescription: String,
  toothNumber: String,
  fee: Number,
  remarks: String,
  nextVisitDate: String,
  receivedAmount: Number,
  balance: Number,
  medicines: [{ name: String, category: String }],
}, { timestamps: true });

module.exports = mongoose.model('Prescription', PrescriptionSchema);
