import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDB } from '@/utilis/connectToDb';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import Testimony from '@/utilis/models/Testimony';

// PATCH: Update an existing testimony
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();
    const params = await context.params;
    const { id } = params;
    
    const { title, author, body } = await req.json();

    if (!title || !body) {
      return NextResponse.json({ message: 'Title and body are required.' }, { status: 400 });
    }

    const updatedTestimony = await Testimony.findByIdAndUpdate(
      id,
      { title, author: author || 'Anonymous', body },
      { returnDocument: 'after' }
    );

    if (!updatedTestimony) {
      return NextResponse.json({ message: 'Testimony not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Testimony updated!', testimony: updatedTestimony }, { status: 200 });
  } catch (error) {
    console.error('Error updating testimony:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove a testimony
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();
    const params = await context.params;
    const { id } = params;

    const deletedTestimony = await Testimony.findByIdAndDelete(id);

    if (!deletedTestimony) {
      return NextResponse.json({ message: 'Testimony not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Testimony deleted successfully!' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting testimony:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}