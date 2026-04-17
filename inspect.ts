import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jbxwktnvvpsufuztpxdd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpieHdrdG52dnBzdWZ1enRweGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNTg1NzEsImV4cCI6MjA5MTkzNDU3MX0.lMeYqcinTAx92438OCeOpuTbWDgc-DEUs_ojzGxESpM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  console.log("BUCKETS:", JSON.stringify(buckets, null, 2), error);
}

inspect();
