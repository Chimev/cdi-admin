import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDB } from '@/utilis/connectToDb';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import Event from '@/utilis/models/Event';
import { deleteCloudinaryImage } from '@/utilis/cloudinary'; // <-- IMPORT YOUR UTILITY

// PATCH: Update an existing event
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();
    const params = await context.params;
    const { id } = params;
    
    const body = await req.json();
    const { name, date, startTime, endTime, location, description, image, externalLink, status } = body;

    if (!name || !date || !startTime || !location || !description) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    // 1. Fetch the existing event FIRST so we can check if the image changed
    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      return NextResponse.json({ message: 'Event not found.' }, { status: 404 });
    }

    // 2. Check if they uploaded a NEW image, and if so, delete the OLD one from Cloudinary
    if (
      existingEvent.image?.publicId && 
      image?.publicId !== existingEvent.image.publicId
    ) {
      try {
        await deleteCloudinaryImage(existingEvent.image.publicId);
      } catch (cloudinaryError) {
        console.error("Failed to clean up old image on update:", cloudinaryError);
        // We log the error but don't stop the database update
      }
    }

    // 3. Update the document in MongoDB
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        name,
        date: new Date(date),
        startTime,
        endTime,
        location,
        description,
        image: image || null,
        externalLink,
        status
      },
      { returnDocument: 'after' } 
    );

    return NextResponse.json({ message: 'Event updated successfully!', event: updatedEvent }, { status: 200 });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove an event
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();
    const params = await context.params;
    const { id } = params;

    // 1. Delete the event from MongoDB and capture the deleted document
    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return NextResponse.json({ message: 'Event not found.' }, { status: 404 });
    }

    // 2. If the deleted event had an image, destroy it on Cloudinary
    if (deletedEvent.image?.publicId) {
      try {
        await deleteCloudinaryImage(deletedEvent.image.publicId);
      } catch (cloudinaryError) {
        console.error("Failed to delete image from Cloudinary:", cloudinaryError);
        // Even if Cloudinary fails, the DB document is already deleted, so we return a success response below.
      }
    }

    return NextResponse.json({ message: 'Event deleted successfully!' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}