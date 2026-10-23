import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDB } from '@/utilis/connectToDb';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import Event from '@/utilis/models/Event';
import { deleteCloudinaryImage } from '@/utilis/cloudinary';
import { sendPushToAll } from '@/utilis/push';

// PATCH: Update an existing event
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();
    const { id } = await context.params;
    
    const body = await req.json();
    const { name, date, startTime, endTime, location, description, image, externalLink, status } = body;

    if (!name || !date || !startTime || !location || !description) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    // 1. Fetch the existing event FIRST so we can check what changed
    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      return NextResponse.json({ message: 'Event not found.' }, { status: 404 });
    }

    const justPublished =
      existingEvent.status !== 'published' && status === 'published';

    // 2. If a NEW image was uploaded, delete the OLD one from Cloudinary
    if (
      existingEvent.image?.publicId && 
      image?.publicId !== existingEvent.image.publicId
    ) {
      try {
        await deleteCloudinaryImage(existingEvent.image.publicId);
      } catch (cloudinaryError) {
        console.error("Failed to clean up old image on update:", cloudinaryError);
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

    // 4. Notify members only when a draft is published for the first time
    if (justPublished) {
      try {
        const dateText = new Date(updatedEvent.date).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          timeZone: 'UTC',
        });
        await sendPushToAll({
          title: `New event: ${updatedEvent.name}`,
          body: `${dateText} · ${updatedEvent.location}`,
          data: { type: 'event', id: updatedEvent._id.toString() },
        });
      } catch (error) {
        console.error('Event push error:', error);
      }
    }

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
    const { id } = await context.params;

    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return NextResponse.json({ message: 'Event not found.' }, { status: 404 });
    }

    if (deletedEvent.image?.publicId) {
      try {
        await deleteCloudinaryImage(deletedEvent.image.publicId);
      } catch (cloudinaryError) {
        console.error("Failed to delete image from Cloudinary:", cloudinaryError);
      }
    }

    return NextResponse.json({ message: 'Event deleted successfully!' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}