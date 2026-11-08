import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixEnums() {
  try {
    console.log('=== Fixing enums ===');
    
    // Drop the duplicate enums
    try { await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "public"."collaborator_role";`); } catch (e) {}
    try { await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "public"."visibility_type";`); } catch (e) {}
    
    // Create the correct enums (they should already exist)
    try { await prisma.$executeRawUnsafe(`CREATE TYPE "public"."Visibility" AS ENUM ('public', 'private', 'team');`); } catch (e) {}
    try { await prisma.$executeRawUnsafe(`CREATE TYPE "public"."CollaboratorRole" AS ENUM ('owner', 'admin', 'editor', 'viewer');`); } catch (e) {}
    
    // Alter the columns to use the correct enum types
    await prisma.$executeRawUnsafe(`ALTER TABLE "public"."projects" ALTER COLUMN "visibility" TYPE "public"."Visibility" USING "visibility"::"public"."Visibility";`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "public"."project_collaborators" ALTER COLUMN "role" TYPE "public"."CollaboratorRole" USING "role"::"public"."CollaboratorRole";`);
    
    console.log('Enums fixed successfully');
    
    // Test creating a user
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

fixEnums();