import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('=== Testing database ===');
    
    // Test basic query using raw SQL
    const result = await prisma.$queryRaw`SELECT version() as version`;
    console.log('Database version:', result);
    
    // Test creating a user (use upsert to avoid duplicate errors)
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: { username: 'testuser' },
      create: {
        email: 'test@example.com',
        password_hash: 'hashed_password',
        username: 'testuser',
        display_name: 'Test User',
      }
    });
    console.log('User created/updated:', user);
    
    // Test creating a project
    const project = await prisma.project.create({
      data: {
        owner_id: user.id,
        name: 'Test Project',
        slug: 'test-project',
        description: 'A test project',
      }
    });
    console.log('Project created:', project);
    
    // Test creating a file
    const file = await prisma.file.create({
      data: {
        project_id: project.id,
        name: 'index.js',
        path: '/index.js',
        content: 'console.log("Hello World")',
        file_type: 'javascript',
      }
    });
    console.log('File created:', file);
    
    // Test querying with relations
    const projectWithFiles = await prisma.project.findUnique({
      where: { id: project.id },
      include: { files: true }
    });
    console.log('Project with files:', projectWithFiles);
    
    // Cleanup
    await prisma.file.deleteMany({ where: { project_id: project.id } });
    await prisma.project.delete({ where: { id: project.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log('Test data cleaned up');
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();