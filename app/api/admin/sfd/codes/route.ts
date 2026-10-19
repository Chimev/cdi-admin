import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDB } from '@/utilis/connectToDb';
import AccessCode from '@/utilis/models/AccessCode';

const generateRandomCode = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase(); 
};

// POST: Generate Bulk Codes (Remains the same)
export async function POST(req: Request) {
  // ... Keep your existing POST logic here ...
  try {
    await connectToDB();
    const { editionId, count, expirationDate } = await req.json();

    if (!editionId || !count || count < 1 || !expirationDate) {
      return NextResponse.json(
        { message: 'Edition ID, count, and expiration date are required.' }, 
        { status: 400 }
      );
    }

    const codesToInsert = Array.from({ length: count }).map(() => ({
      code: generateRandomCode(),
      editionId,
      isUsed: false,
      expiredAt: new Date(expirationDate), 
    }));

    const insertedCodes = await AccessCode.insertMany(codesToInsert);

    return NextResponse.json({ 
      message: `${count} codes generated successfully.`,
      codes: insertedCodes 
    }, { status: 201 });

  } catch (error) {
    console.error('Error generating codes:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

// GET: Fetch codes with Server-Side Search, Filter, and Pagination
export async function GET(req: Request) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const editionId = searchParams.get('editionId');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'All';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (!editionId) {
      return NextResponse.json({ message: 'Edition ID is required.' }, { status: 400 });
    }

    // 1. Build the Database Query based on filters
    const query: any = { editionId };

    if (status === 'Used') query.isUsed = true;
    else if (status === 'Unused') query.isUsed = false;

    // Search by the exact or partial Access Code
    if (search) {
      query.code = { $regex: search,$options: 'i' }; 
    }

    // 2. Fetch the paginated results
    const skip = (page - 1) * limit;
    const [codes, filteredCount] = await Promise.all([
      AccessCode.find(query)
        .populate('usedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AccessCode.countDocuments(query)
    ]);

    // 3. Fetch Global Stats for the top cards (ignores search/status filters)
    const [totalGenerated, totalUsed] = await Promise.all([
      AccessCode.countDocuments({ editionId }),
      AccessCode.countDocuments({ editionId, isUsed: true })
    ]);

    return NextResponse.json({ 
      codes, 
      pagination: {
        total: filteredCount,
        page,
        totalPages: Math.ceil(filteredCount / limit)
      },
      stats: {
        total: totalGenerated,
        used: totalUsed,
        unused: totalGenerated - totalUsed
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching codes:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}