// Library Management API - Final Project
const express = require("express");
const app = express();

// Hosting platforms give the port through process.env.PORT
const PORT = process.env.PORT || 3000;

// Allows the server to read JSON data
app.use(express.json());

// Logging: prints every request (useful for monitoring)
app.use((req, res, next) => {
  console.log(new Date().toISOString() + " " + req.method + " " + req.url);
  next();
});

// Sample data (stored in memory)
let books = [
  { id: 1, title: "Wings of Fire", author: "A. P. J. Abdul Kalam", year: 1999, available: true },
  { id: 2, title: "The Alchemist", author: "Paulo Coelho", year: 1988, available: true },
  { id: 3, title: "Clean Code", author: "Robert C. Martin", year: 2008, available: false },
];

// Creates a new unique id (highest id + 1)
function nextId() {
  return books.length ? Math.max(...books.map((b) => b.id)) + 1 : 1;
}

// Checks book data and returns an error message (or null if valid)
function validateBook(body) {
  if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
    return "Title is required";
  }
  if (!body.author || typeof body.author !== "string" || !body.author.trim()) {
    return "Author is required";
  }
  if (body.year !== undefined) {
    const thisYear = new Date().getFullYear();
    if (!Number.isInteger(body.year) || body.year < 0 || body.year > thisYear) {
      return "Year must be a valid whole number";
    }
  }
  return null;
}

// Home route
app.get("/", (req, res) => {
  res.send("Welcome to the Library API");
});

// Health check route (used to monitor the deployed app)
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Get all books (optional filters: ?author=, ?available=, ?search=)
app.get("/books", (req, res) => {
  let result = books;

  if (req.query.author) {
    const author = req.query.author.toLowerCase();
    result = result.filter((b) => b.author.toLowerCase().includes(author));
  }
  if (req.query.available !== undefined) {
    result = result.filter((b) => String(b.available) === req.query.available);
  }
  if (req.query.search) {
    const text = req.query.search.toLowerCase();
    result = result.filter((b) => b.title.toLowerCase().includes(text));
  }

  res.json(result);
});

// Get one book by id
app.get("/books/:id", (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  res.json(book);
});

// Add a new book
app.post("/books", (req, res) => {
  const error = validateBook(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }
  const newBook = {
    id: nextId(),
    title: req.body.title.trim(),
    author: req.body.author.trim(),
    year: req.body.year || null,
    available: true,
  };
  books.push(newBook);
  res.status(201).json(newBook);
});

// Update a book
app.put("/books/:id", (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  const error = validateBook(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }
  book.title = req.body.title.trim();
  book.author = req.body.author.trim();
  book.year = req.body.year || null;
  res.json(book);
});

// Borrow a book
app.patch("/books/:id/borrow", (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (!book.available) {
    return res.status(400).json({ message: "Book is already borrowed" });
  }
  book.available = false;
  res.json(book);
});

// Return a book
app.patch("/books/:id/return", (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (book.available) {
    return res.status(400).json({ message: "Book is already available" });
  }
  book.available = true;
  res.json(book);
});

// Delete a book
app.delete("/books/:id", (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  books = books.filter((b) => b.id !== book.id);
  res.json({ message: "Book deleted" });
});

// Unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler (for example, invalid JSON)
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: "Invalid request" });
});

// Start the server (only when run directly, not when imported by tests)
// Start the server (only when run directly, not when imported by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
  });
}

module.exports = app;