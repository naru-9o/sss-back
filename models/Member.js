// backend/models/Member.js

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  month: String,
  paid: { type: Boolean, default: false },
  date: { type: Date, default: null }
});

const memberSchema = new mongoose.Schema({
  memberId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: String,
  email: String,
  joinDate: { type: Date, default: Date.now },
  payments: [paymentSchema]
});

module.exports = mongoose.model("Member", memberSchema);
