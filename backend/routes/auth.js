require("dotenv").config();
const router = require("express").Router();
const axios = require("axios");
const { authLimiter } = require("../middleware/rateLimit");
const { validate } = require("../middleware/validate");
const { sendOtp, verifyOtp } = require("../validators/auth");

const otpStore = new Map();

// verify-otp par strict limiter zaroori hai - OTP sirf 4-digit hai (1000-
// 9999), bina rate limit ke brute-force trivial hota
router.post("/send-otp", authLimiter, validate(sendOtp), async (req, res) => {
  const { phone } = req.body;

  if (!phone || phone.length !== 10) {
    return res.status(400).json({ message: "Invalid phone number" });
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  otpStore.set(phone, {
    otp,
    expires: Date.now() + 5 * 60 * 1000,
  });

  // Hamesha print karo — development ke liye
  console.log(`[DEV] OTP for ${phone}: ${otp}`);

  try {
    const response = await axios.post(
      "https://control.msg91.com/api/v5/otp",
      {
        template_id: process.env.MSG91_TEMPLATE_ID,
        mobile: `91${phone}`,
        authkey: process.env.MSG91_AUTH_KEY,
        otp: otp,
      },
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    console.log("MSG91 Response:", response.data);
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.log("MSG91 Error:", error.response?.data || error.message);
    res.json({ success: true, message: "OTP sent (dev mode)" });
  }
});

router.post("/verify-otp", authLimiter, validate(verifyOtp), (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ message: "Phone and OTP required" });
  }

  const stored = otpStore.get(phone);

  if (!stored) {
    return res
      .status(400)
      .json({ message: "OTP not found. Please request again." });
  }

  if (Date.now() > stored.expires) {
    otpStore.delete(phone);
    return res
      .status(400)
      .json({ message: "OTP expired. Please request again." });
  }

  if (stored.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP. Please try again." });
  }

  otpStore.delete(phone);

  res.json({
    success: true,
    message: "OTP verified successfully",
    phone: phone,
  });
});

module.exports = router;
