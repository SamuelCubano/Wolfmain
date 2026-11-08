import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createEnums() {
  try {
    console.log('=== Creating enums ===');
    
    // Create enum types
    try { await prisma.$executeRawUnsafe(`CREATE TYPE "public"."Visibility" AS ENUM ('public', 'private', 'team');`); } catch (e) {}
    try { await prisma.$executeRawUnsafe(`CREATE TYPE "public"."CollaboratorRole" AS ENUM ('owner', 'admin', 'editor', 'viewer');`); } catch (e) {}
    
    console.log('Enums created successfully');
    
    // Test creating a user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password_hash: 'hashed_password',
        username: 'testuser',
        display_name: 'Test User',
      }
    });
    console.log('User created:', user);
    
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

createEnums();