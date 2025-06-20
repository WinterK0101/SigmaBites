import {supabase} from "@/SupabaseConfig";

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
