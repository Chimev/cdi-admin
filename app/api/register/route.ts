import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';import { connectToDB } from '@/utilis/connectToDb';
import User from '@/utilis/models/User';

export async function POST(req: Request) {
  try {
    await connectToDB();
    
    const { firstName, lastName, email, password } = await req.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields.' }, 
        { status: 400 }
      );
    }

    // Check if this admin email already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json(
        { message: 'An admin with this email already exists.' }, 
        { status: 409 }
      );
    }

    // Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new admin record
    await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'admin' // You can expand this later if you need super-admins
    });

    return NextResponse.json(
      { message: 'Admin account created successfully!' }, 
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { message: 'Internal server error.' }, 
      { status: 500 }
    );
  }
}