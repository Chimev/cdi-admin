import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDB } from '@/utilis/connectToDb';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import SfdContent from '@/utilis/models/SfdContent';

// POST: Add a new daily devotional reading
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized. Admin access required.' }, 
        { status: 401 }
      );
    }

    await connectToDB();
    
    const body = await req.json();
    const { 
      editionId, 
      date, 
      topic, 
      subStatement, 
      content, 
      prayer 
    } = body;

    if (!editionId || !date || !topic || !subStatement || !content || !prayer) {
      return NextResponse.json(
        { message: 'Missing required fields.' }, 
        { status: 400 }
      );
    }

    const newDailyContent = await SfdContent.create({
      editionId,
      date: new Date(date), // Ensure it is properly cast to a Date object
      topic,
      subStatement,
      content,
      prayer
    });

    return NextResponse.json(
      { message: 'Daily reading added successfully!', content: newDailyContent }, 
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error adding SFD Content:', error);
    
    // Catch Mongoose unique constraint error for duplicate dates in the same edition
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'A devotional reading for this exact date already exists in this edition.' }, 
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error.' }, 
      { status: 500 }
    );
  }
}

// GET: Fetch all daily readings for a specific Edition
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized. Admin access required.' }, 
        { status: 401 }
      );
    }

    await connectToDB();

    // Extract editionId from the query string (e.g., ?editionId=123xyz)
    const { searchParams } = new URL(req.url);
    const editionId = searchParams.get('editionId');

    if (!editionId) {
      return NextResponse.json(
        { message: 'Edition ID is required.' }, 
        { status: 400 }
      );
    }

    // Fetch all content for this edition, sorted chronologically
    const dailyReadings = await SfdContent.find({ editionId })
      .sort({ date: 1 }); // 1 for ascending (start of month to end of month)

    return NextResponse.json({ dailyReadings }, { status: 200 });

  } catch (error) {
    console.error('Error fetching SFD Content:', error);
    return NextResponse.json(
      { message: 'Internal server error.' }, 
      { status: 500 }
    );
  }
}