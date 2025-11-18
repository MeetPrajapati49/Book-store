(async ()=>{
  try{
    const fetch = global.fetch || (await import('node-fetch')).default;
    const fs = await import('fs');
    const path = await import('path');

    const API = 'http://localhost:5000/api/';
    console.log('Logging in...');
    let r = await fetch(API + 'auth/login', {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({email:'admin@bookstore.local', password:'admin123'})
    });
    console.log('login status', r.status);
    const body = await r.json();
    if(!body.token){
      console.error('Login failed', body); process.exit(1);
    }
    const token = body.token;

    // read placeholder.svg
    // Try a few candidate locations for the placeholder (script may be run from different CWD)
    const candidates = [
      path.join(process.cwd(), 'frontend', 'public', 'placeholder.svg'),
      path.join(process.cwd(), 'public', 'placeholder.svg'),
      path.join(process.cwd(), '..', 'frontend', 'public', 'placeholder.svg'),
      path.join(__dirname, '..', 'frontend', 'public', 'placeholder.svg')
    ];
    let svgPath = null;
    for (const c of candidates) {
      if (fs.existsSync(c)) { svgPath = c; break; }
    }
    if (!svgPath) { throw new Error('placeholder.svg not found in expected locations: ' + JSON.stringify(candidates)); }
    const buffer = fs.readFileSync(svgPath);

    // Build FormData
    const { FormData, Blob } = global;
    const fd = new FormData();
    const blob = new Blob([buffer], { type: 'image/svg+xml' });
    fd.append('file', blob, 'placeholder.svg');

    console.log('Uploading image...');
    r = await fetch(API + 'images', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd });
    console.log('upload status', r.status);
    const uploadRes = await r.json().catch(()=>null);
    console.log('upload res', uploadRes);
    if(!uploadRes || !uploadRes.url){ console.error('Upload failed'); process.exit(1); }

    const coverUrl = uploadRes.url;
    console.log('Creating book with cover', coverUrl);
    r = await fetch(API + 'books', { method: 'POST', headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ title: 'Uploaded Test Book', author: 'Tester', genre: 'Test', cover: coverUrl, description: 'Uploaded via script' }) });
    console.log('create book status', r.status);
    const createRes = await r.json();
    console.log('create res', createRes);

    console.log('Fetching books...');
    r = await fetch(API + 'books');
    console.log('books status', r.status);
    const books = await r.json();
    console.log('latest book:', books[books.length - 1]);

    console.log('Fetching cover URL to verify...');
    r = await fetch('http://localhost:5000' + coverUrl);
    console.log('cover fetch status', r.status, 'content-type', r.headers.get('content-type'));
    const data = await r.text();
    console.log('cover content length', data.length);

    console.log('Done');
    process.exit(0);
  }catch(e){ console.error('ERROR', e); process.exit(2);} 
})()
