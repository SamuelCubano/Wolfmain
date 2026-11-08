import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTables() {
  try {
    console.log('=== Checking tables ===');
    
    // Check what tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    console.log('Tables in database:', tables);
    
    // Check if users table exists
    const usersTable = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      ) as exists;
    `;
    console.log('Users table exists:', usersTable);
    
    // Check if User table exists (singular)
    const userTable = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'User'
      ) as exists;
    `;
    console.log('User table exists:', userTable);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();