import re

with open('src/pages/DigitalCheckout.tsx', 'r') as f:
    content = f.read()

content = content.replace("const state = location.state as { product: Product; selectedPlan: Plan } | null;", "const state = location.state as { product: any } | null;")
content = content.replace("const { product, selectedPlan } = state;", "const { product } = state;\n  const basePrice = product.offer_enabled && product.discount_type === 'percentage' ? (product.price - (product.price * (product.discount_value || 0) / 100)) : product.offer_enabled && product.discount_type === 'flat' ? (product.price - (product.discount_value || 0)) : product.price;\n  const finalDisplayAmount = Math.max(0, basePrice - (appliedPromo ? (appliedPromo.discount_percentage ? (basePrice * appliedPromo.discount_percentage / 100) : (appliedPromo.fixed_discount || 0)) : 0));")

content = content.replace("const finalDisplayAmount = Math.max(0, selectedPlan.price - (appliedPromo ? (appliedPromo.discount_percentage ? (selectedPlan.price * appliedPromo.discount_percentage / 100) : (appliedPromo.fixed_discount || 0)) : 0));", "")

content = content.replace("duration: selectedPlan.duration,", "duration: 'Lifetime',")
content = content.replace("({selectedPlan.duration})", "")
content = content.replace("<p className=\"text-xs text-orange-500 font-medium\">{selectedPlan.duration} Plan</p>", "<p className=\"text-xs text-orange-500 font-medium\">Digital Product</p>")

content = content.replace("₹{selectedPlan.price}", "₹{basePrice}")
content = content.replace("₹{Math.max(0, selectedPlan.price - (appliedPromo ? (appliedPromo.discount_percentage ? (selectedPlan.price * appliedPromo.discount_percentage / 100) : (appliedPromo.fixed_discount || 0)) : 0))}", "₹{finalDisplayAmount}")

with open('src/pages/DigitalCheckout.tsx', 'w') as f:
    f.write(content)

