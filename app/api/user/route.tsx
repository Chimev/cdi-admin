// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDB } from '@/utilis/connectToDb';
import User from '@/utilis/models/User';
import { authOptions } from '../auth/[...nextauth]/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Guard clause: Ensure the visitor is logged in
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized access' }, { status: 401 });
    }

    await connectToDB();

    // 2. Branch logic based on the role
    if (session.user.role === 'admin') {
      // Admins: Fetch ALL users from the database (excluding passwords for security)
      const allUsers = await User.find({}).select('-password');
      return NextResponse.json({ 
        role: 'admin', 
        data: allUsers 
      });
      
    } else {
      // Regular Users: ONLY fetch their own single account details
      const singleUser = await User.findById(session.user.id).select('-password');
      
      if (!singleUser) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({ 
        role: 'user', 
        data: singleUser 
      });
    }

  } catch (error) {
    console.error('Fetch Users Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
