import sys
import re

with open('src/app/(dashboard)/billing/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_str = '      {/* ─── LEFT: Product Browser ──────────────────────── */}'
end_str = '      {/* ─── RIGHT: Checkout UI ─────────────────────────────────── */}'

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx == -1 or end_idx == -1:
    print('Could not find boundaries')
    sys.exit(1)

new_block = '''      {/* ─── LEFT: Product Browser ──────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <BillingToolbar 
          hasItemsInCart={cart.length > 0}
          onClearCart={clearCart}
          onHoldBill={() => {}}
          onResumeBill={() => {}}
          onRepeatSale={() => {}}
        />
        
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          onBarcodeScan={() => {}}
          onVoiceInput={() => {}}
        />
        
        <CategoryTabs 
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={(cat) => { setActiveCategory(cat); setSearchQuery(''); }}
        />
        
        <QuickPicks 
          products={products}
          cart={cart as any}
          onAddProduct={addToCart}
        />
        
        <ProductGrid 
          products={filteredProducts}
          cart={cart as any}
          onAddProduct={addToCart}
        />
      </div>

'''

content = content[:start_idx] + new_block + content[end_idx:]

# Update imports to include browser components
import_str = "import { BillingToolbar, SearchBar, CategoryTabs, QuickPicks, ProductGrid } from '@/components/billing/browser';"
import_target = "import { CustomerSection, CartSection, BillSummary, PaymentSection, CheckoutCTA, PaymentMethodType } from '@/components/billing/checkout';"
content = content.replace(import_target, import_target + '\n' + import_str)

# Remove the old `categoryIcon` variable to avoid unused variables (if not used elsewhere).
# Actually let's just leave it, maybe it's not hurting. Better yet, we can try to strip it out but let's be careful.
content = re.sub(r'const categoryIcon: Record<string, string> = {[^}]+};\n', '', content)

with open('src/app/(dashboard)/billing/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Successfully updated page.tsx with left-panel redesign')
