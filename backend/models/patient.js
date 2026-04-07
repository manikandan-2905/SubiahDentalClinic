<<<<<<< HEAD
﻿const mongoose = require('mongoose');
=======
const mongoose = require('mongoose');
>>>>>>> a3abea51565cabad0d2f07e250f0931d98fc4613

const VisitSchema = new mongoose.Schema({
  date: String,
  problem: String,
  treatment: String,
  medication: String,
<<<<<<< HEAD
=======
  diagnosis: String,
  toothNumber: String,
  medicines: String,
>>>>>>> a3abea51565cabad0d2f07e250f0931d98fc4613
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
<<<<<<< HEAD
  balance: { type: Number, default: 0 },
=======
>>>>>>> a3abea51565cabad0d2f07e250f0931d98fc4613
  visits: [VisitSchema],
  email: String
}, { timestamps: true });

module.exports = mongoose.model('Patient', PatientSchema);
