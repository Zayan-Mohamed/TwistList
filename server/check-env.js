// Diagnostic script to check environment variables in Railway
console.log('=== Environment Variable Check ===');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL value:', process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 30)}...` : 'EMPTY');
console.log('\nAll DATABASE-related env vars:');
Object.keys(process.env)
  .filter(key => key.includes('DATABASE') || key.includes('POSTGRES'))
  .forEach(key => {
    const value = process.env[key];
    console.log(`  ${key}:`, value ? `${value.substring(0, 40)}...` : 'EMPTY');
  });
console.log('\n=== End Check ===');
