import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDB } from '@/utilis/connectToDb';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import Notification from '@/utilis/models/Notification';
import { sendPushToAll } from '@/utilis/push';

// Which screen the app opens when the notification is tapped
const TAP_TARGETS: Record<string, { type: string }> = {
  'General Broadcast': { type: 'broadcast' },
  'Event Reminder': { type: 'event' },
  'SFD Update': { type: 'sfd-today' },
};

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
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

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

// POST: Send a broadcast to every member's phone and save it to history
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

    if (!TAP_TARGETS[type]) {
      return NextResponse.json({ message: 'Invalid notification type.' }, { status: 400 });
    }

    // Send the push; a failure here is recorded, not thrown
    let status = 'sent';
    let sentCount = 0;

    try {
      const result = await sendPushToAll({
        title,
        body: message,
        data: TAP_TARGETS[type],
      });
      sentCount = result.sent;
      if (sentCount === 0) status = 'no-recipients';
    } catch (pushError) {
      console.error('Broadcast push error:', pushError);
      status = 'failed';
    }

    // Always save to history, so the admin can see what happened
    const newNotification = await Notification.create({
      title,
      message,
      type,
      status,
      sentCount,
    });

    const responseMessage =
      status === 'sent'
        ? `Notification sent to ${sentCount} device${sentCount === 1 ? '' : 's'}!`
        : status === 'no-recipients'
          ? 'Saved, but no devices are registered for notifications yet.'
          : 'Saved, but the notification could not be delivered. Please try again.';

    return NextResponse.json(
      { message: responseMessage, notification: newNotification },
      { status: status === 'failed' ? 502 : 201 }
    );
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}