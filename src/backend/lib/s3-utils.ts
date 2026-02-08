import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION || "ap-southeast-2";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const primaryBucketName = process.env.AWS_S3_BUCKET_NAME || "amzn-s3-scooter-bucket";
const backupBucketName = process.env.AWS_S3_BACKUP_BUCKET_NAME || "scooter-rental-backups-managed-by-aws";

console.log("--- S3 INITIALIZATION ---");
console.log("Region:", region);
console.log("Primary Bucket:", primaryBucketName);
console.log("Access Key Present:", !!accessKeyId);
console.log("------------------------");

const s3Client = new S3Client({
    region,
    ...(accessKeyId && secretAccessKey ? {
        credentials: {
            accessKeyId,
            secretAccessKey,
        }
    } : {}),
});

/**
 * Uploads a file buffer to S3.
 * @param buffer - File content as buffer
 * @param key - Destination key in S3
 * @param contentType - MIME type of the file
 * @returns - The URL of the uploaded object
 */
async function uploadToS3(buffer: Buffer, key: string, contentType: string, bucketName: string): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
    });

    await s3Client.send(command);
    return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}

/**
 * Uploads a scooter photo to both primary and backup S3 buckets.
 * @param imageBase64 - Base64 encoded image string
 * @param fileName - Target file name
 * @returns - The URL of the photo in the primary bucket
 */
export async function uploadScooterPhoto(imageBase64: string, fileName: string): Promise<string> {
    // More robust base64 stripping
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const buffer = Buffer.from(base64Data, 'base64');

    // Extract content type from base64 string or default to image/jpeg
    const contentTypeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
    const contentType = contentTypeMatch ? contentTypeMatch[1] : 'image/jpeg';

    const key = `scooters/${Date.now()}_${fileName}`;

    // Upload to primary bucket
    const primaryUrl = await uploadToS3(buffer, key, contentType, primaryBucketName);

    // Upload to backup bucket asynchronously (best effort)
    uploadToS3(buffer, key, contentType, backupBucketName).catch(err => {
        console.error(`Failed to upload backup to S3: ${err.message}`);
    });

    return primaryUrl;
}
/**
 * Uploads an agreement PDF to the 'pdf' folder in S3.
 * @param pdfBase64 - Base64 encoded PDF string
 * @param bookingId - The booking ID to use in the filename
 * @returns - The URL of the uploaded PDF
 */
export async function uploadAgreementPdf(pdfBase64: string, bookingId: string): Promise<string> {
    // More robust base64 stripping (handles variations in jspdf output)
    const base64Data = pdfBase64.includes(',') ? pdfBase64.split(',')[1] : pdfBase64;
    const buffer = Buffer.from(base64Data, 'base64');

    const key = `pdf/${bookingId}_agreement.pdf`;
    const contentType = 'application/pdf';

    // Upload to primary bucket
    return await uploadToS3(buffer, key, contentType, primaryBucketName);
}
/**
 * Uploads a host-related document (like NIC photo) to the 'hosts' folder in S3.
 * @param base64DataString - Base64 encoded file string
 * @param fileName - Target file name
 * @returns - The URL of the uploaded document
 */
export async function uploadHostDocument(base64DataString: string, fileName: string): Promise<string> {
    const base64Data = base64DataString.includes(',') ? base64DataString.split(',')[1] : base64DataString;
    const buffer = Buffer.from(base64Data, 'base64');

    // Extract content type
    const contentTypeMatch = base64DataString.match(/^data:(image\/\w+);base64,/);
    const contentType = contentTypeMatch ? contentTypeMatch[1] : 'image/jpeg';

    const key = `hosts/${Date.now()}_${fileName}`;

    // Upload to primary bucket
    return await uploadToS3(buffer, key, contentType, primaryBucketName);
}
