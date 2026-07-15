import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const FALLBACK_URL = 'https://ugvgogigsvcmynpinhtg.supabase.co';
const FALLBACK_KEY = 'sb_publishable_OGph_ONuJ-puNBtvE0An3g_03FTXGgH';

const getSafeUrl = () => {
  const envUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  if (envUrl && envUrl.startsWith('https://') && !envUrl.includes('YOUR_')) {
    return envUrl;
  }
  return FALLBACK_URL;
};

const getSafeKey = () => {
  const envKey = 
    process.env.VITE_SUPABASE_ANON_KEY || 
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
    process.env.SUPABASE_PUBLISHABLE_KEY || 
    process.env.SUPABASE_ANON_KEY;
  if (envKey && envKey.startsWith('sb_publishable_') && !envKey.includes('YOUR_')) {
    return envKey;
  }
  return FALLBACK_KEY;
};

const supabase = createClient(getSafeUrl(), getSafeKey());

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API route for reseller
  app.post("/api/reseller/buy", async (req, res) => {
    try {
      const { orderId, isElite, product_id, duration, user_id, payment_id } = req.body;

      if (!orderId || !product_id || !duration) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const data = new URLSearchParams();
      data.append('api_key', '57b7fa05213b10f3b7d35c9f2846e2a0');
      data.append('action', 'buy');
      data.append('product_id', product_id);
      data.append('duration', duration);

      const response = await fetch('https://xyzcheats.com/api/reseller_v1.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-master-key': 'a7f3e8b2c9d1f4a6b8c2d5e9f1a3b6c8'
        },
        body: data.toString()
      });

      const responseText = await response.text();
      let responseData: any;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { raw: responseText };
      }

      let deliveryData = "";
      let isSuccess = true;

      if (typeof responseData === 'object' && responseData !== null) {
         if (responseData.error || responseData.status === 'error') {
            isSuccess = false;
         } else {
            deliveryData = responseData.key || responseData.license || responseData.account || responseData.download || JSON.stringify(responseData);
         }
      } else {
         deliveryData = responseText;
      }

      if (isSuccess && (!deliveryData || deliveryData.trim() === "")) {
         isSuccess = false;
         responseData = { error: "Empty response from reseller API", raw: responseText };
      }

      // 9. Save Order ID, User ID, Product ID, Duration, Payment ID, API Response, Purchase Time, Delivery Data, and Status.
      try {
        await supabase.from('reseller_orders').insert({
          order_id: orderId,
          user_id: user_id || null,
          product_id: product_id,
          duration: duration,
          payment_id: payment_id || orderId,
          api_response: responseData,
          delivery_data: deliveryData,
          status: isSuccess ? 'success' : 'failed'
        });
      } catch (e) {
        console.error("Failed to insert into reseller_orders. Make sure the table exists.", e);
      }

      if (isSuccess) {
        const table = isElite ? 'elite_growth_orders' : 'orders';
        const { error: dbError } = await supabase
          .from(table)
          .update({
             product_key: deliveryData,
             order_status: 'Completed'
          })
          .eq('id', orderId);

        if (dbError) {
          console.error("DB Error updating order with API response:", dbError);
        }
        return res.json({ success: true, deliveryData });
      } else {
        const table = isElite ? 'elite_growth_orders' : 'orders';
        await supabase.from(table).update({ order_status: 'Failed', product_key: 'Failed to fetch key' }).eq('id', orderId);
        return res.status(400).json({ success: false, error: "Reseller API failed", details: responseData });
      }

    } catch (error: any) {
      console.error("Error in /api/reseller/buy:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
