import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDB } from '@/utilis/connectToDb';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import SfdContent from '@/utilis/models/SfdContent';

// PATCH: Update an existing daily devotional reading
export async function PATCH(
  req: Request, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized. Admin access required.' }, 
        { status: 401 }
      );
    }

    await connectToDB();
    
    // 1. Await the params to resolve the Next.js sync-dynamic-apis error
    const params = await context.params;
    const { id } = params;
    
    const body = await req.json();
    const { 
      date, 
      topic, 
      subStatement, 
      content, 
      prayer 
    } = body;

    if (!date || !topic || !subStatement || !content || !prayer) {
      return NextResponse.json(
        { message: 'Missing required fields.' }, 
        { status: 400 }
      );
    }

    // 2. Update the document using returnDocument: 'after' to clear the Mongoose warning
    const updatedDailyContent = await SfdContent.findByIdAndUpdate(
      id,
      {
        date: new Date(date),
        topic,
        subStatement,
        content,
        prayer
      },
      { returnDocument: 'after', runValidators: true } 
    );

    if (!updatedDailyContent) {
      return NextResponse.json(
        { message: 'Reading not found.' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Daily reading updated successfully!', content: updatedDailyContent }, 
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error updating SFD Content:', error);
    
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