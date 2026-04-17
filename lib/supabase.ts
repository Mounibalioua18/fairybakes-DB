import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || 'https://jbxwktnvvpsufuztpxdd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpieHdrdG52dnBzdWZ1enRweGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNTg1NzEsImV4cCI6MjA5MTkzNDU3MX0.lMeYqcinTAx92438OCeOpuTbWDgc-DEUs_ojzGxESpM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
