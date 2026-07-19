require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// CORS fix
app.use(
  cors({
    origin: ["http://localhost:5173", "https://abfitness-beryl.vercel.app"],
    credentials: true,
  }),
);

app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));

// Health check
app.get("/", (req, res) => {
  res.json({ status: "AB Fitness Backend Running! 🏋️" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
