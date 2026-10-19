import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDB } from '@/utilis/connectToDb';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import Testimony from '@/utilis/models/Testimony';

// GET: Fetch all testimonies (with server-side search)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    // Extract search query from URL
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    // Build the query object
    const query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch matching testimonies, newest first
    const testimonies = await Testimony.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ testimonies }, { status: 200 });
  } catch (error) {
    console.error('Error fetching testimonies:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Add a new testimony (Remains unchanged)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();
    const { title, author, body } = await req.json();

    if (!title || !body) {
      return NextResponse.json({ message: 'Title and body are required.' }, { status: 400 });
    }

    const newTestimony = await Testimony.create({
      title,
      author: author || 'Anonymous',
      body,
    });

    return NextResponse.json({ message: 'Testimony published!', testimony: newTestimony }, { status: 201 });
  } catch (error) {
    console.error('Error creating testimony:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}