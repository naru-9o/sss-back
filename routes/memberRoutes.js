// backend/routes/memberRoutes.js
const express = require("express");
const router = express.Router();
const Member = require("../models/Member");

// Generate 12 months for payment status
const generateMonthlyPayments = () => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return months.map(month => ({ month, paid: false, date: null }));
};

// GET all members
router.get("/", async (req, res) => {
  try {
    const members = await Member.find();
    res.json(members);
  } catch (err) {
    console.error("Error fetching members:", err);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

// ADD new member
router.post("/", async (req, res) => {
  const { memberId, name, phone, email } = req.body;

  if (!memberId || !name || !phone || !email) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newMember = new Member({
      memberId,
      name,
      phone,
      email,
      payments: generateMonthlyPayments()
    });

    await newMember.save();
    res.status(201).json(newMember);
  } catch (err) {
    console.error("Error adding member:", err);
    res.status(500).json({ error: "Failed to add member" });
  }
});

// UPDATE payment status
router.put("/:id/payment", async (req, res) => {
  const { month, toggle } = req.body;
  
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    const payment = member.payments.find(p => p.month === month);
    if (payment) {
      if (toggle) {
        payment.paid = !payment.paid;
        payment.date = payment.paid ? new Date() : null;
      } else {
        payment.paid = true;
        payment.date = new Date();
      }
    }

    await member.save();
    res.json(member);
  } catch (err) {
    console.error("Error updating payment:", err);
    res.status(500).json({ error: "Failed to update payment" });
  }
});

// UPDATE member details
router.put("/:id", async (req, res) => {
  const { memberId, name, phone, email } = req.body;
  
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { memberId, name, phone, email },
      { new: true, runValidators: true }
    );
    
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }
    
    res.json(member);
  } catch (err) {
    console.error("Error updating member:", err);
    res.status(500).json({ error: "Failed to update member" });
  }
});

// DELETE member
router.delete("/:id", async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }
    res.json({ message: "Member deleted successfully" });
  } catch (err) {
    console.error("Error deleting member:", err);
    res.status(500).json({ error: "Failed to delete member" });
  }
});

module.exports = router;