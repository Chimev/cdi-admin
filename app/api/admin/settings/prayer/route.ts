import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDB } from '@/utilis/connectToDb';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import PrayerSlot from '@/utilis/models/PrayerSlot';

export async function GET() {
  try {
    await connectToDB();
    const slots = await PrayerSlot.find({});
    return NextResponse.json({ slots }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching slots' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();
    const { slots } = await req.json(); // Expecting an array of slots

    if (!Array.isArray(slots)) {
      return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
    }

    // Prepare Bulk Operations (Upsert: Update if exists, Insert if it doesn't)
    const bulkOps = slots.map((slot: any) => ({
      updateOne: {
        filter: { slotId: slot.id },
        update: { $set: { label: slot.label, link: slot.link } },
        upsert: true
      }
    }));

    await PrayerSlot.bulkWrite(bulkOps);

    return NextResponse.json({ message: 'Prayer slots updated successfully!' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating slots' }, { status: 500 });
  }
}