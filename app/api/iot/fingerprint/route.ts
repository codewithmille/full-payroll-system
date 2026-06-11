// app/api/iot/fingerprint/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fingerprintId, secretKey } = body;

    // Security check to verify the IoT device secret
    const expectedSecret = process.env.HR_SYSTEM_IOT_SECRET || 'HR_SYSTEM_IOT_SECRET';
    if (secretKey && secretKey !== expectedSecret) {
      return NextResponse.json({ success: false, error: 'Unauthorized secret key' }, { status: 401 });
    }

    if (fingerprintId === undefined || typeof fingerprintId !== 'number') {
      return NextResponse.json({ success: false, error: 'Missing or invalid fingerprintId parameter' }, { status: 450 });
    }

    // Seed mappings for mock response feedback (representing database query)
    const mockEmployees = [
      { id: 1, name: 'Jane Doe' },
      { id: 2, name: 'John Smith' },
      { id: 3, name: 'Sarah Jenkins' },
      { id: 4, name: 'Alexander Wright' },
      { id: 5, name: 'Eleanor Vance' },
      { id: 6, name: 'Marcus Sterling' },
      { id: 7, name: 'Christina Mercado' },
      { id: 8, name: 'Dominic Alvarez' },
      { id: 9, name: 'Sofia Rodriguez' }
    ];

    const match = mockEmployees.find(e => e.id === fingerprintId);
    const employeeName = match ? match.name : `Employee #${fingerprintId}`;

    console.log(`[IoT WEBHOOK SUCCESS] Received fingerprint scan from IoT device. ID: ${fingerprintId} (${employeeName})`);

    return NextResponse.json({
      success: true,
      message: `Clock event registered for ${employeeName}`,
      employeeName,
      fingerprintId,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server Error' }, { status: 500 });
  }
}
