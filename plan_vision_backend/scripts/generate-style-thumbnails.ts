/**
 * Generate per-ImageType thumbnails for all styles.
 *
 * This script generates contextual thumbnails showing each style
 * in the context of each image type it supports.
 *
 * Usage:
 *   pnpm generate-style-thumbnails
 *   pnpm generate-style-thumbnails --style="Modern Minimalist"
 *   pnpm generate-style-thumbnails --image-type="Kitchen"
 *   pnpm generate-style-thumbnails --skip-existing
 */

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
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
});
const bucketName = process.env.GCS_BUCKET || 'plan-vision-assets';
const bucket = storage.bucket(bucketName);

// ========== TYPES ==========
interface StyleWithImageTypes {
  id: string;
  name: string;
  promptFragment: string;
  imageTypes: { id: string; label: string; value: string }[];
}

// ========== CONFIGURATION ==========
const INITIAL_RETRY_DELAY_MS = 10000; // 10 seconds
const MAX_RETRY_DELAY_MS = 120000; // 2 minutes
const MAX_RETRIES = 5;
const API_CALL_DELAY_MS = 5000; // 5 seconds between calls

// ========== CLI ARGUMENTS ==========
const args = process.argv.slice(2);
const styleFilter = args.find((a) => a.startsWith('--style='))?.split('=')[1];
const imageTypeFilter = args
  .find((a) => a.startsWith('--image-type='))
  ?.split('=')[1];
const skipExisting = args.includes('--skip-existing');

// ========== UTILITY FUNCTIONS ==========
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ========== AI FUNCTIONS ==========
function buildContextualImagePrompt(
  styleName: string,
  promptFragment: string,
  imageTypeLabel: string,
): string {
  return `You are creating an image prompt for a STYLE THUMBNAIL in an interior design app.

STYLE: "${styleName}"
AESTHETIC: "${promptFragment}"
ROOM TYPE: "${imageTypeLabel}"

GOAL: Generate a prompt for a thumbnail showing this design style applied to a ${imageTypeLabel}. Users will see this at thumbnail size (~200px wide) to understand what this style looks like in their specific space.

THUMBNAIL REQUIREMENTS:
- Show a REALISTIC ${imageTypeLabel} interior/exterior view
- Feature characteristic furniture, fixtures, and decor for a ${imageTypeLabel}
- Apply the "${styleName}" aesthetic throughout the space
- Use appropriate ${imageTypeLabel} elements (e.g., counters for kitchen, bed for bedroom, plants for garden)
- Create a cohesive, inspiring design that users would want in their own ${imageTypeLabel}
- Good composition that reads well at thumbnail size

PROMPT FORMAT:
Start with "A ${imageTypeLabel.toLowerCase()}", then describe the key design elements, materials, colors, and lighting that showcase the ${styleName} style.

End the prompt with: "interior design photography, 16:9 aspect ratio, 8k quality, professional architectural visualization"

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
    if (
      error?.status === 429 ||
      error?.message?.includes('429') ||
      error?.message?.includes('RESOURCE_EXHAUSTED')
    ) {
      if (retryCount < MAX_RETRIES) {
        const delayMs = Math.min(
          INITIAL_RETRY_DELAY_MS * Math.pow(2, retryCount),
          MAX_RETRY_DELAY_MS,
        );
        console.log(
          `  ⏳ Rate limited (text). Waiting ${delayMs / 1000}s before retry ${retryCount + 1}/${MAX_RETRIES}...`,
        );
        await sleep(delayMs);
        return generateText(prompt, retryCount + 1);
      }
    }
    throw error;
  }
}

async function generateImageFromPrompt(
  prompt: string,
  retryCount = 0,
): Promise<Buffer> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
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
    if (
      error?.status === 429 ||
      error?.message?.includes('429') ||
      error?.message?.includes('RESOURCE_EXHAUSTED')
    ) {
      if (retryCount < MAX_RETRIES) {
        const delayMs = Math.min(
          INITIAL_RETRY_DELAY_MS * Math.pow(2, retryCount),
          MAX_RETRY_DELAY_MS,
        );
        console.log(
          `  ⏳ Rate limited (image). Waiting ${delayMs / 1000}s before retry ${retryCount + 1}/${MAX_RETRIES}...`,
        );
        await sleep(delayMs);
        return generateImageFromPrompt(prompt, retryCount + 1);
      }
    }
    throw error;
  }
}

async function uploadToGCS(
  imageBuffer: Buffer,
  filename: string,
): Promise<string> {
  const blob = bucket.file(filename);

  await blob.save(imageBuffer, {
    contentType: 'image/png',
    resumable: false,
  });

  return `https://storage.googleapis.com/${bucketName}/${filename}`;
}

