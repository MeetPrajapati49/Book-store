const express = require('express');
const Review = require('../models/Review');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('book', 'title author')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:bookId', async (req, res) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId }).populate('user', 'name');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const review = new Review({ ...req.body, user: req.user.id });
    await review.save();
    await review.populate('user', 'name');
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
