# Inject Promo UI
sed -i '/<div className="space-y-4 mb-6 pb-6 border-b border-gray-800">/i \
                <div className="mb-6 pb-6 border-b border-gray-800">\
                  <label className="block text-sm font-medium text-gray-400 mb-2">Have a Promo Code?</label>\
                  <div className="flex gap-2">\
                    <input \
                      type="text" \
                      value={promoCode} \
                      onChange={e => setPromoCode(e.target.value.toUpperCase())}\
                      disabled={!!appliedPromo || promoLoading}\
                      placeholder="Enter code" \
                      className="flex-1 bg-black border border-gray-800 rounded-xl px-4 py-2 text-white font-mono uppercase focus:outline-none focus:border-orange-500 disabled:opacity-50"\
                    />\
                    {!appliedPromo ? (\
                      <button \
                        type="button"\
                        onClick={handleApplyPromo}\
                        disabled={!promoCode || promoLoading}\
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"\
                      >\
                        {promoLoading ? "..." : "Apply"}\
                      </button>\
                    ) : (\
                      <button \
                        type="button"\
                        onClick={() => { setAppliedPromo(null); setPromoCode(""); }}\
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-xl text-sm font-bold transition-colors"\
                      >\
                        Remove\
                      </button>\
                    )}\
                  </div>\
                  {promoError && <p className="text-red-500 text-xs mt-2">{promoError}</p>}\
                  {appliedPromo && <p className="text-green-500 text-xs mt-2 font-medium">Promo code applied successfully!</p>}\
                </div>' src/pages/EliteGrowthCheckout.tsx
