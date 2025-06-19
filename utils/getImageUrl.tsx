import { supabase } from '@/SupabaseConfig';

/**
 * Generates a signed URL for a private file in Supabase Storage.
 * @param bucket - The name of the bucket (e.g. 'images')
 * @param filePath - The path to the file (e.g. '1750271482017.jpg')
 * @param expiresIn - Expiration in seconds (default: 60)
 * @returns Signed URL as string or null if failed
 */

export async function getSignedImageUrl(
    bucket: string,
    filePath: string,
    expiresIn: number = 60
): Promise<string | null> {
    const { data, error } = await supabase
        .storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn);

    if (error) {
        console.error('Failed to get signed URL:', error.message);
        return null;
    }

    return data?.signedUrl || null;
}
