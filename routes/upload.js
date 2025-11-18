const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// STORAGE: Save inside /uploads/books/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/books/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// POST /api/upload/book
router.post("/book", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = "/uploads/books/" + req.file.filename;
  return res.json({ url: filePath });
});

module.exports = router;
