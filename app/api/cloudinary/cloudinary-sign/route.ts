import { generateCloudinarySignature } from "@/utilis/cloudinary";
import { NextResponse } from "next/server"; 

export async function POST(req: Request) {
    try {
        const { folder } = await req.json();
        const folderName = folder || 'general';

        // NOW you are using your utility function!
        const { timestamp, signature } = generateCloudinarySignature(folderName);

        return NextResponse.json({ 
            timestamp, 
            signature, 
            folder: folderName,
            api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to sign upload' }, { status: 500 });
    }
}