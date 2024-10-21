// app.js
const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const morgan = require("morgan");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // Middleware to parse JSON bodies
app.use(morgan("dev")); // HTTP request logger middleware

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// Sample route
app.get("/api/dashboard", (req, res) => {
  res.json({ message: "Welcome to the Dashboard API" });
});

// Auth routes
app.use("/api/auth", authRoutes); // Ensure this is after express.json()

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
