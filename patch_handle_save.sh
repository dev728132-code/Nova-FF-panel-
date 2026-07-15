# We will use awk to replace handleSave function.
awk '
/const handleSave = async \(\) => {/ {
  in_handle_save = 1
  print "  const handleSave = async () => {"
  print "    setSaving(true);"
  print "    "
  print "    // First delete all existing prices for this reseller"
  print "    const { error: deleteError } = await supabase"
  print "      .from('\''reseller_prices'\'')"
  print "      .delete()"
  print "      .eq('\''reseller_id'\'', reseller.id);"
  print ""
  print "    if (deleteError) {"
  print "      alert('\''Error clearing old prices: '\'' + deleteError.message);"
  print "      setSaving(false);"
  print "      return;"
  print "    }"
  print ""
  print "    const updates = Object.keys(prices).map(planId => ({"
  print "      reseller_id: reseller.id,"
  print "      plan_id: planId,"
  print "      price: prices[planId]"
  print "    }));"
  print ""
  print "    if (updates.length > 0) {"
  print "      const { error } = await supabase"
  print "        .from('\''reseller_prices'\'')"
  print "        .insert(updates);"
  print "      "
  print "      if (error) {"
  print "        alert('\''Error saving prices: '\'' + error.message);"
  print "      } else {"
  print "        const toast = document.createElement('\''div'\'');"
  print "        toast.className = '\''fixed bottom-5 right-5 bg-green-500 text-white font-bold px-5 py-3 rounded-xl shadow-2xl z-50 animate-fade-in text-sm border border-green-400/30'\'';"
  print "        toast.innerText = '\''Prices updated successfully!'\'';"
  print "        document.body.appendChild(toast);"
  print "        setTimeout(() => toast.remove(), 3000);"
  print "      }"
  print "    } else {"
  print "      const toast = document.createElement('\''div'\'');"
  print "      toast.className = '\''fixed bottom-5 right-5 bg-green-500 text-white font-bold px-5 py-3 rounded-xl shadow-2xl z-50 animate-fade-in text-sm border border-green-400/30'\'';"
  print "      toast.innerText = '\''Reset to default prices!'\'';"
  print "      document.body.appendChild(toast);"
  print "      setTimeout(() => toast.remove(), 3000);"
  print "    }"
  print "    setSaving(false);"
  print "  };"
  next
}
in_handle_save && /^  return \(/ {
  in_handle_save = 0
}
!in_handle_save { print $0 }
' src/components/admin/AdminResellerPrices.tsx > tmp.tsx && mv tmp.tsx src/components/admin/AdminResellerPrices.tsx
