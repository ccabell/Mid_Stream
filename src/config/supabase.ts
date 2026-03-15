/**
 * Supabase Configuration
 *
 * Connection to A360 Innovation Hub's Global Library database.
 */

export const SUPABASE_CONFIG = {
  url: 'https://gjqicqldjgvrwmtkliie.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqcWljcWxkamd2cndtdGtsaWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDEzMjksImV4cCI6MjA3MzExNzMyOX0.HE4Dhd_lPWdcF62KnAbwjXb4cLi2_gkl8dbtuksnWCg',
  // Note: Service role key should be stored in environment variables for security
  // serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
};

export const SUPABASE_TABLES = {
  products: 'products',
  services: 'services',
  categories: 'categories',
  manufacturers: 'manufacturers',
  serviceTypes: 'service_types',
  practiceProducts: 'practice_products',
  practiceServices: 'practice_services',
} as const;
