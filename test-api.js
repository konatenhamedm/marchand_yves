const https = require('https');

const data = JSON.stringify({
  magasin_id: 1,
  date_debut: "2024-01-01 00:00:00",
  date_fin: "2024-12-31 23:59:59",
  recette_globale_periode: "mois",
  commande_periode: "mois",
  vente_periode: "mois",
  benefice_periode: "mois"
});

const options = {
  hostname: 'dev.moomen.pro',
  port: 443,
  path: '/api/dashboard/bilan',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  res.setEncoding('utf8');
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log(`BODY: ${body}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
