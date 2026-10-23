import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { connectToDB } from '@/utilis/connectToDb';
import SfdEdition from '@/utilis/models/SfdEdition';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

// POST: Create a new SFD Edition
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
      title, 
      theme, 
      startMonth, 
      endMonth, 
      year, 
      coverImage,
      price 
    } = body;

    if (!title || !startMonth || !endMonth || !year || !coverImage?.url || !coverImage?.publicId || price === undefined) {
      return NextResponse.json(
        { message: 'Missing required fields.' }, 
        { status: 400 }
      );
    }

    // New editions start unpublished; members are notified when it's published
    const newEdition = await SfdEdition.create({
      title,
      theme,
      startMonth,
      endMonth,
      year,
      coverImage, 
      price,
      isPublished: false 
    });

    return NextResponse.json(
      { message: 'Edition created successfully!', edition: newEdition }, 
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error creating SFD Edition:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'An edition for this exact period already exists.' }, 
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error.' }, 
      { status: 500 }
    );
  }
}

// GET: Fetch all SFD Editions for the Admin Dashboard
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

    const editions = await SfdEdition.find({})
      .sort({ year: -1, startMonth: -1 });

    return NextResponse.json({ editions }, { status: 200 });

  } catch (error) {
    console.error('Error fetching SFD Editions:', error);
    return NextResponse.json(
      { message: 'Internal server error.' }, 
      { status: 500 }
    );
  }
}