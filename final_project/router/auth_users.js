const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// Sample users (replace with your actual user data)
let users = [
  { username: 'guest', password: 'passwordguest', role: 'user' },
  { username: 'admin', password: 'adminpassword', role: 'admin' }
];

// Function to check if the username is valid
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Function to authenticate a user with username and password
const authenticatedUser = (username, password) => {
  return users.find(user => user.username === username && user.password === password);
};

// Login route
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if the user exists and password matches
  const user = authenticatedUser(username, password);

  if (user) {
    // If user is authenticated, generate a JWT
    const token = jwt.sign(
      { username: user.username, role: user.role },
      "your_secret_key", // Secret key to sign the token
      { expiresIn: '1h' } // Set token expiration time
    );

    // Store the token in session (optional if you need to use sessions)
    req.session.token = token;

    // Send the token in the response or in a header
    return res.json({ message: "Login successful", token });
  } else {
    // If user is not found or password is incorrect
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Middleware to authenticate JWT for protected routes
const authenticateJWT = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Get token from "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "Token required" });
  }

  jwt.verify(token, "your_secret_key", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = decoded; // Attach decoded user info to request object
    next();
  });
};

// Add a book review (only accessible by authenticated users)
regd_users.put("/auth/review/:isbn", authenticateJWT, (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;

  // Ensure the review is provided
  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }

  // Assuming books is an array with book objects that have an `isbn` and `reviews`
  const book = books.find(b => b.isbn === isbn);

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add the review to the book
  book.reviews = book.reviews || [];
  book.reviews.push({ username: req.user.username, review });

  return res.json({ message: "Review added successfully" });
});

regd_users.delete('/auth/review/:isbn', (req, res) => {
    const { isbn } = req.params;
    const user = req.user; // Assuming authentication is implemented

    // Find the book by ISBN
    const book = books.find(b => b.isbn === isbn);
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if reviews exist for the book
    if (!book.reviews || book.reviews.length === 0) {
        return res.status(404).json({ message: "No reviews found for this book" });
    }

    // Find the review by the logged-in user
    const reviewIndex = book.reviews.findIndex(r => r.userId === user.id);
    if (reviewIndex === -1) {
        return res.status(403).json({ message: "You can only delete your own review" });
    }

    // Remove the review
    book.reviews.splice(reviewIndex, 1);

    return res.json({ message: "Review deleted successfully", book });
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;