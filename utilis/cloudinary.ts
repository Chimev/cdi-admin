import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export function generateCloudinarySignature(folderName: string) {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder: folderName },
        process.env.CLOUDINARY_API_SECRET as string
    );
    return { timestamp, signature };
}

// NEW: The Delete Function
export async function deleteCloudinaryImage(publicId: string) {
    try {
        // This tells Cloudinary's servers to permanently destroy the file
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("Cloudinary deletion result:", result);
        return result;
    } catch (error) {
        console.error("Failed to delete from Cloudinary:", error);
        throw error;
    }
}