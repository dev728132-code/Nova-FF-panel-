import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, session: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          // Fetch IP
          const ipRes = await fetch('https://api.ipify.org?format=json').catch(() => null);
          const ipData = ipRes ? await ipRes.json().catch(() => null) : null;
          const ip = ipData?.ip || 'Unknown';
          
          // Get browser/device info
          const ua = navigator.userAgent;
          const isMobile = /Mobile|Android|iP(ad|hone)/.test(ua);
          const device = isMobile ? 'Mobile' : 'Desktop';
          
          let browser = 'Unknown Browser';
          if (ua.includes('Chrome')) browser = 'Chrome';
          else if (ua.includes('Firefox')) browser = 'Firefox';
          else if (ua.includes('Safari')) browser = 'Safari';
          else if (ua.includes('Edge')) browser = 'Edge';

          // Update profiles
          await supabase.from('profiles').update({ 
            last_login: new Date().toISOString(),
            email: session.user.email
          }).eq('id', session.user.id);

          // Insert login history
          await supabase.from('login_history').insert({
            user_id: session.user.id,
            ip_address: ip,
            device,
            browser,
            location: 'Unknown' // Could use another API for location, but keep simple
          });

          // Trigger admin notification
          await supabase.from('admin_notifications').insert({
            type: 'New Login',
            message: `User ${session.user.email} has logged in from ${ip}.`
          });
        } catch (e) {
          console.error('Error recording login history:', e);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user, session, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
