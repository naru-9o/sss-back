const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const memberRoutes = require("./routes/memberRoutes");
const { sendFeeReminders } = require("./utils/reminder");

dotenv.config();
const app = express();

// Allow CORS from your frontend domain
app.use(cors({
  origin: "https://sss-record.netlify.app",  // ✅ Add your Netlify frontend URL here
  credentials: true
}));

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error", err));

// API routes
app.use("/api/members", memberRoutes);

// Manual trigger for reminders
app.post("/send-reminders", async (req, res) => {
  try {
    await sendFeeReminders();
    console.log("✅ Reminders sent via manual trigger.");
    res.status(200).json({ success: true, message: "Reminders sent successfully" });
  } catch (err) {
    console.error("❌ Reminder failed:", err.message);
    res.status(500).json({ success: false, error: "Failed to send reminders", details: err.message });
  }
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "✅ Gym Backend API is running",
    frontend: "https://sss-record.netlify.app", // ✅ Replace localhost with Netlify domain
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at port ${PORT}`);
});
