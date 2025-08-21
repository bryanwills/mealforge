const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read the environment variables from the web app
const envPath = path.join(__dirname, 'apps', 'web', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found at:', envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = envContent
  .split('\n')
  .filter(line => line.includes('=') && !line.startsWith('#'))
  .reduce((acc, line) => {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').replace(/"/g, '');
    acc[key] = value;
    return acc;
  }, {});

// Set environment variables
Object.assign(process.env, envVars);

console.log('🔄 Setting up database schema...');

exec('npx prisma db push', { 
  cwd: __dirname,
  env: { ...process.env, ...envVars }
}, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error setting up database:', error.message);
    return;
  }
  if (stderr) {
    console.error('⚠️  Warning:', stderr);
  }
  console.log('✅ Database setup completed!');
  console.log(stdout);
  
  console.log('\n🔄 Now restoring your recipe data...');
  
  // Run the restore script
  exec('node scripts/restore-data.js', {
    cwd: __dirname,
    env: { ...process.env, ...envVars }
  }, (restoreError, restoreStdout, restoreStderr) => {
    if (restoreError) {
      console.error('❌ Error restoring data:', restoreError.message);
      return;
    }
    if (restoreStderr) {
      console.error('⚠️  Warning:', restoreStderr);
    }
    console.log(restoreStdout);
    console.log('\n🎉 Setup complete! Your web app is ready to test.');
  });
});