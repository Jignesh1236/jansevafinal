
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fqkhbgbzsbdooyyxptlv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxa2hiZ2J6c2Jkb295eXhwdGx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODQ2NjYsImV4cCI6MjA2ODE2MDY2Nn0.DzIT9x1Q9Vy1xoNdx_Uzv1cnU9KReydKp_l8LQW1wLc'

export const supabase = createClient(supabaseUrl, supabaseKey)