// ========== MAIN PROCESSING ==========
async function processStyleImageType(
  style: StyleWithImageTypes,
  imageType: { id: string; label: string; value: string },
): Promise<{ success: boolean; error?: string }> {
  console.log(`    → ${imageType.label}`);

  try {
    // Step 1: Build contextual image prompt
    const systemPrompt = buildContextualImagePrompt(
      style.name,
      style.promptFragment,
      imageType.label,
    );
    const rawImagePrompt = await generateText(systemPrompt);

    // Clean up the response
    let imagePrompt = rawImagePrompt.trim();
    if (
      (imagePrompt.startsWith('"') && imagePrompt.endsWith('"')) ||
      (imagePrompt.startsWith("'") && imagePrompt.endsWith("'"))
    ) {
      imagePrompt = imagePrompt.slice(1, -1);
    }

    console.log(`      ✓ Prompt generated (${imagePrompt.length} chars)`);

    await sleep(API_CALL_DELAY_MS);

    // Step 2: Generate thumbnail image
    const imageBuffer = await generateImageFromPrompt(imagePrompt);
    console.log(`      ✓ Image generated (${imageBuffer.length} bytes)`);

    // Step 3: Upload to GCS
    const filename = `styles/thumbnails/${style.id}/${imageType.value}.png`;
    const thumbnailUrl = await uploadToGCS(imageBuffer, filename);
    console.log(`      ✓ Uploaded: ${filename}`);

    // Step 4: Upsert StyleThumbnail record
    await prisma.styleThumbnail.upsert({
      where: {
        styleId_imageTypeId: {
          styleId: style.id,
          imageTypeId: imageType.id,
        },
      },
      update: { thumbnailUrl },
      create: {
        styleId: style.id,
        imageTypeId: imageType.id,
        thumbnailUrl,
      },
    });
    console.log(`      ✓ Database updated`);

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log(`      ✗ Error: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
}

async function main() {
  console.log('🚀 Starting per-imageType thumbnail generation');
  console.log(`🔧 Using Vertex AI (project: ${projectId}, location: ${location})`);
  console.log(`📦 GCS Bucket: ${bucketName}`);
  if (styleFilter) console.log(`🎯 Style filter: ${styleFilter}`);
  if (imageTypeFilter) console.log(`🎯 Image type filter: ${imageTypeFilter}`);
  if (skipExisting) console.log(`⏭️  Skipping existing thumbnails`);
  console.log('');

  // Fetch styles with their image types
  const styles = (await prisma.style.findMany({
    where: styleFilter ? { name: { contains: styleFilter } } : undefined,
    orderBy: { name: 'asc' },
    include: {
      imageTypes: imageTypeFilter
        ? { where: { label: { contains: imageTypeFilter } } }
        : true,
      thumbnails: skipExisting ? true : undefined,
    },
  })) as unknown as (StyleWithImageTypes & {
    thumbnails?: { imageTypeId: string }[];
  })[];

  // Count total combinations
  let totalCombinations = 0;
  for (const style of styles) {
    totalCombinations += style.imageTypes.length;
  }

  console.log(`📋 Found ${styles.length} styles with ${totalCombinations} total style-imageType combinations\n`);

  const results = {
    total: totalCombinations,
    generated: 0,
    skipped: 0,
    failed: 0,
    errors: [] as { style: string; imageType: string; error: string }[],
  };

  let processed = 0;

  for (const style of styles) {
    console.log(`\n📦 ${style.name} (${style.imageTypes.length} image types)`);

    // Get existing thumbnail image type IDs if skipping
    const existingImageTypeIds = new Set(
      (style as any).thumbnails?.map((t: any) => t.imageTypeId) || [],
    );

    for (const imageType of style.imageTypes) {
      processed++;
      console.log(`  [${processed}/${totalCombinations}]`);

      // Skip if thumbnail already exists
      if (skipExisting && existingImageTypeIds.has(imageType.id)) {
        console.log(`    → ${imageType.label} (skipped - exists)`);
        results.skipped++;
        continue;
      }

      const result = await processStyleImageType(style, imageType);

      if (result.success) {
        results.generated++;
      } else {
        results.failed++;
        results.errors.push({
          style: style.name,
          imageType: imageType.label,
          error: result.error || 'Unknown error',
        });
      }

      // Delay between processing to avoid rate limits
      await sleep(API_CALL_DELAY_MS);
    }
  }

  // Print summary
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('                     SUMMARY                           ');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Total combinations:  ${results.total}`);
  console.log(`  Generated:           ${results.generated}`);
  console.log(`  Skipped (existing):  ${results.skipped}`);
  console.log(`  Failed:              ${results.failed}`);
  console.log('═══════════════════════════════════════════════════════');

  if (results.errors.length > 0) {
    console.log('\n❌ Failed thumbnails:');
    for (const err of results.errors) {
      console.log(`   - ${err.style} / ${err.imageType}: ${err.error}`);
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
