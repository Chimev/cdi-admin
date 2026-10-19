import { deleteCloudinaryImage } from '@/utilis/cloudinary';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { publicId } = await req.json();

        if (!publicId) {
            return NextResponse.json({ success: true });
        }

        await deleteCloudinaryImage(publicId);

        return NextResponse.json({ success: true }, { status: 200 });
        
    } catch (error) {
        console.error("Cloudinary Cleanup Error:", error);
        return NextResponse.json({ error: 'Failed to clean up images' }, { status: 500 });
    }
}