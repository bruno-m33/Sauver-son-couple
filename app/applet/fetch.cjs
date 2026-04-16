const https = require('https');

https.get('https://brunomarchal.podia.com/formations', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const regex = /<h3[^>]*>(.*?)<\/h3>/g;
    let match;
    while ((match = regex.exec(data)) !== null) {
      console.log(match[1].trim());
    }
  });
}).on('error', (err) => {
  console.log('Error: ' + err.message);
});
