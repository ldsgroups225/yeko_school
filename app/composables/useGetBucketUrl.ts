// buckets.ts
/**
 * Enum of strongly typed buckets.
 *
 * These buckets are used for storing files in Supabase.
 */
export const BUCKET = {
  /**
   * Bucket for storing school images.
   */
  SCHOOL_IMAGE: 'school_images',
  /**
   * Bucket for storing user images.
   */
  USER_IMAGE: 'user_images',
} as const

/**
 * Type representing any bucket value.
 */
export type TBucket = typeof BUCKET[keyof typeof BUCKET]

/**
 * Composable function for generating bucket URLs.
 *
 * This function returns a new function that generates a URL for a file stored in a Supabase bucket.
 *
 * @returns {(supabaseUrl: string, bucket: TBucket, fileName: string) => string} Function to generate a bucket URL.
 */
export function useGetBucketUrl(): (supabaseUrl: string, bucket: TBucket, fileName: string) => string {
  /**
   * Generates a URL for a file stored in a Supabase bucket.
   *
   * @param {string} supabaseUrl Base URL of the Supabase instance.
   * @param {TBucket} bucket Name of the bucket (e.g., 'school_images').
   * @param {string} fileName Name of the file.
   *
   * @returns {string} Fully qualified URL for the file.
   */
  return (supabaseUrl: string, bucket: TBucket, fileName: string): string => {
    // Use template literals for string interpolation to improve readability.
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${fileName}`
  }
}

// Example usage:
// const getBucketUrl = useGetBucketUrl()
// const imageUrl = getBucketUrl('https://example.supabase.co', BUCKET.SCHOOL_IMAGE, 'image.jpg')
// console.log(imageUrl) // Outputs: https://example.supabase.co/storage/v1/object/public/school_images/image.jpg
