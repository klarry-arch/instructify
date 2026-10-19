const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function run() {
  console.log('Testing live server: https://instructify.co.ke ...');
  const res = await fetchUrl('https://instructify.co.ke');
  console.log('Status:', res.status);
  console.log('HTML size:', res.body.length, 'bytes');

  // Check nav-brand
  const brandMatch = res.body.match(/<a[^>]*class=["']nav-brand["'][^>]*>([\s\S]*?)<\/a>/i);
  console.log('Live Nav Brand markup:');
  console.log(brandMatch ? brandMatch[0] : 'Nav brand not found');

  // Check CSS
  const cssRes = await fetchUrl('https://instructify.co.ke/css/global.css');
  console.log('Live css/global.css status:', cssRes.status);
  console.log('css/global.css has #064FC1:', cssRes.body.includes('#064FC1'));
  console.log('css/global.css has #12B84E:', cssRes.body.includes('#12B84E'));

  // Check Logo images
  const logo1 = await fetchUrl('https://instructify.co.ke/assets/images/instructify-kenya-logo.png');
  console.log('Live assets/images/instructify-kenya-logo.png status:', logo1.status, 'size:', logo1.body.length);

  const logoDark = await fetchUrl('https://instructify.co.ke/assets/images/instructify-kenya-logo-dark.png');
  console.log('Live assets/images/instructify-kenya-logo-dark.png status:', logoDark.status, 'size:', logoDark.body.length);

  const favicon = await fetchUrl('https://instructify.co.ke/favicon.ico');
  console.log('Live favicon.ico status:', favicon.status, 'size:', favicon.body.length);
}

run().catch(console.error);
