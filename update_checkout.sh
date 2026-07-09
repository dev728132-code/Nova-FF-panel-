# Update Checkout.tsx
sed -i '/if (insertError) throw insertError;/a \
\
        if (appliedPromo) {\
          try {\
            const { data: currentPromo } = await supabase.from("promo_codes").select("times_used").eq("id", appliedPromo.id).single();\
            if (currentPromo) {\
              await supabase.from("promo_codes").update({ times_used: (currentPromo.times_used || 0) + 1 }).eq("id", appliedPromo.id);\
            }\
          } catch(e) {}\
        }' src/pages/Checkout.tsx
