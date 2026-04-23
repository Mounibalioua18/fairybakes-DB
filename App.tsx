
import React, { useState, useEffect } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  useEffect(() => {
    const trackSession = async () => {
      const sessionId = localStorage.getItem('fairy_session_id') || crypto.randomUUID();
      localStorage.setItem('fairy_session_id', sessionId);
      
      try {
        await supabase
          .from('site_stats')
          .upsert({ 
            session_id: sessionId,
            last_ping: new Date().toISOString()
          }, { onConflict: 'session_id' });
      } catch (e) {
        // Table might not exist yet
      }
    };

    trackSession();
    const interval = setInterval(trackSession, 15000); // Ping every 15s for high precision
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen selection:bg-rose-100 selection:text-rose-900 overflow-x-hidden bg-[#fdfaf6]">
      {/* Subtle Background Decorations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-rose-100/30 rounded-full blur-[120px]"></div>
        <div className="absolute top-[60%] right-[5%] w-[500px] h-[500px] bg-stone-200/40 rounded-full blur-[150px]"></div>
      </div>
      
      <div className="relative z-10">
        <main>
          <AdminDashboard onClose={() => {}} />
        </main>
        
        <footer className="bg-stone-950 text-white py-12 px-6 md:px-12 text-center">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-serif tracking-[0.15em] uppercase text-white font-bold">
                Fairy
              </span>
              <span className="text-2xl font-signature text-rose-400 -ml-1 -rotate-6 transform translate-y-1">
                bakes
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-stone-500 ml-4">Studio Manager</span>
            </div>
            <p className="text-stone-500 text-[10px] uppercase tracking-[0.5em]">
              &copy; {new Date().getFullYear()} FAIRYBAKES STUDIO. ALL RIGHTS RESERVED.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;