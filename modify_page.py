import sys

with open('src/app/(dashboard)/billing/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the block from <div className="lg:w-[360px] flex flex-col ... to the end of the UPI modal
start_str = '      {/* ─── RIGHT: Cart ─────────────────────────────────── */}'
end_str = '      {/* ─── Invoice Modal ────────────────────────────────── */}'

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx == -1 or end_idx == -1:
    print('Could not find boundaries')
    sys.exit(1)

new_block = '''      {/* ─── RIGHT: Checkout UI ─────────────────────────────────── */}
      <div className="lg:w-[420px] flex flex-col h-full overflow-y-auto bg-[#F8F9FB] border-t lg:border-t-0 lg:border-l border-[#E9EDF2] p-4 gap-4 custom-scrollbar">
        {(!selectedCustomer && !isWalkIn) ? (
          <CustomerSection 
            selectedCustomer={selectedCustomer}
            onSelectCustomer={setCustomer}
            isWalkIn={isWalkIn}
            onSetWalkIn={setIsWalkIn}
          />
        ) : (
          <>
            <CustomerSection 
              selectedCustomer={selectedCustomer}
              onSelectCustomer={setCustomer}
              isWalkIn={isWalkIn}
              onSetWalkIn={setIsWalkIn}
            />
            
            <CartSection 
              cart={cart}
              onUpdateQuantity={updateQuantity}
              onRemoveFromCart={removeFromCart}
              onClearCart={clearCart}
              onAddNote={() => {}}
            />
            
            {cart.length > 0 && (
              <>
                <BillSummary 
                  subtotal={getSubtotal()}
                  discount={discount}
                  gst={getGSTAmount()}
                  total={getTotal()}
                  itemCount={cart.reduce((s, i) => s + i.quantity, 0)}
                  onApplyDiscount={(amt, type) => {
                    if (type === 'percent') {
                      setDiscount(Math.round(getSubtotal() * (amt / 100)));
                    } else {
                      setDiscount(amt);
                    }
                  }}
                />
                
                <PaymentSection 
                  total={getTotal()}
                  selectedMethod={paymentMethod as any}
                  onSelectMethod={(m) => setPaymentMethod(m)}
                  amountReceived={amountReceived}
                  onAmountReceivedChange={setAmountReceived}
                  onConfirmUpiPayment={finalizeSale}
                />
                
                <CheckoutCTA 
                  total={getTotal()}
                  disabled={cart.length === 0}
                  onClick={handleCheckoutClick}
                />
              </>
            )}
          </>
        )}
      </div>

'''

content = content[:start_idx] + new_block + content[end_idx:]

# Import statements
import_str = "import { CustomerSection, CartSection, BillSummary, PaymentSection, CheckoutCTA, PaymentMethodType } from '@/components/billing/checkout';"
import_target = "import SaleSuccessModal from '@/components/billing/sale-success';"
content = content.replace(import_target, import_target + '\n' + import_str)

# Add isWalkIn state
state_target = "const [showCustomerSearch, setShowCustomerSearch] = useState(false);"
state_str = "const [isWalkIn, setIsWalkIn] = useState(false);\n  const [amountReceived, setAmountReceived] = useState<number>(0);"
content = content.replace(state_target, state_target + '\n  ' + state_str)

with open('src/app/(dashboard)/billing/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Successfully updated page.tsx')
