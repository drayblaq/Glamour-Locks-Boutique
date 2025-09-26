#!/usr/bin/env node

/**
 * Basic test runner for Glamour Locks
 * Run with: node src/scripts/run-tests.js
 */

const { testConfig, runBasicTests, validateEnvironment } = require('../lib/test-utils');

async function main() {
  console.log('🧪 Running Glamour Locks Basic Tests...\n');
  
  // Check environment first
  const envCheck = validateEnvironment();
  if (!envCheck.valid) {
    console.log('❌ Environment validation failed:');
    console.log('Missing variables:', envCheck.missing.join(', '));
    console.log('\nPlease set up your .env.local file with all required variables.\n');
    process.exit(1);
  }
  
  console.log('✅ Environment variables validated\n');
  
  // Run basic tests
  const results = await runBasicTests();
  
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%\n`);
  
  // Detailed results
  results.results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.test}: ${result.details}`);
  });
  
  if (results.failed > 0) {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed! Your application is ready for basic testing.');
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

main().catch(error => {
  console.error('❌ Test runner failed:', error.message);
  process.exit(1);
});



