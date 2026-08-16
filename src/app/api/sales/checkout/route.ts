import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb, isAdminConfigured } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Graceful fallback for environments missing Firebase Admin credentials
    if (!isAdminConfigured) {
      return NextResponse.json({ success: true, bypass: true });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAdminAuth().verifyIdToken(token);
    const tenantId = decodedToken.tenant_id || decodedToken.uid;
    
    // Enforce RBAC
    if (decodedToken.role && !['OWNER', 'MANAGER', 'CASHIER'].includes(decodedToken.role)) {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { cart, customerId, customerName, discount = 0, paymentMethod } = body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Role-based discount limits
    const role = decodedToken.role || 'OWNER'; // default to owner if no role
    const maxDiscountPercent = role === 'CASHIER' ? 5 : role === 'MANAGER' ? 20 : 100;

    // Read the tenant's current data from Firestore
    const tenantRef = getAdminDb().collection('users').doc(tenantId);
    const tenantDoc = await tenantRef.get();
    
    if (!tenantDoc.exists) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const tenantData = tenantDoc.data() || {};
    const products: any[] = tenantData.products || [];
    let sales: any[] = tenantData.sales || [];
    
    let subtotal = 0;
    let gstAmount = 0;
    const validatedCart = [];

    // Calculate totals securely using authoritative product data
    for (const item of cart) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
         return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 });
      }
      
      if (item.quantity <= 0) {
         return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
      }

      const itemTotal = product.sellingPrice * item.quantity;
      const taxable = itemTotal * ((product.gstPercent || 0) / 100);
      
      subtotal += itemTotal;
      gstAmount += taxable;
      
      validatedCart.push({
        ...item,
        name: product.name,
        sellingPrice: product.sellingPrice,
        gstPercent: product.gstPercent || 0,
        total: itemTotal
      });
      
      // Deduct stock
      const factor = product.sellingConversionFactor || 1;
      product.stock = Math.max(0, product.stock - (item.quantity * factor));
    }

    // Validate discount
    if (discount < 0) {
       return NextResponse.json({ error: 'Negative discount not allowed' }, { status: 400 });
    }
    const discountPercent = (discount / subtotal) * 100;
    if (discountPercent > maxDiscountPercent) {
       return NextResponse.json({ error: `Discount exceeds maximum allowed for role ${role} (${maxDiscountPercent}%)` }, { status: 403 });
    }

    const total = subtotal + gstAmount - discount;

    const sale = {
      id: `s-${Date.now()}`,
      invoiceNumber: `INV-${Date.now()}`,
      customerId: customerId || null,
      customerName: customerName || 'Walk-in Customer',
      items: validatedCart,
      subtotal,
      discount,
      gstAmount,
      total,
      paymentMethod,
      status: 'completed',
      createdAt: new Date().toISOString(),
      processedBy: decodedToken.uid
    };

    sales.push(sale);

    // Save back to Firestore securely
    await tenantRef.update({
       products,
       sales
    });

    return NextResponse.json({ success: true, sale, products });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
