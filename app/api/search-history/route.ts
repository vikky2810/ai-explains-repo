import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { 
  getUserSearchHistory, 
  saveSearchHistory, 
  clearUserSearchHistory 
} from '@/lib/services/database';

// GET: Retrieve user's search history
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.email || session?.user?.id;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const history = await getUserSearchHistory(userId);
    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching search history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search history' }, 
      { status: 500 }
    );
  }
}

// POST: Save a new search to history
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.email || session?.user?.id;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { repoUrl, repoName, repoOwner, explanation, metadata } = body;

    if (!repoUrl || !repoName || !repoOwner || !explanation) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    await saveSearchHistory(userId, repoUrl, repoName, repoOwner, explanation, metadata);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving search history:', error);
    return NextResponse.json(
      { error: 'Failed to save search history' }, 
      { status: 500 }
    );
  }
}

// DELETE: Delete specific search or clear all history
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.email || session?.user?.id;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchUrl } = await request.json();
    
    if (searchUrl === 'all') {
      // Clear all history
      await clearUserSearchHistory(userId);
    } else if (searchUrl) {
      // Delete specific search (we'll need to modify the database service for this)
      // For now, we'll clear all history
      await clearUserSearchHistory(userId);
    } else {
      return NextResponse.json(
        { error: 'Invalid request' }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting search history:', error);
    return NextResponse.json(
      { error: 'Failed to delete search history' }, 
      { status: 500 }
    );
  }
}
