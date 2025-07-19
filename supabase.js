const { createClient } = supabase;

const supabaseUrl = 'https://hurfwwefneepldwxfhhm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1cmZ3d2VmbmVlcGxkd3hmaGhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5NzkxOTYsImV4cCI6MjA2NzU1NTE5Nn0.nubvnDlqSuEEdjPLzjVeoqug31MBW5_xi4-Ikc_b1bE';

const supabaseClient = createClient(supabaseUrl, supabaseKey);

window.supabase = supabaseClient; 