import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { Storage } from '@google-cloud/storage';

const connectionString = process.env.DATABASE_URL;

console.log(`DATABASE_URL present: ${!!connectionString}`);
if (connectionString) {
  console.log(`DATABASE_URL host: ${connectionString.split('@')[1]}`);
}

const poolConfig = {
  connectionString: connectionString
    ? connectionString
        .replace('&sslmode=no-verify', '')
        .replace('&sslmode=require', '')
    : undefined,
  ssl: {
    rejectUnauthorized: false,
  },
  options: '-c search_path=plan_vision',
};

console.log(
  'Pool config:',
  JSON.stringify({ ...poolConfig, connectionString: '***' }, null, 2),
);

const pool = new Pool(poolConfig);
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GCS Setup
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GCS_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n'),
  },
});
const bucketName = process.env.GCS_BUCKET || 'plan-vision-assets'; // Default or env
const bucket = storage.bucket(bucketName);

const imageTypes = [
  {
    label: '2D Floor Plan',
    value: 'floor_plan_2d',
    description: 'Top-down technical blueprint',
  },
  {
    label: '3D Floor Plan',
    value: 'floor_plan_3d',
    description: 'Isometric or angled 3D view of a layout',
  },
  {
    label: 'Sketch / Drawing',
    value: 'sketch_drawing',
    description: 'Hand-drawn or line-art sketch of a space',
  },
  {
    label: 'Living Room',
    value: 'interior_living_room',
    description: 'Main gathering space with seating',
  },
  {
    label: 'Kitchen',
    value: 'interior_kitchen',
    description: 'Cooking and food prep area',
  },
  {
    label: 'Bedroom',
    value: 'interior_bedroom',
    description: 'Sleeping quarters',
  },
  {
    label: 'Bathroom',
    value: 'interior_bathroom',
    description: 'Restroom and washing area',
  },
  {
    label: 'Dining Room',
    value: 'interior_dining_room',
    description: 'Eating area with table and chairs',
  },
  {
    label: 'Home Office',
    value: 'interior_office',
    description: 'Workspace or study',
  },
  {
    label: 'Kids Room / Nursery',
    value: 'interior_kids_room',
    description: 'Room for children or infants',
  },
  {
    label: 'Walk-in Closet',
    value: 'interior_walkin_closet',
    description: 'Wardrobe storage space',
  },
  {
    label: 'Laundry / Mudroom',
    value: 'interior_laundry_room',
    description: 'Utility and cleaning space',
  },
  {
    label: 'Home Gym',
    value: 'interior_home_gym',
    description: 'Exercise and fitness area',
  },
  {
    label: 'Home Theater',
    value: 'interior_media_room',
    description: 'Entertainment and movie area',
  },
  {
    label: 'Basement / Game Room',
    value: 'interior_game_room',
    description: 'Recreational living space',
  },
  {
    label: 'Sunroom',
    value: 'interior_sunroom',
    description: 'Glass-enclosed bright room',
  },
  {
    label: 'Attic / Loft',
    value: 'interior_attic',
    description: 'Spaces with sloped ceilings',
  },
  {
    label: 'Empty Room',
    value: 'interior_empty',
    description: 'Unfurnished room structure',
  },
  {
    label: 'Entryway / Foyer',
    value: 'interior_entryway',
    description: 'Entrance hall',
  },
  {
    label: 'Hallway',
    value: 'interior_hallway',
    description: 'Connecting corridor',
  },
  {
    label: 'Staircase',
    value: 'interior_staircase',
    description: 'Stairs and railings',
  },
  {
    label: 'Office Workspace',
    value: 'commercial_office',
    description: 'Commercial working desks or cubicles',
  },
  {
    label: 'Conference Room',
    value: 'commercial_conference',
    description: 'Meeting room',
  },
  {
    label: 'Retail Shop',
    value: 'commercial_retail',
    description: 'Store, boutique, or display area',
  },
  {
    label: 'Restaurant / Cafe',
    value: 'commercial_restaurant',
    description: 'Dining and hospitality space',
  },
  {
    label: 'Lobby / Reception',
    value: 'commercial_lobby',
    description: 'Building entrance or hotel lobby',
  },
  {
    label: 'House Facade',
    value: 'exterior_facade',
    description: 'Front view of the building',
  },
  {
    label: 'Backyard / Patio',
    value: 'exterior_backyard',
    description: 'Rear outdoor living space',
  },
  {
    label: 'Garden',
    value: 'exterior_garden',
    description: 'Landscaping and plants',
  },
  {
    label: 'Swimming Pool',
    value: 'exterior_pool',
    description: 'Pool and deck area',
  },
  {
    label: 'Rooftop Terrace',
    value: 'exterior_rooftop',
    description: 'Urban roof deck',
  },
  {
    label: 'Balcony',
    value: 'exterior_balcony',
    description: 'Small apartment outdoor area',
  },
  {
    label: 'Patio',
    value: 'exterior_patio',
    description: 'Paved outdoor area adjoining a house',
  },
  {
    label: 'Front Porch',
    value: 'exterior_porch',
    description: 'Covered front entrance',
  },
  {
    label: 'Other',
    value: 'other',
    description: 'General uncategorized space',
  },
];

