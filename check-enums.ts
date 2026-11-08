import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEnums() {
  try {
    console.log('=== Checking enums ===');
    
    // Check what enums exist
    const enums = await prisma.$queryRaw`
      SELECT typname 
      FROM pg_type 
      WHERE typnamespace = 'public'::regnamespace 
      AND typtype = 'e'
      ORDER BY typname;
    `;
    console.log('Enums in database:', enums);
    
    // Check the column type for visibility
    const columnInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'projects'
      AND column_name = 'visibility';
    `;
    console.log('Visibility column info:', columnInfo);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkEnums();