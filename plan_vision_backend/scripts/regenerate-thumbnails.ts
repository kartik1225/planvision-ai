import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { GoogleGenAI } from '@google/genai';
import { Storage } from '@google-cloud/storage';

// ========== DATABASE SETUP ==========
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const poolConfig = {
  connectionString: connectionString
    .replace('&sslmode=no-verify', '')
    .replace('&sslmode=require', ''),
  ssl: {
    rejectUnauthorized: false,
  },
  options: '-c search_path=plan_vision',
};

const pool = new Pool(poolConfig);
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ========== AI SETUP ==========
const projectId = process.env.GCP_PROJECT_ID;
const location = process.env.GCP_LOCATION ?? 'us-central1';

if (!projectId) {
  console.error('GCP_PROJECT_ID is required');
  process.exit(1);
}

const ai = new GoogleGenAI({
  vertexai: true,
  project: projectId,
  location: location,
});

// ========== GCS SETUP ==========
// Use application-default credentials (same as StorageService)
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
});
const bucketName = process.env.GCS_BUCKET || 'plan-vision-assets';
const bucket = storage.bucket(bucketName);

// ========== TYPES ==========
interface Style {
  id: string;
  name: string;
  thumbnailUrl: string;
  promptFragment: string;
}

// ========== CONFIGURATION ==========
const INITIAL_RETRY_DELAY_MS = 10000; // 10 seconds
const MAX_RETRY_DELAY_MS = 120000; // 2 minutes
const MAX_RETRIES = 5;
const API_CALL_DELAY_MS = 5000; // 5 seconds between calls

// ========== UTILITY FUNCTIONS ==========
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isValidThumbnailUrl(url: string): Promise<boolean> {
  if (!url || url.trim() === '') {
    return false;
  }

  // Treat placeholder URLs as invalid - they need to be regenerated
  if (url.includes('placeholder.co') || url.includes('placehold.co')) {
    return false;
  }

  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// ========== AI FUNCTIONS (from style.service.ts) ==========
function buildImagePromptGenerationPrompt(
  styleName: string,
  promptFragment: string,
): string {
  return `You are creating an image prompt for a STYLE THUMBNAIL in an interior design app.

STYLE: "${styleName}"
AESTHETIC: "${promptFragment}"

GOAL: Generate a prompt for a style showcase image that will appear in a style picker. Users will see this at thumbnail size (~200px wide) to understand what this style looks like.

THUMBNAIL REQUIREMENTS:
- Compose a VIGNETTE (focused scene with 2-4 key elements), NOT a full room
- Feature characteristic furniture pieces, materials, and textures from this style
- Show the color palette naturally within the scene
- Use lighting that enhances the style's mood
- Create a clear focal point that reads well at small sizes

DO NOT:
- Describe a complete room layout
- Mention specific room types (kitchen, bedroom, living room, etc.)
- Include more than 4-5 main elements
- Use wide establishing shots

PROMPT FORMAT:
Start with the composition type and main elements, then describe materials, textures, colors, and lighting. Be specific about surfaces and finishes.

End the prompt with: "style vignette, 16:9 aspect ratio, interior design photography, 8k, soft directional lighting"

OUTPUT: Only the image generation prompt, nothing else.`;
}

async function generateText(prompt: string, retryCount = 0): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      config: {
        maxOutputTokens: 8192,
        temperature: 0.9,
      },
    });

    const candidate = response.candidates?.[0];
    if (!candidate?.content?.parts) {
      throw new Error('No content received from model.');
    }

    const textPart = candidate.content.parts.find((p) => p.text);
    if (!textPart?.text) {
      throw new Error('No text response from model.');
    }

    return textPart.text;
  } catch (error: any) {
    // Check for rate limit errors
    if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
      if (retryCount < MAX_RETRIES) {
        const delayMs = Math.min(
          INITIAL_RETRY_DELAY_MS * Math.pow(2, retryCount),
          MAX_RETRY_DELAY_MS,
        );
        console.log(`  ⏳ Rate limited (text). Waiting ${delayMs / 1000}s before retry ${retryCount + 1}/${MAX_RETRIES}...`);
        await sleep(delayMs);
        return generateText(prompt, retryCount + 1);
      }
    }
    throw error;
  }
}

async function generateImageFromPrompt(prompt: string, retryCount = 0): Promise<Buffer> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Using image model for thumbnail generation
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      config: {
        temperature: 1,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseModalities: ['IMAGE'],
      },
    });

    const candidate = response.candidates?.[0];
    if (!candidate?.content?.parts) {
      throw new Error('No content received from model.');
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return Buffer.from(part.inlineData.data, 'base64');
      }
    }

    throw new Error('Model finished but returned no image data.');
  } catch (error: any) {
    // Check for rate limit errors
    if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
      if (retryCount < MAX_RETRIES) {
        const delayMs = Math.min(
          INITIAL_RETRY_DELAY_MS * Math.pow(2, retryCount),
          MAX_RETRY_DELAY_MS,
        );
        console.log(`  ⏳ Rate limited (image). Waiting ${delayMs / 1000}s before retry ${retryCount + 1}/${MAX_RETRIES}...`);
        await sleep(delayMs);
        return generateImageFromPrompt(prompt, retryCount + 1);
      }
    }
    throw error;
  }
}

