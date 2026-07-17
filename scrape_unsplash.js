const https = require('https');

https.get('https://unsplash.com/s/photos/white-porsche', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    // extract urls matching https://images.unsplash.com/photo-...
    const regex = /https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-]+(\?q=80&w=2000&auto=format&fit=crop)?/g;
    const matches = [...new Set(data.match(regex))].slice(0, 5);
    console.log(matches);
  });
}).on('error', (e) => {
  console.error(e);
});
