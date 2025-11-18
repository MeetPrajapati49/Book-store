/**
 * Generate diverse book cover SVGs and upload them to GridFS.
 * Then bulk-update books to use the uploaded images.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Colors and styles for diverse covers
const covers = [
  {
    title: 'Classic Blue',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
      <rect width="100%" height="100%" fill="#1e40af"/>
      <circle cx="200" cy="150" r="80" fill="#3b82f6" opacity="0.8"/>
      <rect x="50" y="350" width="300" height="150" fill="#0c4a6e" opacity="0.6"/>
      <text x="200" y="500" font-family="Georgia, serif" font-size="28" fill="#fff" text-anchor="middle" font-weight="bold">Classic</text>
    </svg>`
  },
  {
    title: 'Modern Red',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
      <rect width="100%" height="100%" fill="#dc2626"/>
      <polygon points="200,100 350,250 200,400 50,250" fill="#ef4444" opacity="0.8"/>
      <rect x="100" y="450" width="200" height="100" fill="#7f1d1d"/>
      <text x="200" y="520" font-family="Arial, sans-serif" font-size="24" fill="#fff" text-anchor="middle" font-weight="bold">Adventure</text>
    </svg>`
  },
  {
    title: 'Emerald Green',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
      <rect width="100%" height="100%" fill="#059669"/>
      <path d="M 50 200 Q 200 50 350 200 L 350 600 L 50 600 Z" fill="#10b981" opacity="0.8"/>
      <circle cx="100" cy="500" r="40" fill="#34d399"/>
      <circle cx="300" cy="520" r="35" fill="#34d399" opacity="0.6"/>
      <text x="200" y="300" font-family="Garamond, serif" font-size="26" fill="#fff" text-anchor="middle" font-weight="bold">Nature</text>
    </svg>`
  },
  {
    title: 'Midnight Purple',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
      <rect width="100%" height="100%" fill="#581c87"/>
      <rect x="40" y="80" width="320" height="440" fill="#9333ea" rx="20"/>
      <circle cx="80" cy="120" r="25" fill="#d8b4fe" opacity="0.7"/>
      <circle cx="320" cy="500" r="30" fill="#d8b4fe" opacity="0.5"/>
      <text x="200" y="340" font-family="Arial, sans-serif" font-size="28" fill="#fce7f3" text-anchor="middle" font-weight="bold">Mystery</text>
    </svg>`
  },
  {
    title: 'Sunset Orange',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
      <defs>
        <linearGradient id="sunset" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#ea580c;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#fb923c;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#fed7aa;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#sunset)"/>
      <circle cx="200" cy="180" r="70" fill="#fff" opacity="0.3"/>
      <path d="M 0 500 Q 100 450 200 480 T 400 500 L 400 600 L 0 600 Z" fill="#92400e" opacity="0.4"/>
      <text x="200" y="380" font-family="Georgia, serif" font-size="26" fill="#fff" text-anchor="middle" font-weight="bold">Romance</text>
    </svg>`
  },
  {
    title: 'Deep Indigo',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
      <rect width="100%" height="100%" fill="#312e81"/>
      <path d="M 0 0 L 400 0 L 400 400 Q 200 500 0 400 Z" fill="#4c1d95" opacity="0.8"/>
      <rect x="60" y="420" width="280" height="140" fill="#1e1b4b" rx="10"/>
      <text x="200" y="510" font-family="Arial, sans-serif" font-size="24" fill="#c4b5fd" text-anchor="middle" font-weight="bold">Thriller</text>
    </svg>`
  },
  {
    title: 'Coral Pink',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
      <rect width="100%" height="100%" fill="#f43f5e"/>
      <circle cx="200" cy="200" r="100" fill="#fb7185" opacity="0.8"/>
      <polygon points="200,400 100,500 300,500" fill="#be123c"/>
      <text x="200" y="280" font-family="Georgia, serif" font-size="28" fill="#fff" text-anchor="middle" font-weight="bold">Drama</text>
    </svg>`
  }
];

async function uploadCoversToGridFS() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bookstore', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ MongoDB connected');

    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'covers' });

    const uploadedIds = [];

    for (const cover of covers) {
      const uploadStream = bucket.openUploadStream(`cover_${cover.title.replace(/\s+/g, '_')}.svg`, {
        contentType: 'image/svg+xml',
      });

      const uploadPromise = new Promise((resolve, reject) => {
        uploadStream.on('finish', () => {
          const id = uploadStream.id.toString();
          uploadedIds.push(id);
          console.log(`✓ Uploaded "${cover.title}" with id: ${id}`);
          resolve(id);
        });
        uploadStream.on('error', reject);
      });

      uploadStream.end(cover.svg);
      await uploadPromise;
    }

    console.log(`\n✓ Uploaded ${uploadedIds.length} covers to GridFS`);
    console.log('IDs:', uploadedIds);

    // Now bulk-update books to use these covers (cycle through them)
    const Book = require('./models/Book');
    const books = await Book.find();
    console.log(`\nFound ${books.length} books to update`);

    for (let i = 0; i < books.length; i++) {
      const coverId = uploadedIds[i % uploadedIds.length]; // Cycle through covers
      books[i].cover = `/api/images/${coverId}`;
      await books[i].save();
      console.log(`✓ Updated "${books[i].title}" → /api/images/${coverId}`);
    }

    console.log(`\n✓ All ${books.length} books updated with diverse covers!`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

uploadCoversToGridFS();
