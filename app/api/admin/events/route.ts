import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDB } from '@/utilis/connectToDb';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import Event from '@/utilis/models/Event';

// GET: Fetch all events (with server-side search)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort by event date (newest first, so upcoming events are easily visible)
    const events = await Event.find(query).sort({ date: -1 });

    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new event
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();
    const body = await req.json();
    
    const { name, date, startTime, endTime, location, description, image, externalLink, status } = body;

    if (!name || !date || !startTime || !location || !description) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    const newEvent = await Event.create({
      name,
      date: new Date(date),
      startTime,
      endTime,
      location,
      description,
      image: image || null, // Will be null or { url, publicId }
      externalLink,
      status: status || 'published'
    });

    return NextResponse.json({ message: 'Event created successfully!', event: newEvent }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}