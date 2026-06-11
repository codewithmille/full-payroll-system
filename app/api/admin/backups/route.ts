// app/api/admin/backups/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper to get backups directory
const getBackupsDir = () => {
  const dir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

// GET: List all backup files in the backups/ directory
export async function GET() {
  try {
    const dir = getBackupsDir();
    const files = fs.readdirSync(dir);
    
    const backups = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        let type = 'manual';
        if (file.includes('_auto')) {
          type = 'auto';
        }
        
        return {
          filename: file,
          size: stats.size,
          createdAt: stats.mtime.toISOString(),
          type
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, backups }, { status: 200 });
  } catch (error: any) {
    console.error('[BACKUP GET ERROR]', error);
    return NextResponse.json({ success: false, error: error.message || 'Server Error' }, { status: 500 });
  }
}

// POST: Save a new backup to the backups/ directory
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tables, isAutomated, label } = body;

    if (!tables || typeof tables !== 'object') {
      return NextResponse.json({ success: false, error: 'Missing or invalid database tables payload' }, { status: 400 });
    }

    const dir = getBackupsDir();
    const timestamp = Date.now();
    const typeLabel = isAutomated ? 'auto' : 'manual';
    const cleanLabel = label ? `_${label.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
    const filename = `backup_${timestamp}_${typeLabel}${cleanLabel}.json`;
    
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, JSON.stringify(tables, null, 2), 'utf-8');

    console.log(`[BACKUP CREATED] Saved backup file: ${filename} (Size: ${fs.statSync(filePath).size} bytes)`);

    return NextResponse.json({
      success: true,
      message: `Backup ${filename} saved successfully on server.`,
      filename,
      size: fs.statSync(filePath).size,
      createdAt: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    console.error('[BACKUP POST ERROR]', error);
    return NextResponse.json({ success: false, error: error.message || 'Server Error' }, { status: 500 });
  }
}

// DELETE: Remove a backup file from the backups/ directory
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename || !filename.endsWith('.json') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ success: false, error: 'Invalid or missing filename' }, { status: 400 });
    }

    const dir = getBackupsDir();
    const filePath = path.join(dir, filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, error: 'Backup file not found' }, { status: 404 });
    }

    fs.unlinkSync(filePath);
    console.log(`[BACKUP DELETED] Deleted backup file: ${filename}`);

    return NextResponse.json({
      success: true,
      message: `Backup file ${filename} deleted successfully.`
    }, { status: 200 });

  } catch (error: any) {
    console.error('[BACKUP DELETE ERROR]', error);
    return NextResponse.json({ success: false, error: error.message || 'Server Error' }, { status: 500 });
  }
}
