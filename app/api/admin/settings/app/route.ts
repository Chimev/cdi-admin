import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDB } from '@/utilis/connectToDb';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import AppSetting from '@/utilis/models/AppSetting';

export async function GET() {
  try {
    await connectToDB();
    let settings = await AppSetting.findOne({});
    if (!settings) {
      settings = await AppSetting.create({}); // Create defaults if none exist
    }
    return NextResponse.json({ settings }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching settings' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();
    const body = await req.json();

    const updatedSettings = await AppSetting.findOneAndUpdate(
      {}, // Match any (since there's only one)
      { $set: body },
      { new: true, upsert: true, returnDocument: 'after' }
    );

    return NextResponse.json({ message: 'Settings updated!', settings: updatedSettings }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating settings' }, { status: 500 });
  }
}