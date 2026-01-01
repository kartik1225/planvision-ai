// import { PrismaClient } from '@prisma/client';
//
// const prisma = new PrismaClient();
//
// async function main() {
//     console.log('Verifying Style <-> ImageType relations...');
//
//     // 1. Count total styles
//     const styleCount = await prisma.style.count();
//     console.log(`Total Styles: ${styleCount}`);
//
//     // 2. Check a few specific examples
//     const examples = [
//         'Realistic 3D (Orthographic)',
//         'Modern Minimalist',
//         'Industrial CrossFit / Garage Gym'
//     ];
//
//     for (const name of examples) {
//         const style = await prisma.style.findUnique({
//             where: { name },
//             include: {
//                 supportedImageTypes: true
//             }
//         });
//
//         if (!style) {
//             console.log(`❌ Style "${name}" not found!`);
//             continue;
//         }
//
//         console.log(`\nStyle: ${style.name}`);
//         console.log(`Thumbnail: ${style.thumbnailUrl}`);
//         console.log(`Supported Types (${style.supportedImageTypes.length}):`);
//         style.supportedImageTypes.forEach(t => console.log(` - ${t.value} (${t.label})`));
//     }
//
//     // 3. Check for any styles with NO supported types (orphan styles)
//     const orphans = await prisma.style.findMany({
//         where: {
//             supportedImageTypes: {
//                 none: {}
//             }
//         }
//     });
//
//     if (orphans.length > 0) {
//         console.warn(`\n⚠️  Found ${orphans.length} styles with NO supported image types:`);
//         orphans.forEach(s => console.log(` - ${s.name}`));
//     } else {
//         console.log('\n✅ All styles have at least one supported image type.');
//     }
// }
//
// main()
//     .catch(e => {
//         console.error(e);
//         process.exit(1);
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//     });
