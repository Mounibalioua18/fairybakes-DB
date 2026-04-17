import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jbxwktnvvpsufuztpxdd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpieHdrdG52dnBzdWZ1enRweGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNTg1NzEsImV4cCI6MjA5MTkzNDU3MX0.lMeYqcinTAx92438OCeOpuTbWDgc-DEUs_ojzGxESpM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  const { data: orders } = await supabase.from('orders').select('*').limit(3);
  console.log("ORDERS:", JSON.stringify(orders, null, 2));

  const { data: galleries } = await supabase.from('galleries').select('*').limit(3);
  console.log("GALLERIES:", JSON.stringify(galleries, null, 2));
}

inspect();
