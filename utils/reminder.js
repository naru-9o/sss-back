const cron = require("node-cron");
const Member = require("../models/Member");
const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text) => {
  const msg = {
    to,
    from: process.env.EMAIL_FROM, // Must be verified in SendGrid
    subject,
    text,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    const errorDetails = err.response ? err.response.body.errors : err.message;
    console.error(`❌ Failed to send email to ${to}:`, errorDetails);
    throw new Error(`Failed to send email to ${to}`); // This will bubble up to caller
  }
};

const sendFeeReminders = async () => {
  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const members = await Member.find();

  for (const member of members) {
    const payment = member.payments.find(p => p.month === currentMonth);

    if (payment && !payment.paid && member.email) {
      // ✅ Plain text message as per your requirement
      const message = `Your gym fee for ${currentMonth} is not paid. Please pay your fee as soon as possible.`;

      await sendEmail(
        member.email,
        `Gym Fee Reminder - ${currentMonth}`,
        message
      );
    }
  }
  console.log("✅ Fee reminders sent.");
};

cron.schedule("0 9 1 * *", () => {
  console.log("⏰ Monthly cron triggered");
  sendFeeReminders();
});


module.exports = { sendFeeReminders };
