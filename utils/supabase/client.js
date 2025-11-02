import { createBrowserClient } from '@supabase/ssr';

// ===================================================================
// CORREÇÃO NA MARRA: 
// Coloquei as chaves que você me mandou direto aqui.
// ===================================================================
const supabaseUrl = 'https://ubqlygisnqigiqkzbamd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVicWx5Z2lzbnFpZ2lxa3piYW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2ODI4NzgsImV4cCI6MjA3NzI1ODg3OH0.yXfhMk9intqcQs3xYBX2PcZzoPJp0iMy9RtHDMJpL7o';
// ===================================================================

// Ignora o 'process.env' e usa as chaves acima
const supabase = createBrowserClient(
  supabaseUrl,
  supabaseKey
);

// Exporta a instância 'supabase' pronta, que o resto do seu site usa
export { supabase };
