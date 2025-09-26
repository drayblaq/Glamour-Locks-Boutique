const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function setupAdmin() {
  console.log('🚀 Setting up Glamour Locks Admin Panel...\n');

  // Generate a secure secret
  const nextAuthSecret = crypto.randomBytes(32).toString('base64');

  // Get admin credentials
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const askQuestion = (question) => {
    return new Promise((resolve) => {
      readline.question(question, resolve);
    });
  };

  try {
    const adminEmail = await askQuestion('Enter admin email: ');
    const adminPassword = await askQuestion('Enter admin password: ');

    console.log('\n🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create or update .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = '';

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Remove existing admin config
    envContent = envContent.replace(/^ADMIN_EMAIL=.*$/gm, '');
    envContent = envContent.replace(/^ADMIN_PASSWORD_HASH=.*$/gm, '');
    envContent = envContent.replace(/^NEXTAUTH_SECRET=.*$/gm, '');
    envContent = envContent.replace(/^NEXTAUTH_URL=.*$/gm, '');

    // Add new config
    const adminConfig = `
# Admin Authentication
ADMIN_EMAIL=${adminEmail}
ADMIN_PASSWORD_HASH=${hashedPassword}
NEXTAUTH_SECRET=${nextAuthSecret}
NEXTAUTH_URL=http://localhost:3000
`;

    envContent += adminConfig;

    fs.writeFileSync(envPath, envContent.trim());

    console.log('\n✅ Admin setup complete!');
    console.log(`📧 Admin Email: ${adminEmail}`);
    console.log('🔒 Password has been securely hashed');
    console.log('🔑 NextAuth secret generated');
    console.log('\n🎉 You can now access your admin panel at: http://localhost:3000/admin');
    console.log('\n⚠️  Important: Restart your development server!');
    console.log('\n🔒 Security Note: Make sure .env.local is in your .gitignore file!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    readline.close();
  }
}

setupAdmin();