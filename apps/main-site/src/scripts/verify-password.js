// Force Fix Environment Variables
// Run: node force-fix-env.js

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function forceFix() {
  console.log('🔧 Force Fixing Environment Variables');
  console.log('====================================\n');

  // Generate fresh credentials
  const adminEmail = 'admin@glamourlocks.com';
  const adminPassword = 'password123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const nextAuthSecret = crypto.randomBytes(32).toString('base64');

  console.log('📊 Generated Credentials:');
  console.log('Email:', adminEmail);
  console.log('Password:', adminPassword);
  console.log('Hash length:', hashedPassword.length);
  console.log('Hash preview:', hashedPassword.substring(0, 30) + '...');
  console.log('Secret length:', nextAuthSecret.length);

  // Create clean .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  const envContent = `# Glamour Locks Admin Configuration - Generated ${new Date().toISOString()}
ADMIN_EMAIL=${adminEmail}
ADMIN_PASSWORD_HASH=${hashedPassword}
NEXTAUTH_SECRET=${nextAuthSecret}
NEXTAUTH_URL=http://localhost:3000
`;

  // Backup existing file
  if (fs.existsSync(envPath)) {
    const backupPath = envPath + '.backup.' + Date.now();
    fs.copyFileSync(envPath, backupPath);
    console.log(`📋 Backed up existing .env.local to ${backupPath}`);
  }

  // Write new file
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created new .env.local file');

  // Verify the file was written correctly
  const writtenContent = fs.readFileSync(envPath, 'utf8');
  const hashMatch = writtenContent.match(/ADMIN_PASSWORD_HASH=(.+)/);
  if (hashMatch) {
    const writtenHash = hashMatch[1];
    console.log('\n🔍 Verification:');
    console.log('Written hash length:', writtenHash.length);
    console.log('Written hash preview:', writtenHash.substring(0, 30) + '...');
    console.log('Hash starts with $2b$:', writtenHash.startsWith('$2b$'));
    
    // Test the hash
    const testResult = await bcrypt.compare(adminPassword, writtenHash);
    console.log('Hash verification test:', testResult ? '✅ PASS' : '❌ FAIL');
  }

  console.log('\n🎯 Next Steps:');
  console.log('1. 🔄 Restart your development server completely');
  console.log('2. 🧹 Clear your browser cache/cookies for localhost:3000');
  console.log('3. 🌐 Try logging in with:');
  console.log('   Email: admin@glamourlocks.com');
  console.log('   Password: password123');
  console.log('\n⚠️  IMPORTANT: Complete server restart is required!');
}

forceFix().catch(console.error);