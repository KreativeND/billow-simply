
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://axvufhfhukfngngmyvbn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4dnVmaGZodWtmbmduZ215dmJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MTcyODksImV4cCI6MjA1ODE5MzI4OX0.06iyn_DD_xtDib5asPTApMiT4COoDz_yT_TxB5UwXF0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