async function uploadFileToGCS(
  filePath: string,
  destination: string,
): Promise<string> {
  try {
    const file = bucket.file(destination);
    const [exists] = await file.exists();

    if (exists) {
      console.log(
        `File ${destination} already exists in GCS. Skipping upload.`,
      );
      return `https://storage.googleapis.com/${bucketName}/${destination}`;
    }

    console.log(`Uploading ${filePath} to ${destination}...`);
    await bucket.upload(filePath, {
      destination,
      public: true,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });
    console.log(`Uploaded ${destination}.`);
    return `https://storage.googleapis.com/${bucketName}/${destination}`;
  } catch (error) {
    console.error(`Failed to upload ${filePath} to GCS:`, error);
    throw error;
  }
}

interface StyleRow {
  name: string;
  supportedImageTypes: string[];
  promptFragment: string;
}

function parseCSV(filePath: string): StyleRow[] {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const data: StyleRow[] = [];

  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  // Skip header
  let isHeader = true;

  for (let i = 0; i < fileContent.length; i++) {
    const char = fileContent[i];
    const nextChar = fileContent[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      // End of line
      if (char === '\r' && nextChar === '\n') i++; // Handle CRLF

      currentRow.push(currentField.trim());
      currentField = '';

      if (
        currentRow.length > 0 &&
        (currentRow.length > 1 || currentRow[0] !== '')
      ) {
        if (isHeader) {
          isHeader = false;
        } else {
          processRow(currentRow, data);
        }
      }
      currentRow = [];
    } else {
      currentField += char;
    }
  }

  // Handle last row
  if (currentRow.length > 0 || currentField !== '') {
    currentRow.push(currentField.trim());
    if (!isHeader && currentRow.length > 0) {
      processRow(currentRow, data);
    }
  }

  return data;
}

