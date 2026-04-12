import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://coloca.tu.url.aqui.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'coloca_tu_key_aqui';

// Inicialización condicional para evitar que la página se quede en blanco 
// si el usuario aún no ha puesto una URL válida en su archivo .env
let client = null;
try {
  client = createClient(supabaseUrl, supabaseKey);
} catch (error) {
  console.warn('Error al iniciar Supabase. Asegúrate de poner una URL válida en .env:', error);
}

export const supabase = client;
