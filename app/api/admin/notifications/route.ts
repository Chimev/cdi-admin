import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDB } from '@/utilis/connectToDb';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import Notification from '@/utilis/models/Notification';

// GET: Fetch notification history with server-side search and pagination
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10); // Default to 50 per page

    const query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    // Run both queries in parallel for performance
    const [notifications, totalCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(query)
    ]);

    return NextResponse.json({ 
      notifications,
      pagination: {
        total: totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit) || 1
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Trigger a new broadcast (Remains exactly the same)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();
    const { title, message, type } = await req.json();

    if (!title || !message || !type) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    // ============================================================================
    // 🚀 FUTURE EXPO PUSH NOTIFICATION INTEGRATION GOES HERE
    // ============================================================================

    const newNotification = await Notification.create({
      title,
      message,
      type,
      status: 'sent' 
    });

    return NextResponse.json({ message: 'Notification sent!', notification: newNotification }, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}