function processRow(row: string[], data: StyleRow[]) {
  if (row.length < 3) return;

  const name = row[0].replace(/^"|"$/g, '').trim(); // Remove surrounding quotes if any remained (though logic handles it)
  // Actually my logic above KEEPS the content inside quotes but doesn't strip the outer quotes if I didn't add logic for it.
  // Wait, my logic `inQuotes = !inQuotes` toggles state but `currentField += char` is NOT called for the quote itself?
  // Ah, looking at my code:
  // `if (char === '"') ... else ... currentField += char`
  // So the quotes are NOT added to currentField. Good.

  const supportedImageTypesRaw = row[1];
  // Parse the array string "['a', 'b']" -> ['a', 'b']
  const supportedImageTypes = supportedImageTypesRaw
    .replace(/'/g, '"')
    .replace(/^"|"$/g, '');

  let parsedTypes: string[] = [];
  try {
    parsedTypes = JSON.parse(supportedImageTypes);
  } catch (e) {
    console.warn(
      `Failed to parse supportedImageTypes for ${name}: ${supportedImageTypesRaw}`,
    );
    parsedTypes = [];
  }

  let promptFragment = row[2];
  // Handle double quotes escaped as "" in CSV - handled by parser?
  // My parser turns `""` into `"` inside `currentField`.
  // So `promptFragment` should be clean.

  data.push({
    name,
    supportedImageTypes: parsedTypes,
    promptFragment,
  });
}

async function seedStyles() {
  console.log('Starting Style seeding...');
  const csvPath = path.join(__dirname, '../styles.seed.csv');
  const stylesDir = path.join(__dirname, '../styles');

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found at ${csvPath}`);
    return;
  }

  const stylesData = parseCSV(csvPath);
  console.log(`Parsed ${stylesData.length} styles from CSV.`);

  const files = fs.readdirSync(stylesDir);

  for (const style of stylesData) {
    // Find image file
    // Try exact match or with extension
    // Also handle "Restoration / Declutter" -> "Restoration : Declutter"

    const cleanName = style.name.trim();
    const nameWithColon = cleanName.replace(/\//g, ':');

    const matchingFile = files.find((file) => {
      const nameWithoutExt = path.parse(file).name.trim();
      return (
        nameWithoutExt.toLowerCase() === cleanName.toLowerCase() ||
        nameWithoutExt.toLowerCase() === nameWithColon.toLowerCase()
      );
    });

    if (!matchingFile) {
      console.warn(
        `Image not found for style: "${style.name}" (searched for "${cleanName}" or "${nameWithColon}"). Skipping.`,
      );
      continue;
    }

    const imagePath = path.join(stylesDir, matchingFile);

    // Upload to GCS
    const destination = `styles/${matchingFile}`;
    let publicUrl = '';
    try {
      publicUrl = await uploadFileToGCS(imagePath, destination);
    } catch (e: any) {
      console.warn(
        `Upload failed for style ${style.name}. Using placeholder URL. Error: ${e.message}`,
      );
      // Use a placeholder URL
      publicUrl = `https://placehold.co/600x400?text=${encodeURIComponent(style.name)}`;
    }

    // Upsert Style
    const connectedImageTypes = await prisma.imageType.findMany({
      where: {
        value: { in: style.supportedImageTypes },
      },
    });

    await prisma.style.upsert({
      where: { name: style.name },
      update: {
        thumbnailUrl: publicUrl,
        promptFragment: style.promptFragment,
        imageTypes: {
          set: connectedImageTypes.map((it) => ({ id: it.id })),
        },
      },
      create: {
        name: style.name,
        thumbnailUrl: publicUrl,
        promptFragment: style.promptFragment,
        imageTypes: {
          connect: connectedImageTypes.map((it) => ({ id: it.id })),
        },
      },
    });
    console.log(`Upserted style: ${style.name}`);
  }
  console.log('Style seeding finished.');
}

