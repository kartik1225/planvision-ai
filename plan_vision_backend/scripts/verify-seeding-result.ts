import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
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
const pool = new Pool(poolConfig);
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const styleCount = await prisma.style.count();
    console.log(`Total Styles: ${styleCount}`);

    const restorationStyle = await prisma.style.findUnique({
        where: { name: 'Restoration / Declutter' },
    });
    console.log('Restoration / Declutter found:', !!restorationStyle);

    const southernCharm = await prisma.style.findFirst({
        where: { name: { contains: 'Southern Charm' } },
    });
    console.log('Southern Charm found:', !!southernCharm);
    if (southernCharm) {
        console.log('Southern Charm name:', southernCharm.name);
    }

    const cozyBistro = await prisma.style.findUnique({
        where: { name: 'Cozy Bistro' },
    });
    console.log('Cozy Bistro found:', !!cozyBistro);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
