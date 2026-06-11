// app/api/admin/backups/restore/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// POST: Retrieve backup data by filename for restoration
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { filename } = body;

    if (!filename || !filename.endsWith('.json') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ success: false, error: 'Invalid or missing filename' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'backups', filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, error: 'Backup file not found on server' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const tables = JSON.parse(fileContent);

    console.log(`[BACKUP RESTORE REQUEST] Read backup file: ${filename} for restoring`);

    return NextResponse.json({
      success: true,
      filename,
      tables
    }, { status: 200 });

  } catch (error: any) {
    console.error('[BACKUP RESTORE GET ERROR]', error);
    return NextResponse.json({ success: false, error: error.message || 'Server Error' }, { status: 500 });
  }
}
