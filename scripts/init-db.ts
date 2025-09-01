import { config } from 'dotenv';
import { createTables } from '../lib/services/database';

// Load environment variables
config({ path: '.env.development.local' });

async function initDatabase() {
  try {
    console.log('Initializing database...');
    await createTables();
    console.log('Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

initDatabase();
