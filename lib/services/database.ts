import { neon } from '@neondatabase/serverless';
import { RepoMetadata } from '@/types/api';

// Database connection function
function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(url);
}

// User search history table schema
export interface UserSearchHistory {
  id: string;
  userId: string; // Clerk user ID
  repoUrl: string;
  repoName: string;
  repoOwner: string;
  searchDate: Date | string; // Can be Date object or ISO string from database
  explanation: string;
  metadata: RepoMetadata; // Repository metadata
}

// Create the user_search_history table
export async function createTables() {
  try {
    const sql = getSql();
    
    // Create table
    await sql`
      CREATE TABLE IF NOT EXISTS user_search_history (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        repo_url TEXT NOT NULL,
        repo_name VARCHAR(255) NOT NULL,
        repo_owner VARCHAR(255) NOT NULL,
        search_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        explanation TEXT NOT NULL,
        metadata JSONB,
        UNIQUE(user_id, repo_url)
      )
    `;
    
    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_user_search_history_user_id ON user_search_history(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_search_history_search_date ON user_search_history(search_date)`;
    
    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

// Save a new search to user history
export async function saveSearchHistory(
  userId: string,
  repoUrl: string,
  repoName: string,
  repoOwner: string,
  explanation: string,
  metadata: RepoMetadata
): Promise<void> {
  try {
    const sql = getSql();
    await sql`
      INSERT INTO user_search_history (user_id, repo_url, repo_name, repo_owner, explanation, metadata)
      VALUES (${userId}, ${repoUrl}, ${repoName}, ${repoOwner}, ${explanation}, ${metadata})
      ON CONFLICT (user_id, repo_url) 
      DO UPDATE SET 
        search_date = NOW(),
        explanation = EXCLUDED.explanation,
        metadata = EXCLUDED.metadata
    `;
  } catch (error) {
    console.error('Error saving search history:', error);
    throw error;
  }
}

// Get user's search history
export async function getUserSearchHistory(userId: string): Promise<UserSearchHistory[]> {
  try {
    const sql = getSql();
    
    const results = await sql`
      SELECT * FROM user_search_history 
      WHERE user_id = ${userId}
      ORDER BY search_date DESC
      LIMIT 50
    `;
    
    return results.map((row: Record<string, any>) => ({
      id: row.id,
      userId: row.user_id,
      repoUrl: row.repo_url, // Map snake_case to camelCase
      repoName: row.repo_name, // Map snake_case to camelCase
      repoOwner: row.repo_owner, // Map snake_case to camelCase
      searchDate: row.search_date, // Keep as string, let component handle conversion
      explanation: row.explanation,
      metadata: row.metadata || {} as RepoMetadata
    }));
  } catch (error) {
    console.error('Error fetching user search history:', error);
    throw error;
  }
}

// Delete a specific search from history
export async function deleteSearchHistory(userId: string, searchId: string): Promise<void> {
  try {
    const sql = getSql();
    await sql`
      DELETE FROM user_search_history 
      WHERE id = ${searchId} AND user_id = ${userId}
    `;
  } catch (error) {
    console.error('Error deleting search history:', error);
    throw error;
  }
}

// Clear all search history for a user
export async function clearUserSearchHistory(userId: string): Promise<void> {
  try {
    const sql = getSql();
    await sql`
      DELETE FROM user_search_history 
      WHERE user_id = ${userId}
    `;
  } catch (error) {
    console.error('Error clearing user search history:', error);
    throw error;
  }
}
