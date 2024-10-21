const db = require("../db");

class User {
  static async create(username, password) {
    const query = "INSERT INTO users (username, password) VALUES (?, ?)";
    return new Promise((resolve, reject) => {
      db.execute(query, [username, password], (err, results) => {
        if (err) {
          console.error("Error creating user:", err); // Improved error logging
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  static async findByUsername(username) {
    const query = "SELECT * FROM users WHERE username = ?";
    return new Promise((resolve, reject) => {
      db.execute(query, [username], (err, results) => {
        if (err) {
          console.error("Error finding user by username:", err); // Improved error logging
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  static async findById(id) {
    const query = "SELECT id, username FROM users WHERE id = ?";
    return new Promise((resolve, reject) => {
      db.execute(query, [id], (err, results) => {
        if (err) {
          console.error("Error finding user by ID:", err); // Improved error logging
          return reject(err);
        }
        resolve(results[0]);
      });
    });
  }

  static async findAll() {
    const query = "SELECT id, username FROM users";
    return new Promise((resolve, reject) => {
      db.execute(query, (err, results) => {
        if (err) {
          console.error("Error fetching all users:", err); // Improved error logging
          return reject(err);
        }

        // Check if results is an array and handle the case where no users are found
        if (!Array.isArray(results)) {
          return reject(new Error("Expected an array of results"));
        }

        console.log("Fetched users from DB:", results);
        resolve(results); // Return the array of users
      });
    });
  }

  static async deleteById(id) {
    const query = "DELETE FROM users WHERE id = ?";
    return new Promise((resolve, reject) => {
      db.execute(query, [id], (err) => {
        if (err) {
          console.error("Error deleting user:", err); // Improved error logging
          return reject(err);
        }
        resolve();
      });
    });
  }
}

module.exports = User;
