const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  date: String,
  problem: String,
  treatment: String,
  medication: String,
  fee: Number
}, { _id: false });

const PatientSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: Number,
  gender: String,
  mobile: String,
  address: String,
  district: String,
  category: String,
  lastVisit: String,
  pastMedicalHistory: String,
  balance: { type: Number, default: 0 },
  visits: [VisitSchema],
  email: String
}, { timestamps: true });

module.exports = mongoose.model('Patient', PatientSchema);
