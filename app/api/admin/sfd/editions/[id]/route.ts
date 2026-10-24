import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDB } from '@/utilis/connectToDb';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import SfdEdition from '@/utilis/models/SfdEdition';
import { notifyAll, sendPushToAll } from '@/utilis/push';

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
    
    const { id } = await context.params;
    const { isPublished } = await req.json();

    if (typeof isPublished !== 'boolean') {
      return NextResponse.json({ message: 'Invalid status.' }, { status: 400 });
    }

    // Read the current status first, so we know if this is a new publish
    const existingEdition = await SfdEdition.findById(id);
    if (!existingEdition) {
      return NextResponse.json({ message: 'Edition not found.' }, { status: 404 });
    }

    const justPublished = !existingEdition.isPublished && isPublished;

    const updatedEdition = await SfdEdition.findByIdAndUpdate(
      id,
      { isPublished },
      { returnDocument: 'after' } 
    );

    if (justPublished) {
      try {
        await notifyAll({
          title: 'New SFD edition available',
          body: `${updatedEdition.title} is now available in the CDI app.`,
          data: { type: 'sfd-edition', id: updatedEdition._id.toString() },
          type: 'SFD Update',
        });
      } catch (error) {
        console.error('Edition push error:', error);
      }
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