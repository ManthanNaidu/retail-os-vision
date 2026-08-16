import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the caller's token
    const decodedToken = await getAdminAuth().verifyIdToken(token);
    
    const body = await req.json();
    const { targetUid, role } = body;

    if (!targetUid || !role) {
      return NextResponse.json({ error: 'Missing targetUid or role' }, { status: 400 });
    }

    const allowedRoles = ['OWNER', 'MANAGER', 'CASHIER'];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Determine tenant. A user's tenant is either their own UID (if owner) or derived from claims
    const tenantId = decodedToken.tenant_id || decodedToken.uid;

    // Security Check: Only the OWNER of the tenant can assign roles to others
    if (decodedToken.role !== 'OWNER' && targetUid !== decodedToken.uid) {
      // Allow self-assignment of OWNER only if they have no role yet (first time setup)
      if (decodedToken.role) {
         return NextResponse.json({ error: 'Forbidden: Only OWNER can assign roles' }, { status: 403 });
      }
      // If setting self to anything other than OWNER for the first time, reject
      if (role !== 'OWNER') {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Security Check: A manager/cashier can only be assigned to the current user's tenant
    await getAdminAuth().setCustomUserClaims(targetUid, {
      role: role,
      tenant_id: tenantId
    });

    return NextResponse.json({ success: true, message: `Role ${role} assigned to user ${targetUid}` });

  } catch (error: any) {
    console.error('Error setting role:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
