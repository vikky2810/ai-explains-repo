import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getUserActivity } from '@/lib/services/database';
import { findUserByEmail } from '@/lib/services/users';

// GET: account details and usage stats for the signed-in user
export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [user, activity] = await Promise.all([
      findUserByEmail(email),
      getUserActivity(email),
    ]);

    // Count languages across analysed repos, most frequent first
    const languageCounts = new Map<string, number>();
    for (const item of activity) {
      if (!item.language) continue;
      languageCounts.set(item.language, (languageCounts.get(item.language) ?? 0) + 1);
    }
    const languages = [...languageCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      user: {
        email,
        name: session.user?.name ?? null,
        image: session.user?.image ?? null,
        memberSince: user?.created_at ?? null,
        // Only Google sessions carry a profile picture; the credentials provider
        // returns just id and email. The users row can't tell us, because an
        // account can have a password and also sign in with Google.
        signInMethod: session.user?.image ? 'google' : 'password',
      },
      stats: {
        totalAnalyses: activity.length,
        owners: new Set(activity.map((item) => item.repoOwner)).size,
        lastAnalysis: activity[0]?.searchDate ?? null,
        languages,
      },
      recent: activity.slice(0, 6),
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}
