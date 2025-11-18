const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

(async ()=>{
  try{
    const API = 'http://localhost:5000/api/';
    // login
    console.log('Logging in as admin...');
    const loginRes = await fetch(API + 'auth/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({email:'admin@bookstore.local', password:'admin123'}) });
    const loginBody = await loginRes.json();
    if(!loginBody.token){ console.error('Login failed', loginBody); process.exit(1); }
    const token = loginBody.token;

    // find placeholder
    const svgPath = path.join(__dirname, '..', 'frontend', 'public', '');
    if(!fs.existsSync(svgPath)) throw new Error('placeholder.svg not found at ' + svgPath);
    const buffer = fs.readFileSync(svgPath);

    // build multipart form
    const FormData = global.FormData || (await import('form-data')).default;
    const fd = new FormData();
    fd.append('file', buffer, { filename: 'placeholder.svg', contentType: 'image/svg+xml' });

    console.log('Uploading placeholder to /api/images');
    const uploadRes = await fetch(API + 'images', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd });
    const uploadJson = await uploadRes.json();
    console.log('uploadRes', uploadJson);
    if(!uploadJson || !uploadJson.url) throw new Error('Upload failed');

    const coverUrl = uploadJson.url;
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bookstore');
    // load Book model from backend models
    const Book = require(path.join(__dirname, '..', 'backend-mern', 'models', 'Book'));
    console.log('Updating all books to use cover', coverUrl);
    const resu = await Book.updateMany({}, { $set: { cover: coverUrl } });
    console.log('Update result', resu);
    console.log('Done');
    process.exit(0);
  } catch (err){
    console.error('ERROR', err);
    process.exit(2);
  }
})();
