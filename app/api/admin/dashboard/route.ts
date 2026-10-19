import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDB } from '@/utilis/connectToDb';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

// Import your existing models
import SfdEdition from '@/utilis/models/SfdEdition';
import AccessCode from '@/utilis/models/AccessCode';
import Testimony from '@/utilis/models/Testimony';
import Event from '@/utilis/models/Event';
import Notification from '@/utilis/models/Notification';
import User from '@/utilis/models/User'; // <-- Added User model

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    // Run all database counts in parallel for maximum speed
    const [
      totalUsers, // <-- Added this
      totalEditions,
      totalCodes,
      unusedCodes,
      totalTestimonies,
      totalEvents,
      totalNotifications
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }), // <-- Counts ONLY regular users
      SfdEdition.countDocuments(),
      AccessCode.countDocuments(),
      AccessCode.countDocuments({ isUsed: false }),
      Testimony.countDocuments(),
      Event.countDocuments(),
      Notification.countDocuments()
    ]);

    return NextResponse.json({ 
      stats: {
        users: totalUsers, // <-- Replaced the 1245 placeholder
        editions: totalEditions,
        codesTotal: totalCodes,
        codesUnused: unusedCodes,
        testimonies: totalTestimonies,
        events: totalEvents,
        notifications: totalNotifications
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}