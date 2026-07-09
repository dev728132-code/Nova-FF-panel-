sed -i 's/<span className="text-white font-medium">₹{finalDisplayAmount}<\/span>/<span className="text-white font-medium">₹{product.price}<\/span>/g' src/pages/EliteGrowthCheckout.tsx
sed -i '/<div className="flex justify-between text-sm">/i \
                  {appliedPromo && (\
                    <div className="flex justify-between text-sm mb-2">\
                      <span className="text-orange-400">Discount</span>\
                      <span className="text-orange-400 font-bold">- ₹{product.price - finalDisplayAmount}</span>\
                    </div>\
                  )}' src/pages/EliteGrowthCheckout.tsx
