import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDB } from '@/utilis/connectToDb';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import Testimony from '@/utilis/models/Testimony';
import { sendPushToAll } from '@/utilis/push';

const PREVIEW_LENGTH = 100;

// GET: Fetch all testimonies (with server-side search)
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
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } }
      ];
    }

    const testimonies = await Testimony.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ testimonies }, { status: 200 });
  } catch (error) {
    console.error('Error fetching testimonies:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Add a new testimony and notify members
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

    try {
      const text = String(body).trim();
      const preview =
        text.length > PREVIEW_LENGTH
          ? `${text.slice(0, PREVIEW_LENGTH).trim()}...`
          : text;

      await sendPushToAll({
        title: `New testimony: ${newTestimony.title}`,
        body: preview,
        data: { type: 'testimony', id: newTestimony._id.toString() },
      });
    } catch (error) {
      console.error('Testimony push error:', error);
    }

    return NextResponse.json({ message: 'Testimony published!', testimony: newTestimony }, { status: 201 });
  } catch (error) {
    console.error('Error creating testimony:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}