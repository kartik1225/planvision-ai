import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
console.log('DATABASE_URL present:', !!connectionString);
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const projectTemplates = await prisma.projectTemplate.findMany({
        include: { defaultImageType: true }
    });
    console.log(`\nProjectTemplates (${projectTemplates.length}):`);
    projectTemplates.forEach(t => {
        console.log(`- ${t.title} (Type: ${t.defaultImageType.label})`);
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
