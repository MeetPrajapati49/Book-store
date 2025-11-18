const mongoose = require('mongoose');
const Book = require('./models/Book');

const id = process.argv[2];
if(!id){
  console.error('Usage: node set_all_covers_to.js <cover_url_or_api_id>');
  console.error('Example: node set_all_covers_to.js /api/images/691584c14a61b3c669fd8e31');
  process.exit(1);
}

const cover = id.startsWith('/api/') ? id : id;

(async ()=>{
  try{
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bookstore');
    const res = await Book.updateMany({}, { $set: { cover } });
    console.log('Updated', res.modifiedCount, 'documents');
    process.exit(0);
  }catch(e){
    console.error(e);
    process.exit(2);
  }
})();
