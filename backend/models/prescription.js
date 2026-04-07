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
<<<<<<< HEAD
  nextVisitDate: String,
  receivedAmount: Number,
  balance: Number,
=======
>>>>>>> a3abea51565cabad0d2f07e250f0931d98fc4613
  medicines: [{ name: String, category: String }],
}, { timestamps: true });

module.exports = mongoose.model('Prescription', PrescriptionSchema);