async function main() {
  console.log('Starting seed script...');
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL is not defined.');
    process.exit(1);
  }
  console.log(`Using database: ${process.env.DATABASE_URL.split('@')[1]}`); // Log host only

  try {
    const searchPath = await prisma.$queryRaw`SHOW search_path`;
    console.log('Current search_path:', searchPath);
  } catch (e) {
    console.error('Error checking search_path:', e);
  }

  console.log('Start seeding ImageTypes...');

  for (const type of imageTypes) {
    const imageType = await prisma.imageType.upsert({
      where: { value: type.value },
      update: {
        label: type.label,
        description: type.description,
      },
      create: {
        label: type.label,
        value: type.value,
        description: type.description,
      },
    });
    console.log(`Upserted image type with value: ${imageType.value}`);
  }
  console.log('Seeding ImageTypes finished.');

  await seedStyles();

  const projectTemplates = [
    {
      title: 'Garden Redesign',
      description:
        'Transform your outdoor space into a lush, beautiful sanctuary. Perfect for landscaping and patio updates.',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1558293842-c0fd3db86157?q=80&w=600&auto=format&fit=crop', // Real Garden Image
      sampleImageUrls: [
        'https://images.unsplash.com/photo-1598902168956-65675f15df6d?q=80&w=600',
        'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=600',
      ],
      targetImageTypeValue: 'exterior_garden',
    },
    {
      title: 'Living Room Makeover',
      description:
        'Refresh your main gathering space. Experiment with new furniture layouts and modern styles.',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600&auto=format&fit=crop', // Modern Living Room
      sampleImageUrls: [
        'https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=600',
        'https://images.unsplash.com/photo-1567016432922-40f93050b95f?q=80&w=600',
      ],
      targetImageTypeValue: 'interior_living_room',
    },
    {
      title: '2D to 3D Floor Plan',
      description:
        'Visualize your blueprints in 3D. Upload a technical 2D plan and see it rise to life.',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?q=80&w=600&auto=format&fit=crop', // Floor Plan
      sampleImageUrls: [
        'https://images.unsplash.com/photo-1631510065094-1a6f7cc8c3c1?q=80&w=600', // Generic blueprint look
      ],
      targetImageTypeValue: 'floor_plan_2d',
    },
    {
      title: 'Dream Kitchen',
      description:
        'Cook up a new look. Test different cabinets, countertops, and lighting for your kitchen.',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600&auto=format&fit=crop', // Kitchen
      sampleImageUrls: [
        'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?q=80&w=600',
        'https://images.unsplash.com/photo-1484154218962-a1c00207099b?q=80&w=600',
      ],
      targetImageTypeValue: 'interior_kitchen',
    },
    {
      title: 'Cozy Bedroom',
      description:
        'Create a relaxing retreat. Redesign your sleeping quarters for maximum comfort and style.',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1616594039964-40891a909d99?q=80&w=600&auto=format&fit=crop', // Bedroom
      sampleImageUrls: [
        'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?q=80&w=600',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=600',
      ],
      targetImageTypeValue: 'interior_bedroom',
    },
    {
      title: 'Sketch to Life',
      description:
        'Turn your hand-drawn doodles and conceptual sketches into photorealistic renders.',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1589830500143-690a6e344155?q=80&w=600&auto=format&fit=crop', // Sketching
      sampleImageUrls: [
        'https://plus.unsplash.com/premium_photo-1664110691112-972178229410?q=80&w=600', // Sketch/Drafting
      ],
      targetImageTypeValue: 'sketch_drawing',
    },
  ];

  console.log(`Start seeding ${projectTemplates.length} ProjectTemplates...`);

  for (const template of projectTemplates) {
    console.log(
      `Processing template: ${template.title} (Type: ${template.targetImageTypeValue})`,
    );
    const imageType = await prisma.imageType.findUnique({
      where: { value: template.targetImageTypeValue },
    });

    if (!imageType) {
      console.warn(
        `ImageType not found for value: ${template.targetImageTypeValue}, skipping template: ${template.title}`,
      );
      continue;
    }

    // Check if template exists by title since it's not unique in schema but acts as our logical key here
    const existingTemplate = await prisma.projectTemplate.findFirst({
      where: { title: template.title },
    });

    if (existingTemplate) {
      await prisma.projectTemplate.update({
        where: { id: existingTemplate.id },
        data: {
          description: template.description,
          thumbnailUrl: template.thumbnailUrl,
          sampleImageUrls: template.sampleImageUrls,
          defaultImageTypeId: imageType.id,
        },
      });
      console.log(`Updated project template: ${template.title}`);
    } else {
      await prisma.projectTemplate.create({
        data: {
          title: template.title,
          description: template.description,
          thumbnailUrl: template.thumbnailUrl,
          sampleImageUrls: template.sampleImageUrls,
          defaultImageTypeId: imageType.id,
        },
      });
      console.log(`Created project template: ${template.title}`);
    }
  }
  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
