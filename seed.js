const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Book = require('./models/Book');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bookstore');
    
    const existingAdmin = await User.findOne({ email: 'admin@bookstore.local' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        name: 'Admin',
        email: 'admin@bookstore.local',
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      console.log('? Admin user seeded successfully');
    } else {
      console.log('? Admin user already exists');
    }

    await Book.deleteMany({});
    const sampleBooks = [
      { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', genre: 'Fiction', description: 'A classic novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.', cover: '/placeholder.svg' },
      { title: 'To Kill a Mockingbird', author: 'Harper Lee', genre: 'Fiction', description: 'A gripping tale of racial injustice and childhood innocence in the American South.', cover: '/placeholder.svg' },
      { title: '1984', author: 'George Orwell', genre: 'Dystopian', description: 'A haunting novel about totalitarianism and the suppression of individual freedom.', cover: '/placeholder.svg' },
      { title: 'Pride and Prejudice', author: 'Jane Austen', genre: 'Romance', description: 'A witty romance novel exploring social class, marriage, and self-discovery in Regency England.', cover: '/placeholder.svg' },
      { title: 'The Catcher in the Rye', author: 'J.D. Salinger', genre: 'Fiction', description: 'A coming-of-age novel following the thoughts and adventures of a teenage boy in New York City.', cover: '/placeholder.svg' },
      { title: 'The Hobbit', author: 'J.R.R. Tolkien', genre: 'Fantasy', description: 'An epic fantasy adventure following Bilbo Baggins as he embarks on an unexpected journey.', cover: '/placeholder.svg' }
    ];
    
    await Book.insertMany(sampleBooks);
    console.log(`✓ ${sampleBooks.length} sample books seeded successfully`);
    console.log('Seed completed!');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedData();
