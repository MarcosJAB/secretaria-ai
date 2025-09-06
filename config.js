const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Criar cliente do Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = {
  supabase
};