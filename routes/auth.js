const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Middleware to authenticate user
const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Get token after "Bearer "

  if (!token) {
    console.log("No token provided"); // Log when no token is provided
    return res.sendStatus(403);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("JWT verification failed:", err); // Log verification errors
      return res.sendStatus(403);
    }
    console.log("Authenticated user:", user); // Log user info after verification
    req.user = user; // Attach user info to request
    next(); // Proceed to the next middleware or route handler
  });
};

// Register
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findByUsername(username);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create(username, hashedPassword);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  // Check if the body is present and has the required fields
  if (!req.body || !req.body.username || !req.body.password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  const { username, password } = req.body;

  try {
    // Find the user by username
    const users = await User.findByUsername(username);
    const user = users[0]; // Assuming the query returns an array

    // Check if the user exists
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Create a JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    // Log the error for debugging
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user by ID
router.get("/user/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user); // Return the user details
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Fetch all users
router.get("/user", async (_req, res) => {
  try {
    console.log("Fetching users...");
    const users = await User.findAll();
    console.log("Fetched users:", users);

    if (!users || users.length === 0) {
      return res.json({ users: [] }); // Return an empty array within an object
    }

    res.json({ users }); // Return users as an object
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Delete user
router.delete("/:id", authenticate, async (req, res) => {
  try {
    await User.deleteById(req.params.id); // Use the deleteById method from the User model
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
