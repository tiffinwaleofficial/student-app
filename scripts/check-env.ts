#!/usr/bin/env node

import 'dotenv/config';
import fs from 'fs';
import path from 'path';

console.log('🔍 Environment Configuration Check');
console.log('=====================================');
console.log();

console.log('📁 .env file status:');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  console.log('  ✅ .env file exists');
  console.log('  📍 Location:', envPath);
} else {
  console.log('  ❌ .env file not found');
  console.log('  📍 Expected location:', envPath);
}

console.log();
console.log('🌐 API Configuration:');
const apiUrl = process.env.API_BASE_URL;
if (apiUrl) {
  console.log('  ✅ API_BASE_URL found:', apiUrl);
  
  if (apiUrl.includes('127.0.0.1') || apiUrl.includes('localhost')) {
    console.log('  🏠 Environment: LOCAL DEVELOPMENT');
  } else if (apiUrl.includes('api.tiffin-wale.com')) {
    console.log('  🌍 Environment: PRODUCTION (Custom Domain)');
  } else if (apiUrl.includes('appspot.com')) {
    console.log('  🌍 Environment: PRODUCTION (Google Cloud)');
  } else {
    console.log('  ❓ Environment: UNKNOWN');
  }
} else {
  console.log('  ❌ API_BASE_URL not found in .env file');
  console.log('  💡 Add this line to your .env file:');
  console.log('     API_BASE_URL=https://api.tiffin-wale.com');
}

console.log();
console.log('📋 Available options for .env:');
console.log('  # For production:');
console.log('  API_BASE_URL=https://api.tiffin-wale.com');
console.log();
console.log('  # For local development:');
console.log('  API_BASE_URL=http://127.0.0.1:3001');
console.log();
console.log('💡 To switch environments:');
console.log('  1. Edit your .env file');
console.log('  2. Comment/uncomment the desired API_BASE_URL');
console.log('  3. Restart Expo: npx expo start --clear'); 