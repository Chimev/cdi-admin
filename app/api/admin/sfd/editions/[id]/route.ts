import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDB } from '@/utilis/connectToDb';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import SfdEdition from '@/utilis/models/SfdEdition';

export async function PATCH(
  req: Request, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    await connectToDB();
    
    const params = await context.params;
    const { id } = params;
    
    const { isPublished } = await req.json();

    if (typeof isPublished !== 'boolean') {
      return NextResponse.json({ message: 'Invalid status.' }, { status: 400 });
    }

    const updatedEdition = await SfdEdition.findByIdAndUpdate(
      id,
      { isPublished },
      { returnDocument: 'after' } 
    );

    if (!updatedEdition) {
      return NextResponse.json({ message: 'Edition not found.' }, { status: 404 });
    }

    return NextResponse.json(
      { message: `Edition ${isPublished ? 'published' : 'unpublished'} successfully!`, edition: updatedEdition }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating edition status:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}