import { config } from 'dotenv';
import { createTables } from '../lib/services/database';
import { ensureUserTables } from '../lib/services/users';
import { ensureRateLimitTable } from '../lib/services/rateLimit';

// Load environment variables
config({ path: '.env' });

async function initDatabase() {
  try {
    console.log('Initializing database...');
    
    // Create user tables (for authentication)
    console.log('Creating user tables...');
    await ensureUserTables();
    
    // Create search history tables
    console.log('Creating search history tables...');
    await createTables();
    
    // Create rate limit table
    console.log('Creating rate limit table...');
    await ensureRateLimitTable();
    
    console.log('Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

initDatabase();
