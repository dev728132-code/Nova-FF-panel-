# Extract and patch EliteGrowthCheckout.tsx
sed -i '/const \[hasPendingRequest, setHasPendingRequest\] = useState(false);/a \
  const [promoCode, setPromoCode] = useState("");\
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount_percentage?: number; fixed_discount?: number; id: string } | null>(null);\
  const [promoLoading, setPromoLoading] = useState(false);\
  const [promoError, setPromoError] = useState("");\
\
  const handleApplyPromo = async () => {\
    if (!promoCode.trim()) return;\
    setPromoLoading(true);\
    setPromoError("");\
    setAppliedPromo(null);\
    \
    try {\
      const { data, error } = await supabase\
        .from("promo_codes")\
        .select("*")\
        .eq("code", promoCode.toUpperCase().trim())\
        .single();\
        \
      if (error || !data) {\
        throw new Error("Invalid promo code");\
      }\
      if (!data.is_active) {\
        throw new Error("This promo code is no longer active");\
      }\
      if (data.expiry_date && new Date(data.expiry_date) < new Date()) {\
        throw new Error("This promo code has expired");\
      }\
      if (data.usage_limit && data.times_used >= data.usage_limit) {\
        throw new Error("This promo code has reached its usage limit");\
      }\
      setAppliedPromo(data);\
      toast.success("Promo code applied successfully!");\
    } catch (err: any) {\
      setPromoError(err.message);\
    } finally {\
      setPromoLoading(false);\
    }\
  };\
' src/pages/EliteGrowthCheckout.tsx

sed -i 's/const upiUrl = `upi:\/\/pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${product.price}&cu=INR`;/const finalDisplayAmount = Math.max(0, product.price - (appliedPromo ? (appliedPromo.discount_percentage ? (product.price * appliedPromo.discount_percentage \/ 100) : (appliedPromo.fixed_discount || 0)) : 0));\n  const upiUrl = `upi:\/\/pay?pa=${upiId}\&pn=${encodeURIComponent(merchantName)}\&am=${finalDisplayAmount}\&cu=INR`;/g' src/pages/EliteGrowthCheckout.tsx

sed -i 's/if (walletBalance < product.price) {/if (walletBalance < finalDisplayAmount) {/g' src/pages/EliteGrowthCheckout.tsx
sed -i 's/amount: product.price/amount: finalDisplayAmount/g' src/pages/EliteGrowthCheckout.tsx

sed -i '/if (insertError) throw insertError;/a \
\
      if (appliedPromo) {\
        try {\
          const { data: currentPromo } = await supabase.from("promo_codes").select("times_used").eq("id", appliedPromo.id).single();\
          if (currentPromo) {\
            await supabase.from("promo_codes").update({ times_used: (currentPromo.times_used || 0) + 1 }).eq("id", appliedPromo.id);\
          }\
        } catch(e) {}\
      }' src/pages/EliteGrowthCheckout.tsx

