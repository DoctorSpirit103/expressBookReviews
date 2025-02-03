const express = require('express');
let books = require("./booksdb.js"); // Assume this is an array of book objects
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register new users
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username already exists
  if (isValid(username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Add user to the users array
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', (req, res) => {
  return res.json({ books });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const { isbn } = req.params;
  const book = books.find(b => b.isbn === isbn);

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.json({ book });
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
  
  const { author } = req.params;
  const booksByAuthor = books.filter(b => b.author.toLowerCase().includes(author.toLowerCase()));

  if (booksByAuthor.length === 0) {
    return res.status(404).json({ message: "No books found by this author" });
  }

  return res.json({ books: booksByAuthor });
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const { title } = req.params;
  const booksByTitle = books.filter(b => b.title.toLowerCase().includes(title.toLowerCase()));

  if (booksByTitle.length === 0) {
    return res.status(404).json({ message: "No books found with this title" });
  }

  return res.json({ books: booksByTitle });
});

// Get book review by ISBN
public_users.get('/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const book = books.find(b => b.isbn === isbn);

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!book.reviews || book.reviews.length === 0) {
    return res.status(404).json({ message: "No reviews found for this book" });
  }

  return res.json({ reviews: book.reviews });
});

module.exports.general = public_users;