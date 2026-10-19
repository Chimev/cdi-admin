// utilis/uploadImage.ts

export const uploadImageToCloudinary = async (
  file: File, 
  folderName: string = 'cdi'
): Promise<{ url: string; publicId: string } | null> => {
  try {
    // 1. Get the signature, timestamp, and API key from your backend
    const signRes = await fetch('/api/cloudinary/cloudinary-sign', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: folderName })
    });
    
    if (!signRes.ok) throw new Error('Failed to get Cloudinary signature');
    
    const { signature, timestamp, folder, api_key } = await signRes.json();
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    // 2. Build the form data with signed parameters
    const formData = new FormData();
    formData.append('file', file);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('api_key', api_key);
    formData.append('folder', folder);

    // 3. Upload the file to Cloudinary
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    
    if (data.secure_url && data.public_id) {
      return { url: data.secure_url, publicId: data.public_id };
    }
    
    return null;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};