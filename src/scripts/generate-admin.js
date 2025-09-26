const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function generateAdminCredentials(email, password) {
  // Set your desired admin credentials here
  const adminEmail = 'admin@glamourlocks.com';
  const adminPassword = 'password123'; // Change this to your desired password
  
  console.log('🔐 Generating admin credentials...\n');
  
  // Generate password hash
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  
  // Generate NextAuth secret
  const nextAuthSecret = crypto.randomBytes(32).toString('base64');
  
  console.log('✅ Generated credentials:');
  console.log('═══════════════════════════════════════');
  console.log(`ADMIN_EMAIL=${adminEmail}`);
  console.log(`ADMIN_PASSWORD_HASH=${hashedPassword}`);
  console.log(`NEXTAUTH_SECRET=${nextAuthSecret}`);
  console.log(`NEXTAUTH_URL=http://localhost:3000`);
  console.log('═══════════════════════════════════════');
  console.log('\n📝 Copy these values to your .env.local file');
  console.log(`🔑 Your admin password is: ${adminPassword}`);
  console.log('\n⚠️  Important: Change the adminPassword variable in this script before running!');
}

generateAdminCredentials().catch(console.error);