# Search History Setup Guide

This guide explains how to set up and use the new search history feature for your AI Repository Explainer app.

## What's New

The app now automatically saves user search history when they search for repositories. Users can:
- View their search history
- See previous explanations
- Clear individual searches or all history
- Access their history across sessions

## Database Setup

### 1. Create Database Tables

Run the database initialization script to create the required tables:

```bash
pnpm db:init
```

This will create the `user_search_history` table with the following schema:
- `id`: Unique identifier for each search
- `user_id`: Clerk user ID
- `repo_url`: GitHub repository URL
- `repo_name`: Repository name
- `repo_owner`: Repository owner
- `search_date`: When the search was performed
- `explanation`: AI-generated explanation
- `metadata`: JSON data including stars, forks, etc.

### 2. Verify Database Connection

Make sure your `.env.development.local` file contains the correct `DATABASE_URL` from Neon.

## How It Works

### Automatic History Saving

When a user searches for a repository:
1. The app generates an AI explanation
2. If the user is signed in, the search is automatically saved to their history
3. The history includes the repository details, explanation, and metadata

### Search History Display

The search history appears below the input form in the chat interface:
- Shows the last 50 searches
- Displays repository name, owner, and search date
- Shows a preview of the explanation
- Includes repository stats (stars, forks)
- Allows users to clear all history

### API Endpoints

- `GET /api/search-history` - Retrieve user's search history
- `POST /api/search-history` - Save a new search to history
- `DELETE /api/search-history` - Clear search history

## User Experience

### For Signed-In Users
- All repository searches are automatically saved
- Can view their complete search history
- Can clear individual searches or all history
- History persists across sessions

### For Anonymous Users
- No search history is saved
- Can still use the app normally
- Will see a prompt to sign in to save history

## Technical Implementation

### Database Service (`lib/services/database.ts`)
- Handles all database operations
- Uses Neon serverless driver
- Includes proper error handling and logging

### Search History Component (`app/components/SearchHistory.tsx`)
- Displays user's search history
- Handles loading states and errors
- Provides clear history functionality

### API Integration
- Modified `/api/explain` to save search history
- New `/api/search-history` endpoint for history operations
- Integrated with Clerk authentication

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Verify `DATABASE_URL` in environment variables
   - Check if Neon database is accessible
   - Run `pnpm db:init` to create tables

2. **Search history not saving**
   - Ensure user is signed in with Clerk
   - Check browser console for errors
   - Verify API endpoints are working

3. **History not displaying**
   - Check if user is authenticated
   - Verify database has data
   - Check browser network tab for API calls

### Debugging

- Check browser console for JavaScript errors
- Monitor network requests in browser dev tools
- Check server logs for database errors
- Verify Clerk authentication is working

## Future Enhancements

Potential improvements for the search history feature:
- Search and filter history
- Export history to different formats
- Share specific explanations
- Favorite/bookmark searches
- Search history analytics

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review browser console and network logs
3. Verify database connection and tables
4. Ensure all environment variables are set correctly
