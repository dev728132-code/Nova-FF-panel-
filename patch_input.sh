sed -i "s/value={prices\[plan.id\] || ''}/value={prices[plan.id] !== undefined ? prices[plan.id] : ''}/g" src/components/admin/AdminResellerPrices.tsx
