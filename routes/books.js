const express = require("express");
const Book = require("../models/Book");
const { auth, adminAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", auth, adminAuth, async (req, res) => {
  try {
    const { title, author, description, genre, cover } = req.body;

    const book = new Book({
      title,
      author,
      description,
      genre,
      cover
    });

    await book.save();
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", auth, adminAuth, async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
