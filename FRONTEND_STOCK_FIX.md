# Frontend Stock Calculation Fix

## Problem
The inventory dashboard was showing all 93 products as "low stock" or "out of stock" even after fixing the backend seeder. This was because the frontend was using the deprecated `Product.stockQuantity` field (which is always 0) instead of calculating from actual `Inventory` records.

## Root Cause
**File**: `src/app/dashboard/inventory/page.tsx` (Lines 95-96)

```typescript
// OLD CODE - Using deprecated field
const lowStockProducts = products?.filter((p) => p.stockQuantity < 10).length || 0;
const outOfStockProducts = products?.filter((p) => p.stockQuantity === 0).length || 0;
```

Since `Product.stockQuantity` is deprecated and always 0, this resulted in:
- All 93 products counted as "out of stock"
- All 93 products counted as "low stock" (since 0 < 10)

## Solution
Calculate stock statistics from actual `Inventory` collection data:

```typescript
// NEW CODE - Calculate from inventory records
const productStockStatus = new Map<string, { total: number; isLow: boolean; isOut: boolean }>();

inventory?.forEach((inv) => {
    const productId = typeof inv.productId === 'string' ? inv.productId : inv.productId._id;
    const existing = productStockStatus.get(productId) || { total: 0, isLow: false, isOut: false };
    existing.total += inv.quantity;
    
    // Check if any warehouse has low stock or is out of stock
    if (inv.quantity === 0) existing.isOut = true;
    if (inv.quantity < inv.minimumStockLevel) existing.isLow = true;
    
    productStockStatus.set(productId, existing);
});

const lowStockProducts = Array.from(productStockStatus.values()).filter(s => s.isLow).length;
const outOfStockProducts = Array.from(productStockStatus.values()).filter(s => s.isOut).length;
```

## What This Does
1. **Aggregates inventory** across all warehouses per product
2. **Checks actual stock levels** against minimum thresholds
3. **Flags products** that are low or out of stock in ANY warehouse
4. **Counts unique products** with stock issues (not total inventory records)

## Impact
✅ Stock statistics now reflect reality  
✅ Low stock count based on actual inventory vs minimum levels  
✅ Out of stock count based on actual zero-quantity warehouses  
✅ No more "all 93 products" showing as problematic  

## Testing
After refreshing the frontend, you should see:
- Accurate low stock counts (products below minimum in any warehouse)
- Accurate out of stock counts (products with zero quantity in any warehouse)
- Most products showing as "In Stock" with proper quantities

## Related Changes
This fix complements the backend changes:
1. ✅ Backend: Fixed inventory seeder (min to 70% of max)
2. ✅ Backend: Deprecated Product.stockQuantity
3. ✅ Frontend: Calculate from Inventory collection
