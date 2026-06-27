const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
  }
});

// Create a credential object manually since we don't have a service account JSON handy
// Wait, the app uses client SDK mostly. Does the admin SDK work without credentials? 
// Only if we provide service account. 
// If we don't have a service account JSON, we can't easily use admin SDK locally.
