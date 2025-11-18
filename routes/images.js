const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { auth } = require("../middleware/auth");

const router = express.Router();

// uploads/books folder
const uploadDir = path.join(__dirname, "../uploads/books");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// storage config (same as GroceryHub)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname)
    ),
});

const upload = multer({ storage });

// POST /api/images → upload file
router.post("/", auth, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const url = `/uploads/books/${req.file.filename}`;
  res.json({ url });
});

module.exports = router;
