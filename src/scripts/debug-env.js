// Check Environment Loading Issues
// Run: node check-env-loading.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Environment File Investigation');
console.log('=================================\n');

// Check for multiple env files
const possibleEnvFiles = [
  '.env',
  '.env.local',
  '.env.development',
  '.env.development.local',
  '.env.production',
  '.env.production.local'
];

console.log('📁 Checking for environment files:');
possibleEnvFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} EXISTS`);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.includes('ADMIN_'));
    if (lines.length > 0) {
      console.log(`   Contains admin config:`);
      lines.forEach(line => {
        if (line.includes('ADMIN_PASSWORD_HASH')) {
          const hash = line.split('=')[1];
          console.log(`   ADMIN_PASSWORD_HASH length: ${hash ? hash.length : 'undefined'}`);
          console.log(`   ADMIN_PASSWORD_HASH preview: ${hash ? hash.substring(0, 20) + '...' : 'undefined'}`);
        } else {
          console.log(`   ${line}`);
        }
      });
    }
  } else {
    console.log(`❌ ${file} does not exist`);
  }
});

console.log('\n🔍 Current Process Environment:');
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || 'MISSING');
console.log('ADMIN_PASSWORD_HASH length:', process.env.ADMIN_PASSWORD_HASH ? process.env.ADMIN_PASSWORD_HASH.length : 'MISSING');
console.log('ADMIN_PASSWORD_HASH preview:', process.env.ADMIN_PASSWORD_HASH ? process.env.ADMIN_PASSWORD_HASH.substring(0, 20) + '...' : 'MISSING');

console.log('\n📋 .env.local content:');
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  console.log(fs.readFileSync(envLocalPath, 'utf8'));
} else {
  console.log('❌ .env.local not found');
}