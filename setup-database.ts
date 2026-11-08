import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('=== Setting up database ===');
    
    // Create enum types (ignore if already exists)
    try { await prisma.$executeRawUnsafe(`CREATE TYPE visibility_type AS ENUM ('public', 'private', 'team');`); } catch (e) {}
    try { await prisma.$executeRawUnsafe(`CREATE TYPE collaborator_role AS ENUM ('owner', 'admin', 'editor', 'viewer');`); } catch (e) {}
    
    // Create tables with IF NOT EXISTS
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS users (
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
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL,
        description TEXT,
        visibility visibility_type DEFAULT 'private',
        language VARCHAR(50),
        framework VARCHAR(50),
        template VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(owner_id, slug)
      );
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS files (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        parent_id UUID REFERENCES files(id) ON DELETE CASCADE,
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
      CREATE TABLE IF NOT EXISTS file_versions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        commit_message VARCHAR(500),
        version_number INTEGER NOT NULL,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(file_id, version_number)
      );
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS project_collaborators (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role collaborator_role DEFAULT 'viewer',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, user_id)
      );
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS project_tags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) UNIQUE NOT NULL,
        color VARCHAR(7) DEFAULT '#6366f1'
      );
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS project_tag_assignments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        tag_id UUID NOT NULL REFERENCES project_tags(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, tag_id)
      );
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        refresh_token VARCHAR(500) NOT NULL,
        user_agent TEXT,
        ip_address INET,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create indexes
    try { await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);`); } catch (e) {}
    try { await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_files_project ON files(project_id);`); } catch (e) {}
    try { await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_files_parent ON files(parent_id);`); } catch (e) {}
    try { await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_file_versions_file ON file_versions(file_id);`); } catch (e) {}
    try { await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_collaborators_project ON project_collaborators(project_id);`); } catch (e) {}
    try { await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_collaborators_user ON project_collaborators(user_id);`); } catch (e) {}
    try { await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);`); } catch (e) {}
    try { await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);`); } catch (e) {}
    
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

setupDatabase();