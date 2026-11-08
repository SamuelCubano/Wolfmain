import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log('=== Resetting database ===');
    
    // Drop all tables and enums
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "public"."project_tag_assignments" CASCADE;`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "public"."project_tags" CASCADE;`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "public"."project_collaborators" CASCADE;`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "public"."file_versions" CASCADE;`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "public"."files" CASCADE;`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "public"."projects" CASCADE;`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "public"."sessions" CASCADE;`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "public"."users" CASCADE;`);
    
    // Drop all enums
    await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "public"."Visibility" CASCADE;`);
    await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "public"."CollaboratorRole" CASCADE;`);
    await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "public"."visibility_type" CASCADE;`);
    await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "public"."collaborator_role" CASCADE;`);
    
    console.log('Database reset successfully');
    
    // Create enums
    await prisma.$executeRawUnsafe(`CREATE TYPE "public"."Visibility" AS ENUM ('public', 'private', 'team');`);
    await prisma.$executeRawUnsafe(`CREATE TYPE "public"."CollaboratorRole" AS ENUM ('owner', 'admin', 'editor', 'viewer');`);
    
    // Create tables
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "public"."users" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        display_name VARCHAR(100),
        avatar_url TEXT,
        bio TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        is_email_verified BOOLEAN DEFAULT false
      );
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "public"."projects" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id UUID NOT NULL REFERENCES "public"."users"(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL,
        description TEXT,
        visibility "public"."Visibility" DEFAULT 'private',
        language VARCHAR(50),
        framework VARCHAR(50),
        template VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(owner_id, slug)
      );
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "public"."files" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES "public"."projects"(id) ON DELETE CASCADE,
        parent_id UUID REFERENCES "public"."files"(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        path VARCHAR(500) NOT NULL,
        content TEXT,
        file_type VARCHAR(50),
        language VARCHAR(50),
        size INTEGER DEFAULT 0,
        is_folder BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, path)
      );
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "public"."file_versions" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        file_id UUID NOT NULL REFERENCES "public"."files"(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        commit_message VARCHAR(500),
        version_number INTEGER NOT NULL,
        created_by UUID REFERENCES "public"."users"(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(file_id, version_number)
      );
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "public"."project_collaborators" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES "public"."projects"(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES "public"."users"(id) ON DELETE CASCADE,
        role "public"."CollaboratorRole" DEFAULT 'viewer',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, user_id)
      );
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "public"."project_tags" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) UNIQUE NOT NULL,
        color VARCHAR(7) DEFAULT '#6366f1'
      );
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "public"."project_tag_assignments" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES "public"."projects"(id) ON DELETE CASCADE,
        tag_id UUID NOT NULL REFERENCES "public"."project_tags"(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, tag_id)
      );
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "public"."sessions" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES "public"."users"(id) ON DELETE CASCADE,
        refresh_token VARCHAR(500) NOT NULL,
        user_agent TEXT,
        ip_address INET,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create indexes
    await prisma.$executeRawUnsafe(`CREATE INDEX idx_projects_owner ON "public"."projects"(owner_id);`);
    await prisma.$executeRawUnsafe(`CREATE INDEX idx_files_project ON "public"."files"(project_id);`);
    await prisma.$executeRawUnsafe(`CREATE INDEX idx_files_parent ON "public"."files"(parent_id);`);
    await prisma.$executeRawUnsafe(`CREATE INDEX idx_file_versions_file ON "public"."file_versions"(file_id);`);
    await prisma.$executeRawUnsafe(`CREATE INDEX idx_collaborators_project ON "public"."project_collaborators"(project_id);`);
    await prisma.$executeRawUnsafe(`CREATE INDEX idx_collaborators_user ON "public"."project_collaborators"(user_id);`);
    await prisma.$executeRawUnsafe(`CREATE INDEX idx_sessions_user ON "public"."sessions"(user_id);`);
    await prisma.$executeRawUnsafe(`CREATE INDEX idx_sessions_expires ON "public"."sessions"(expires_at);`);
    
    console.log('Database schema created successfully');
    
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

resetDatabase();