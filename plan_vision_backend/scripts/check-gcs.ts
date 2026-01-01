import 'dotenv/config';
import { Storage } from '@google-cloud/storage';

async function main() {
    console.log('Checking GCS Env Vars:');
    console.log('GCP_PROJECT_ID:', !!process.env.GCP_PROJECT_ID);
    console.log('GCS_SERVICE_ACCOUNT_EMAIL:', !!process.env.GCS_SERVICE_ACCOUNT_EMAIL);
    console.log('GCS_SERVICE_ACCOUNT_KEY:', !!process.env.GCS_SERVICE_ACCOUNT_KEY);
    console.log('GCS_BUCKET:', process.env.GCS_BUCKET);

    const storage = new Storage({
        projectId: process.env.GCP_PROJECT_ID,
        credentials: {
            client_email: process.env.GCS_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GCS_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n'),
        },
    });

    const bucketName = process.env.GCS_BUCKET || 'plan-vision-assets';
    console.log(`Testing access to bucket: ${bucketName}`);

    try {
        const [files] = await storage.bucket(bucketName).getFiles({ maxResults: 1 });
        console.log('Successfully listed files in bucket.');
        console.log('First file:', files[0]?.name);
    } catch (e) {
        console.error('Failed to list files in bucket:', e);
    }
}

main().catch(console.error);