async function uploadToGCS(imageBuffer: Buffer, filename: string): Promise<string> {
  const blob = bucket.file(filename);

  await blob.save(imageBuffer, {
    contentType: 'image/png',
    resumable: false,
  });

  return `https://storage.googleapis.com/${bucketName}/${filename}`;
}

function buildStyleThumbnailPrompt(imagePrompt: string): string {
  return imagePrompt.trim().replace(/\.+$/, '') + '.';
}

// ========== MAIN PROCESSING FUNCTIONS ==========
async function processStyle(style: Style): Promise<{
  success: boolean;
  skipped?: boolean;
  error?: string;
}> {
  console.log(`\n📦 Processing: ${style.name}`);

  // Check if current thumbnail is valid
  const isValid = await isValidThumbnailUrl(style.thumbnailUrl);

  if (isValid) {
    console.log(`  ✓ Thumbnail is valid, skipping.`);
    return { success: true, skipped: true };
  }

  console.log(`  ⚠ Invalid thumbnail URL: ${style.thumbnailUrl || '(empty)'}`);
  console.log(`  → Regenerating...`);

  // Step 1: Build image prompt using AI
  console.log(`  → Building image prompt...`);
  const systemPrompt = buildImagePromptGenerationPrompt(style.name, style.promptFragment);
  const rawImagePrompt = await generateText(systemPrompt);

  // Clean up the response
  let imagePrompt = rawImagePrompt.trim();
  if (
    (imagePrompt.startsWith('"') && imagePrompt.endsWith('"')) ||
    (imagePrompt.startsWith("'") && imagePrompt.endsWith("'"))
  ) {
    imagePrompt = imagePrompt.slice(1, -1);
  }

  console.log(`  ✓ Prompt generated (${imagePrompt.length} chars)`);

  // Delay before next API call
  await sleep(API_CALL_DELAY_MS);

  // Step 2: Generate thumbnail image
  console.log(`  → Generating thumbnail image...`);
  const finalPrompt = buildStyleThumbnailPrompt(imagePrompt);
  const imageBuffer = await generateImageFromPrompt(finalPrompt);

  console.log(`  ✓ Image generated (${imageBuffer.length} bytes)`);

  // Step 3: Upload to GCS
  console.log(`  → Uploading to GCS...`);
  const filename = `styles/generated/${Date.now()}.png`;
  const generatedImageUrl = await uploadToGCS(imageBuffer, filename);

  console.log(`  ✓ Uploaded: ${generatedImageUrl}`);

  // Step 4: Update database
  console.log(`  → Updating database...`);
  await prisma.style.update({
    where: { id: style.id },
    data: { thumbnailUrl: generatedImageUrl },
  });
  console.log(`  ✓ Database updated successfully`);

  return { success: true };
}

async function main() {
  console.log('🚀 Starting thumbnail regeneration script');
  console.log(`🔧 Using Vertex AI (project: ${projectId}, location: ${location})`);
  console.log(`📦 GCS Bucket: ${bucketName}`);
  console.log('');

  // Fetch all styles from database
  console.log('📋 Fetching styles from database...');
  const styles = await prisma.style.findMany({
    orderBy: { name: 'asc' },
  });

  console.log(`📋 Found ${styles.length} styles to process\n`);

  const results = {
    total: styles.length,
    valid: 0,
    regenerated: 0,
    failed: 0,
    errors: [] as { name: string; error: string }[],
  };

  for (let i = 0; i < styles.length; i++) {
    const style = styles[i];
    console.log(`\n[${i + 1}/${styles.length}]`);

    try {
      const result = await processStyle(style);

      if (result.skipped) {
        results.valid++;
      } else if (result.success) {
        results.regenerated++;
      } else {
        results.failed++;
        results.errors.push({ name: style.name, error: result.error || 'Unknown error' });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`  ✗ Unexpected error: ${errorMessage}`);
      results.failed++;
      results.errors.push({ name: style.name, error: errorMessage });
    }

    // Delay between processing styles to avoid rate limits
    if (i < styles.length - 1) {
      await sleep(API_CALL_DELAY_MS);
    }
  }

  // Print summary
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('                     SUMMARY                           ');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Total styles:      ${results.total}`);
  console.log(`  Already valid:     ${results.valid}`);
  console.log(`  Regenerated:       ${results.regenerated}`);
  console.log(`  Failed:            ${results.failed}`);
  console.log('═══════════════════════════════════════════════════════');

  if (results.errors.length > 0) {
    console.log('\n❌ Failed styles:');
    for (const err of results.errors) {
      console.log(`   - ${err.name}: ${err.error}`);
    }
  }

  console.log('\n✅ Script completed');
}

main()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
